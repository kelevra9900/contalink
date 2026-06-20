import json
import logging
import redis.asyncio as aioredis
from app.core.config import settings
from typing import Optional, Any

logger = logging.getLogger(__name__)

_redis_client: Optional[aioredis.Redis] = None

def get_redis_client() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return _redis_client

async def close_redis():
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None

async def get_cached_val(key: str) -> Optional[Any]:
    try:
        client = get_redis_client()
        val = await client.get(key)
        if val:
            return json.loads(val)
    except Exception as e:
        logger.warning(f"Redis get error (falling back to database): {e}")
    return None

async def set_cached_val(key: str, val: Any, ttl: int = None) -> bool:
    if ttl is None:
        ttl = settings.CACHE_DEFAULT_TTL
    try:
        client = get_redis_client()
        serialized = json.dumps(val)
        await client.set(key, serialized, ex=ttl)
        return True
    except Exception as e:
        logger.warning(f"Redis set error: {e}")
    return False

async def delete_cached_val(key: str) -> bool:
    try:
        client = get_redis_client()
        await client.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Redis delete error: {e}")
    return False
