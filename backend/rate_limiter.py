import os
import time
import logging
from urllib.parse import urlparse

try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)

_redis_client = None
_fallback_store = {}


def get_redis_client():
    global _redis_client
    if _redis_client is None:
        if redis is None:
            raise RuntimeError("redis package is not installed")
        url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
        try:
            _redis_client = redis.from_url(url, decode_responses=True, socket_connect_timeout=1)
            _redis_client.ping()
        except Exception as exc:
            logger.warning("Redis connection failed (%s), using in-memory fallback", exc)
            _redis_client = None
            raise RuntimeError("Redis connection failed")
    return _redis_client


def check_rate_limit(key: str, limit: int, window_seconds: int) -> bool:
    try:
        client = get_redis_client()
        now = time.time()
        window_start = now - window_seconds

        pipe = client.pipeline()
        pipe.zadd(key, {str(now): now})
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        pipe.expire(key, window_seconds)
        _, _, count, _ = pipe.execute()

        if count >= limit:
            logger.warning("Rate limit exceeded for key=%s count=%s limit=%s", key, count, limit)
            return False
        return True
    except Exception:
        if redis is None:
            logger.debug("Using in-memory fallback for rate limit key=%s", key)

        now = time.time()
        window_start = now - window_seconds
        if key not in _fallback_store:
            _fallback_store[key] = []

        _fallback_store[key] = [ts for ts in _fallback_store[key] if ts > window_start]

        if len(_fallback_store[key]) >= limit:
            logger.warning("Rate limit exceeded (fallback) for key=%s count=%s limit=%s", key, len(_fallback_store[key]), limit)
            return False

        _fallback_store[key].append(now)
        return True
