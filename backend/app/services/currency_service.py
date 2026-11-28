from abc import ABC, abstractmethod
from decimal import Decimal, ROUND_HALF_UP
import logging
from typing import Any, Awaitable, Callable, Dict, Optional

import pybreaker

from app.core.config import settings
from app.core.http_client import get_http_client
from app.schemas.currency import (
    ASEAN_CURRENCIES,
    ASEAN_PLUS_USD,
    CurrencyConversion,
    ExchangeRateResponse,
)
from app.services.cache_service import cache_response
from app.services.places_service import call_with_breaker

logger = logging.getLogger(__name__)

CustomRatesCallable = Callable[[str], Awaitable[Dict[str, float]]]


class UnsupportedCurrencyError(ValueError):
    """Raised when a requested ISO-4217 currency code is not supported by the provider."""


class BaseCurrencyProvider(ABC):
    """Abstract interface for pluggable forex rate providers (SOLID - OCP/DIP)."""

    provider_name: str = "base_currency"

    @abstractmethod
    async def get_exchange_rates(
        self,
        base: str = "VND",
        target: Optional[str] = None,
        amount: Optional[float] = None,
        include_all: bool = False,
    ) -> ExchangeRateResponse:
        """Fetch exchange rates for a base currency and optionally convert an amount."""
        raise NotImplementedError


def create_currency_breaker(
    fail_max: int = settings.CIRCUIT_BREAKER_FAIL_MAX,
    reset_timeout: int = settings.CIRCUIT_BREAKER_RESET_TIMEOUT,
) -> pybreaker.CircuitBreaker:
    """Create an isolated PyBreaker instance for Currency APIs (Bulkhead isolation)."""
    return pybreaker.CircuitBreaker(
        fail_max=fail_max,
        reset_timeout=reset_timeout,
        name="currency_api_breaker",
    )


currency_circuit_breaker = create_currency_breaker()


def _calculate_converted_amount(amount: float, rate: float) -> float:
    """Compute exact converted amount using Decimal to avoid binary floating-point drift."""
    result = (Decimal(str(amount)) * Decimal(str(rate))).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    return float(result)


class CurrencyService(BaseCurrencyProvider):
    """
    Zero-Cost 3-Tier Currency Converter Adapter (TASK-208):
      - Tier 1: Optional `custom_rates_fn` hook for Team Leader's bank/forex scraper
      - Tier 2: ExchangeRate-API v6 (when EXCHANGE_RATE_API_KEY is configured)
      - Tier 3: Open ExchangeRate-API (`open.er-api.com`) (DEFAULT 100% free, keyless,
                real live rates covering all 10 ASEAN currencies + USD/EUR/JPY/KRW)
    Protected by isolated PyBreaker and 12-hour base-level Upstash Redis L2 Cache (ttl=43200).
    """

    provider_name: str = "currency_service"

    def __init__(
        self,
        api_key: Optional[str] = None,
        keyed_base_url: Optional[str] = None,
        open_base_url: Optional[str] = None,
        breaker: Optional[pybreaker.CircuitBreaker] = None,
        custom_rates_fn: Optional[CustomRatesCallable] = None,
    ):
        self.api_key = api_key if api_key is not None else settings.EXCHANGE_RATE_API_KEY
        self.keyed_base_url = (
            keyed_base_url or settings.EXCHANGE_RATE_API_BASE_URL
        ).rstrip("/")
        self.open_base_url = (
            open_base_url or settings.EXCHANGE_RATE_OPEN_BASE_URL
        ).rstrip("/")
        self.breaker = breaker or currency_circuit_breaker
        self.custom_rates_fn = custom_rates_fn

    def __repr__(self) -> str:
        # Constant string because @cache_response includes str(self) in Redis cache keys
        return "CurrencyService(provider=currency_service)"

    def __str__(self) -> str:
        return "CurrencyService"

    async def _fetch_from_open_er_api(self, base: str) -> Dict[str, Any]:
        client = get_http_client()
        url = f"{self.open_base_url}/latest/{base}"

        async def _call() -> Dict[str, Any]:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()

        payload = await call_with_breaker(
            self.breaker, _call, timeout=settings.CURRENCY_API_TIMEOUT
        )
        if payload.get("result") == "error":
            error_type = payload.get("error-type", "unsupported-code")
            raise UnsupportedCurrencyError(
                f"Unsupported base currency '{base}': {error_type}"
            )

        raw_rates = payload.get("rates") or {}
        if not raw_rates:
            raise UnsupportedCurrencyError(
                f"No exchange rates returned for base currency '{base}'"
            )

        return {
            "provider": "open_er_api",
            "updated_at": payload.get("time_last_update_utc"),
            "rates": {str(k).upper(): float(v) for k, v in raw_rates.items()},
        }

    async def _fetch_from_exchangerate_v6(self, base: str) -> Dict[str, Any]:
        client = get_http_client()
        url = f"{self.keyed_base_url}/{self.api_key}/latest/{base}"

        async def _call() -> Dict[str, Any]:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()

        payload = await call_with_breaker(
            self.breaker, _call, timeout=settings.CURRENCY_API_TIMEOUT
        )
        if payload.get("result") == "error":
            error_type = payload.get("error-type", "unsupported-code")
            raise UnsupportedCurrencyError(
                f"Unsupported base currency '{base}': {error_type}"
            )

        raw_rates = payload.get("conversion_rates") or payload.get("rates") or {}
        if not raw_rates:
            raise UnsupportedCurrencyError(
                f"No exchange rates returned for base currency '{base}'"
            )

        return {
            "provider": "exchangerate_api_v6",
            "updated_at": payload.get("time_last_update_utc"),
            "rates": {str(k).upper(): float(v) for k, v in raw_rates.items()},
        }

    @cache_response(ttl=settings.CURRENCY_CACHE_TTL, prefix="exchange_rates")
    async def _get_base_rates_cached(self, base: str) -> Dict[str, Any]:
        """
        Fetch and cache the full rate table for `base` for 12 hours (43200s).
        Caching at base-currency granularity lets all target/amount queries share 1 Redis key.
        """
        # Tier 1: Pluggable Leader Scraper / Reverse-API Hook
        if self.custom_rates_fn is not None:
            try:
                custom_rates = await self.custom_rates_fn(base)
                if custom_rates:
                    return {
                        "provider": "custom_scraper",
                        "updated_at": None,
                        "rates": {
                            str(k).upper(): float(v) for k, v in custom_rates.items()
                        },
                    }
            except Exception as exc:
                logger.warning(
                    "Custom currency scraper hook failed for base '%s': %s. Falling back to public provider.",
                    base,
                    exc,
                )

        # Tier 2: ExchangeRate-API v6 if API key is configured
        if self.api_key and self.api_key.strip():
            return await self._fetch_from_exchangerate_v6(base)

        # Tier 3: Open ExchangeRate-API (100% Free, Keyless, Live ASEAN Rates)
        return await self._fetch_from_open_er_api(base)

    async def get_exchange_rates(
        self,
        base: str = "VND",
        target: Optional[str] = None,
        amount: Optional[float] = None,
        include_all: bool = False,
    ) -> ExchangeRateResponse:
        """
        Return live exchange rates for `base` (cached 12h in Redis).
        - If `target` is omitted: returns all 10 ASEAN currencies + USD (or all global currencies if `include_all=True`).
        - If `target` is specified: returns the `target` rate and optional `conversion` when `amount` is given.
        """
        norm_base = base.strip().upper()
        norm_target = target.strip().upper() if target else None

        cached = await self._get_base_rates_cached(base=norm_base)
        all_rates: Dict[str, float] = cached["rates"]
        provider: str = cached["provider"]
        updated_at: Optional[str] = cached.get("updated_at")

        conversion: Optional[CurrencyConversion] = None

        if norm_target is not None:
            if norm_target not in all_rates:
                raise UnsupportedCurrencyError(
                    f"Target currency '{norm_target}' is not supported for base '{norm_base}'."
                )
            target_rate = float(all_rates[norm_target])
            filtered_rates = {norm_target: target_rate}
            if amount is not None:
                conversion = CurrencyConversion(
                    from_currency=norm_base,
                    to_currency=norm_target,
                    amount=amount,
                    rate=target_rate,
                    converted_amount=_calculate_converted_amount(amount, target_rate),
                )
            return ExchangeRateResponse(
                base_currency=norm_base,
                provider=provider,
                updated_at=updated_at,
                rates=filtered_rates,
                conversion=conversion,
                asean_only=norm_target in ASEAN_CURRENCIES,
                is_live_data=True,
            )

        if include_all:
            selected_rates = dict(all_rates)
            asean_only = False
        else:
            selected_rates = {
                code: all_rates[code]
                for code in ASEAN_PLUS_USD
                if code in all_rates
            }
            asean_only = True

        return ExchangeRateResponse(
            base_currency=norm_base,
            provider=provider,
            updated_at=updated_at,
            rates=selected_rates,
            conversion=None,
            asean_only=asean_only,
            is_live_data=True,
        )
