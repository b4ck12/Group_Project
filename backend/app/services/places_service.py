from abc import ABC, abstractmethod
import asyncio
import logging
from typing import Any, Awaitable, Callable, List, Optional, TypeVar

import pybreaker

from app.core.config import settings
from app.schemas.place import POIItem, PlaceDetailResponse, PlaceSearchResponse

logger = logging.getLogger(__name__)
T = TypeVar("T")


class BaseTravelProvider(ABC):
    """Abstract interface for Pluggable Travel Providers (SOLID - OCP/DIP)."""

    provider_name: str = "base"

    @abstractmethod
    async def search_places(
        self,
        keyword: Optional[str] = None,
        category: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius: int = 5000,
    ) -> PlaceSearchResponse:
        """Search POIs with optional category, geo-location, and radius."""
        raise NotImplementedError

    @abstractmethod
    async def get_place_details(self, place_id: str) -> PlaceDetailResponse:
        """Get enriched place details by ID."""
        raise NotImplementedError


def create_places_breaker(
    fail_max: int = settings.CIRCUIT_BREAKER_FAIL_MAX,
    reset_timeout: int = settings.CIRCUIT_BREAKER_RESET_TIMEOUT,
) -> pybreaker.CircuitBreaker:
    """Factory creating an isolated pybreaker CircuitBreaker instance."""
    return pybreaker.CircuitBreaker(
        fail_max=fail_max,
        reset_timeout=reset_timeout,
        name="google_places_breaker",
    )


places_circuit_breaker = create_places_breaker()


async def call_with_breaker(
    breaker: pybreaker.CircuitBreaker,
    func: Callable[..., Awaitable[T]],
    *args: Any,
    timeout: float = settings.PLACES_API_TIMEOUT,
    **kwargs: Any,
) -> T:
    """
    Execute an async callable inside a PyBreaker CircuitBreaker with strict timeout.
    Guarantees state transitions and fast-fails with CircuitBreakerError when circuit is OPEN.
    """
    if breaker.current_state == "open":
        # PyBreaker check: raises CircuitBreakerError if still OPEN, or transitions to HALF-OPEN
        breaker.call(lambda: None)

    try:
        result = await asyncio.wait_for(func(*args, **kwargs), timeout=timeout)
        # Record success
        breaker.call(lambda: None)
        return result
    except Exception as exc:
        # Record failure into breaker
        def _fail() -> None:
            raise exc

        try:
            breaker.call(_fail)
        except Exception:
            pass
        raise
