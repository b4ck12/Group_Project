import inspect
import logging
from typing import Any, AsyncIterator, Optional
from redis.asyncio import ConnectionPool, Redis
from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_pool: Optional[ConnectionPool] = None
_redis_client: Optional[Redis] = None


async def init_redis_pool() -> None:
    """Khởi tạo Redis Connection Pool và client toàn cục."""
    global _redis_pool, _redis_client
    if _redis_pool is None:
        url = settings.REDIS_URL
        is_tls = url.startswith("rediss://")
        logger.info(f"Khởi tạo Redis pool (TLS={is_tls}) tới {url.split('@')[-1] if '@' in url else url}")
        _redis_pool = ConnectionPool.from_url(
            url,
            decode_responses=True,
            max_connections=20,
            socket_timeout=5.0,
        )
        _redis_client = Redis(connection_pool=_redis_pool)


async def close_redis_pool() -> None:
    """Đóng sạch sẽ Redis client và Connection Pool (FastAPI shutdown)."""
    global _redis_pool, _redis_client
    if _redis_client is not None:
        await _redis_client.aclose()
        _redis_client = None
    if _redis_pool is not None:
        res = _redis_pool.disconnect()
        if inspect.isawaitable(res):
            await res
        _redis_pool = None
    logger.info("Đã đóng Redis Connection Pool.")


def get_redis_client() -> Optional[Redis]:
    """Lấy Redis client singleton (nếu chưa init thì trả về None)."""
    return _redis_client


async def get_redis() -> AsyncIterator[Redis]:
    """FastAPI Dependency cung cấp Redis client cho API routes."""
    client = get_redis_client()
    if client is None:
        await init_redis_pool()
        client = get_redis_client()
    yield client


async def check_redis_health() -> dict[str, Any]:
    """
    Kiểm tra trạng thái kết nối tới Redis (Health check).
    Không ném ngoại lệ khi mất kết nối để tránh làm sập health check endpoint.
    """
    client = get_redis_client()
    if client is None:
        return {"status": "unhealthy", "connected": False, "error": "Redis client not initialized"}
    try:
        await client.ping()
        return {"status": "healthy", "connected": True}
    except Exception as exc:
        logger.warning(f"Lỗi kết nối Redis: {exc}")
        return {"status": "unhealthy", "connected": False, "error": str(exc)}
