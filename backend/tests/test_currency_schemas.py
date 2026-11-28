import pytest
from pydantic import ValidationError

from app.schemas.currency import (
    ASEAN_CURRENCIES,
    CurrencyConversion,
    ExchangeRateResponse,
)


def test_exchange_rate_response_valid_and_llm_compact_dict():
    resp = ExchangeRateResponse(
        base_currency="vnd",
        provider="open_er_api",
        updated_at="Fri, 20 Nov 2026 00:02:31 +0000",
        rates={
            "VND": 1.0,
            "THB": 0.00135,
            "SGD": 0.000053,
            "MYR": 0.000175,
            "USD": 0.0000394,
        },
        conversion=CurrencyConversion(
            from_currency="vnd",
            to_currency="thb",
            amount=1000000.0,
            rate=0.00135,
            converted_amount=1350.0,
        ),
        asean_only=True,
        is_live_data=True,
    )

    assert len(ASEAN_CURRENCIES) == 10
    assert resp.base_currency == "VND"
    assert resp.conversion is not None
    assert resp.conversion.from_currency == "VND"
    assert resp.conversion.to_currency == "THB"
    assert resp.conversion.converted_amount == 1350.0

    compact = resp.to_llm_compact_dict()
    assert compact["base"] == "VND"
    assert compact["target"] == "THB"
    assert compact["rate"] == 0.00135
    assert compact["converted_amount"] == 1350.0
    assert "updated_at" not in compact  # Pruned to save LLM tokens


def test_exchange_rate_response_rejects_invalid_currency_code():
    with pytest.raises(ValidationError):
        ExchangeRateResponse(
            base_currency="VN1",
            provider="open_er_api",
            rates={"THB": 0.00135},
        )
