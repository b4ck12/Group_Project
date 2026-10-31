from abc import ABC, abstractmethod
import asyncio
from datetime import datetime
import functools
import json
import logging
import time
from typing import Any, Callable, Dict, Optional, Tuple
import uuid

from app.core.config import settings
from app.core.redis import get_redis_client

logger = logging.getLogger(__name__)


def _custom_json_serializer(obj: Any) -> Any:
    """Xử lý serialize cho datetime, UUID, Pydantic v2 models."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if isinstance(obj, (datetime,)):
        return obj.isoformat()
    if isinstance(obj, (uuid.UUID,)):
        return str(obj)
    return str(obj)


def build_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Tạo cache key có tính tất định (Deterministic) từ tiền tố và các tham số.
    Sắp xếp kwargs để query params đảo thứ tự vẫn sinh ra cùng 1 key duy nhất.
    """
    clean_prefix = prefix.strip(":")
    args_parts = [str(arg) for arg in args if arg is not None]
    kwargs_parts = [f"{k}={v}" for k, v in sorted(kwargs.items()) if v is not None]
    
    combined = ":".join(args_parts + kwargs_parts)
    if combined:
        return f"{clean_prefix}:{combined}"
    return clean_prefix


class BaseCache(ABC):
    """Abstract Base Class cho Cache Services (SOLID Dependency Inversion)."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Đọc dữ liệu từ cache."""
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Ghi dữ liệu vào cache với thời gian sống TTL (giây)."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Xóa 1 key khỏi cache."""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Kiểm tra sự tồn tại của key trong cache."""
        pass

    @abstractmethod
    async def clear_prefix(self, prefix: str) -> int:
        """Xóa toàn bộ các key bắt đầu bằng tiền tố prefix."""
        pass


class InMemoryCache(BaseCache):
    """Lớp cache lưu trong RAM (Dict) dùng cho testing và phát triển local."""

    def __init__(self) -> None:
        self._store: Dict[str, Tuple[Any, Optional[float]]] = {}
        self._lock = asyncio.Lock()

    def _is_expired(self, expire_at: Optional[float]) -> bool:
        return expire_at is not None and time.time() > expire_at

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            if key not in self._store:
                return None
            val, expire_at = self._store[key]
            if self._is_expired(expire_at):
                del self._store[key]
                return None
            return val

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        async with self._lock:
            expire_at = (time.time() + ttl) if ttl is not None else None
            self._store[key] = (value, expire_at)
            return True

    async def delete(self, key: str) -> bool:
        async with self._lock:
            if key in self._store:
                del self._store[key]
                return True
            return False

    async def exists(self, key: str) -> bool:
        async with self._lock:
            if key not in self._store:
                return False
            _, expire_at = self._store[key]
            if self._is_expired(expire_at):
                del self._store[key]
                return False
            return True

    async def clear_prefix(self, prefix: str) -> int:
        async with self._lock:
            clean_prefix = prefix.rstrip(":") + ":"
            keys_to_del = [
                k for k in self._store.keys()
                if k.startswith(clean_prefix) or k == prefix
            ]
            for k in keys_to_del:
                del self._store[k]
            return len(keys_to_del)


class RedisCache(BaseCache):
    """
    Lớp cache sử dụng Redis (Docker local hoặc Upstash Cloud TLS).
    Triển khai cơ chế Graceful Degradation: Bắt mọi ngoại lệ để không làm sập ứng dụng.
    """

    def __init__(self, redis_client: Optional[Any] = None) -> None:
        self._custom_client = redis_client

    def _get_client(self) -> Optional[Any]:
        if self._custom_client is not None:
            return self._custom_client
        return get_redis_client()

    async def get(self, key: str) -> Optional[Any]:
        client = self._get_client()
        if client is None:
            return None
        try:
            raw_data = await client.get(key)
            if raw_data is None:
                return None
            return json.loads(raw_data)
        except Exception as exc:
            logger.warning(f"⚠️ [Cache Error] Không thể đọc key '{key}' từ Redis: {exc}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        client = self._get_client()
        if client is None:
            return False
        effective_ttl = ttl if ttl is not None else settings.CACHE_DEFAULT_TTL
        try:
            serialized_data = json.dumps(value, default=_custom_json_serializer)
            await client.set(key, serialized_data, ex=effective_ttl)
            return True
        except Exception as exc:
            logger.warning(f"⚠️ [Cache Error] Không thể ghi key '{key}' vào Redis: {exc}")
            return False

    async def delete(self, key: str) -> bool:
        client = self._get_client()
        if client is None:
            return False
        try:
            result = await client.delete(key)
            return bool(result)
        except Exception as exc:
            logger.warning(f"⚠️ [Cache Error] Không thể xóa key '{key}' khỏi Redis: {exc}")
            return False

    async def exists(self, key: str) -> bool:
        client = self._get_client()
        if client is None:
            return False
        try:
            res = await client.exists(key)
            return bool(res)
        except Exception as exc:
            logger.warning(f"⚠️ [Cache Error] Lỗi kiểm tra exists key '{key}': {exc}")
            return False

    async def clear_prefix(self, prefix: str) -> int:
        client = self._get_client()
        if client is None:
            return 0
        try:
            pattern = f"{prefix.rstrip(':')}*"
            keys = await client.keys(pattern)
            if keys:
                return await client.delete(*keys)
            return 0
        except Exception as exc:
            logger.warning(f"⚠️ [Cache Error] Lỗi xóa prefix '{prefix}': {exc}")
            return 0


_default_cache_instance: Optional[BaseCache] = None


def get_default_cache() -> BaseCache:
    """Lấy cache instance mặc định của toàn hệ thống."""
    global _default_cache_instance
    if _default_cache_instance is None:
        _default_cache_instance = RedisCache()
    return _default_cache_instance


_get_active_cache = get_default_cache


def cache_response(
    ttl: int = 86400,
    prefix: Optional[str] = None,
    cache_instance: Optional[BaseCache] = None,
):
    """
    Decorator bọc ngoài các hàm async để cache kết quả vào Redis/Cache service.
    - ttl: Thời gian sống (giây), mặc định 86400s (24 giờ).
    - prefix: Tiền tố nhóm cache key (mặc định lấy func.__name__).
    - cache_instance: Cho phép inject BaseCache tùy chỉnh (e.g. InMemoryCache cho testing).
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            cache = cache_instance or _get_active_cache()
            p = prefix or func.__name__
            cache_key = build_cache_key(p, *args, **kwargs)

            # 1. Thử đọc từ Cache (Cache Hit)
            try:
                cached_data = await cache.get(cache_key)
                if cached_data is not None:
                    logger.debug(f"⚡ [Cache HIT] {cache_key}")
                    return cached_data
            except Exception as exc:
                logger.warning(f"⚠️ [Cache Error] Lỗi đọc cache '{cache_key}': {exc}")

            # 2. Cache Miss -> Thực thi hàm gốc
            result = await func(*args, **kwargs)

            # 3. Ghi kết quả vào Cache
            if result is not None:
                try:
                    await cache.set(cache_key, result, ttl=ttl)
                    logger.debug(f"💾 [Cache SET] {cache_key} (TTL={ttl}s)")
                except Exception as exc:
                    logger.warning(f"⚠️ [Cache Error] Lỗi ghi cache '{cache_key}': {exc}")

            return result
        return wrapper
    return decorator
