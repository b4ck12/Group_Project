import logging
from typing import Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

_http_client: Optional[httpx.AsyncClient] = None


async def init_http_client() -> None:
    """Khởi tạo shared httpx.AsyncClient singleton cho toàn ứng dụng."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        limits = httpx.Limits(
            max_connections=100,
            max_keepalive_connections=20,
        )
        timeout = httpx.Timeout(
            timeout=settings.HTTP_CLIENT_TIMEOUT,
            connect=5.0,
        )
        _http_client = httpx.AsyncClient(
            limits=limits,
            timeout=timeout,
        )
        logger.info("Đã khởi tạo shared HTTPX AsyncClient.")


async def close_http_client() -> None:
    """Đóng HTTPX AsyncClient khi FastAPI shutdown."""
    global _http_client
    if _http_client is not None and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None
        logger.info("Đã đóng shared HTTPX AsyncClient.")


def get_http_client() -> httpx.AsyncClient:
    """Lấy shared HTTPX AsyncClient instance."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        # Fallback an toàn nếu chưa gọi init_http_client trong lifespan
        limits = httpx.Limits(max_connections=100, max_keepalive_connections=20)
        timeout = httpx.Timeout(timeout=settings.HTTP_CLIENT_TIMEOUT, connect=5.0)
        _http_client = httpx.AsyncClient(limits=limits, timeout=timeout)
    return _http_client
