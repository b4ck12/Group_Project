from typing import Any, Dict, Optional, Tuple

from pydantic import BaseModel, Field, field_validator

ASEAN_CURRENCIES: Tuple[str, ...] = (
    "VND",  # Vietnam Dong
    "THB",  # Thai Baht
    "SGD",  # Singapore Dollar
    "MYR",  # Malaysian Ringgit
    "IDR",  # Indonesian Rupiah
    "PHP",  # Philippine Peso
    "KHR",  # Cambodian Riel
    "LAK",  # Lao Kip
    "MMK",  # Myanmar Kyat
    "BND",  # Brunei Dollar
)

ASEAN_PLUS_USD: Tuple[str, ...] = (*ASEAN_CURRENCIES, "USD")


def _validate_iso_currency(value: str) -> str:
    cleaned = value.strip().upper()
    if len(cleaned) != 3 or not cleaned.isalpha():
        raise ValueError(
            "Currency code must be a 3-letter ISO-4217 alphabetic code (e.g. VND, THB, SGD)"
        )
    return cleaned


class CurrencyConversion(BaseModel):
    """Result of converting a specific amount from base to target currency (TASK-208)."""

    from_currency: str = Field(..., min_length=3, max_length=3)
    to_currency: str = Field(..., min_length=3, max_length=3)
    amount: float = Field(..., gt=0)
    rate: float = Field(..., gt=0)
    converted_amount: float = Field(..., ge=0)

    @field_validator("from_currency", "to_currency")
    @classmethod
    def normalize_codes(cls, v: str) -> str:
        return _validate_iso_currency(v)


class ExchangeRateResponse(BaseModel):
    """Response payload for GET /api/v1/exchange-rate (TASK-208)."""

    base_currency: str = Field(..., min_length=3, max_length=3)
    provider: str = Field(
        ...,
        description="Data source: open_er_api (free keyless), exchangerate_api_v6, or custom_scraper",
    )
    updated_at: Optional[str] = Field(
        default=None,
        description="Last update timestamp returned by the forex provider",
    )
    rates: Dict[str, float] = Field(
        default_factory=dict,
        description="Exchange rates keyed by ISO-4217 currency code",
    )
    conversion: Optional[CurrencyConversion] = None
    asean_only: bool = True
    is_live_data: bool = True

    @field_validator("base_currency")
    @classmethod
    def normalize_base_currency(cls, v: str) -> str:
        return _validate_iso_currency(v)

    def to_llm_compact_dict(self) -> Dict[str, Any]:
        """Compact ~35-token summary for AI Agent budget prompts (Supervisor Item 3.2)."""
        if self.conversion is not None:
            return {
                "base": self.conversion.from_currency,
                "target": self.conversion.to_currency,
                "rate": self.conversion.rate,
                "amount": self.conversion.amount,
                "converted_amount": self.conversion.converted_amount,
            }
        return {
            "base": self.base_currency,
            "rates": {
                k: self.rates[k]
                for k in ("VND", "THB", "SGD", "MYR", "USD")
                if k in self.rates
            },
        }
