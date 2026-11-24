from unittest.mock import AsyncMock, MagicMock, patch
import pybreaker
import pytest

from app.services import cache_service
from app.services.cache_service import InMemoryCache
from app.services.currency_service import (
    CurrencyService,
    UnsupportedCurrencyError,
    create_currency_breaker,
)


@pytest.fixture(autouse=True)
def isolated_memory_cache(monkeypatch):
    mem_cache = InMemoryCache()
    monkeypatch.setattr(cache_service, "_get_active_cache", lambda: mem_cache)
    return mem_cache


def _mock_open_er_api_payload(base: str = "VND"):
    return {
        "result": "success",
        "base_code": base,
        "time_last_update_utc": "Fri, 20 Nov 2026 00:02:31 +0000",
        "rates": {
            "VND": 1.0,
            "THB": 0.00135,
            "SGD": 0.000053,
            "MYR": 0.000175,
            "IDR": 0.62,
            "PHP": 0.0023,
            "KHR": 0.16,
            "LAK": 0.86,
            "MMK": 0.083,
            "BND": 0.000053,
            "USD": 0.0000394,
            "EUR": 0.0000365,
            "JPY": 0.00605,
        },
    }


def _mock_exchangerate_v6_payload(base: str = "USD"):
    return {
        "result": "success",
        "base_code": base,
        "time_last_update_utc": "Fri, 20 Nov 2026 00:00:01 +0000",
        "conversion_rates": {
            "USD": 1.0,
            "VND": 25400.0,
            "THB": 34.25,
            "SGD": 1.34,
            "MYR": 4.45,
            "IDR": 15800.0,
            "PHP": 58.5,
            "KHR": 4060.0,
            "LAK": 21900.0,
            "MMK": 2100.0,
            "BND": 1.34,
        },
    }


@pytest.mark.asyncio
async def test_currency_service_uses_open_er_api_keyless_and_shares_12h_base_cache():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = _mock_open_er_api_payload("VND")

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)

    service = CurrencyService(api_key="", breaker=create_currency_breaker())

    with patch("app.services.currency_service.get_http_client", return_value=mock_client):
        # Call 1: ASEAN list for VND (cache miss -> fetches upstream)
        res_asean = await service.get_exchange_rates(base="vnd")
        # Call 2: Convert 1,000,000 VND -> THB (should hit the SAME 12h base=VND cache!)
        res_thb = await service.get_exchange_rates(base="VND", target="thb", amount=1000000)
        # Call 3: Convert 2,000,000 VND -> SGD (should ALSO hit the SAME 12h cache!)
        res_sgd = await service.get_exchange_rates(base="VND", target="SGD", amount=2000000)

    assert res_asean.provider == "open_er_api"
    assert res_asean.base_currency == "VND"
    assert "THB" in res_asean.rates
    assert "SGD" in res_asean.rates
    assert "EUR" not in res_asean.rates  # Filtered to ASEAN + USD by default

    assert res_thb.conversion is not None
    assert res_thb.conversion.to_currency == "THB"
    assert res_thb.conversion.converted_amount == 1350.0

    assert res_sgd.conversion is not None
    assert res_sgd.conversion.to_currency == "SGD"
    assert res_sgd.conversion.converted_amount == 106.0

    # Upstream HTTP GET must only be called ONCE across all 3 requests
    assert mock_client.get.await_count == 1


@pytest.mark.asyncio
async def test_currency_service_uses_exchangerate_v6_when_api_key_provided():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = _mock_exchangerate_v6_payload("USD")

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)

    service = CurrencyService(api_key="test-er-key", breaker=create_currency_breaker())

    with patch("app.services.currency_service.get_http_client", return_value=mock_client):
        res = await service.get_exchange_rates(base="USD", target="VND", amount=100)

    assert res.provider == "exchangerate_api_v6"
    assert res.conversion is not None
    assert res.conversion.rate == 25400.0
    assert res.conversion.converted_amount == 2540000.0


@pytest.mark.asyncio
async def test_currency_service_raises_unsupported_currency_error():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = _mock_open_er_api_payload("VND")

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)

    service = CurrencyService(api_key="", breaker=create_currency_breaker())

    with patch("app.services.currency_service.get_http_client", return_value=mock_client):
        with pytest.raises(UnsupportedCurrencyError):
            await service.get_exchange_rates(base="VND", target="ZZZ")


@pytest.mark.asyncio
async def test_currency_service_propagates_circuit_breaker_error():
    breaker = create_currency_breaker(fail_max=1, reset_timeout=60)
    mock_client = AsyncMock()
    mock_client.get = AsyncMock(side_effect=RuntimeError("Upstream forex timeout"))

    service = CurrencyService(api_key="", breaker=breaker)

    with patch("app.services.currency_service.get_http_client", return_value=mock_client):
        with pytest.raises(RuntimeError):
            await service.get_exchange_rates(base="THB")
        # Next call must fast-fail with CircuitBreakerError
        with pytest.raises(pybreaker.CircuitBreakerError):
            await service.get_exchange_rates(base="SGD")


@pytest.mark.asyncio
async def test_custom_rates_hook_overrides_and_falls_back_on_error():
    async def leader_bank_scraper(base: str):
        return {"VND": 1.0, "THB": 0.0014, "SGD": 0.000055, "USD": 0.00004}

    service = CurrencyService(
        api_key="",
        breaker=create_currency_breaker(),
        custom_rates_fn=leader_bank_scraper,
    )
    res = await service.get_exchange_rates(base="VND", target="THB", amount=1000000)
    assert res.provider == "custom_scraper"
    assert res.conversion is not None
    assert res.conversion.converted_amount == 1400.0

    # If leader scraper fails, must fall back automatically to open.er-api.com
    async def broken_scraper(base: str):
        raise RuntimeError("Bank portal CAPTCHA blocked")

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = _mock_open_er_api_payload("SGD")
    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)

    service_fb = CurrencyService(
        api_key="",
        breaker=create_currency_breaker(),
        custom_rates_fn=broken_scraper,
    )
    with patch("app.services.currency_service.get_http_client", return_value=mock_client):
        res_fb = await service_fb.get_exchange_rates(base="SGD", target="THB")

    assert res_fb.provider == "open_er_api"
    assert "THB" in res_fb.rates
