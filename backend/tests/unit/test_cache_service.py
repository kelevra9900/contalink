import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services import cache_service
from app.services.cache_service import get_redis_client, close_redis, get_cached_val, set_cached_val, delete_cached_val
from app.core.config import settings

@pytest.mark.asyncio
async def test_cache_get_and_set(mock_redis):
    mock_redis.get.return_value = '{"data": "test_cached"}'
    
    val = await cache_service.get_cached_val("test-key")
    assert val == {"data": "test_cached"}
    mock_redis.get.assert_called_once_with("test-key")
    
    success = await cache_service.set_cached_val("test-key", {"data": "test_cached"}, ttl=60)
    assert success is True
    mock_redis.set.assert_called_once_with("test-key", '{"data": "test_cached"}', ex=60)


def test_get_redis_client(monkeypatch):
    # Override the default autouse monkeypatch to test the real get_redis_client function
    monkeypatch.setattr("app.services.cache_service.get_redis_client", get_redis_client)
    monkeypatch.setattr("app.services.cache_service._redis_client", None)

    mock_from_url = MagicMock()
    monkeypatch.setattr("redis.asyncio.from_url", mock_from_url)

    client = get_redis_client()
    assert client is mock_from_url.return_value
    mock_from_url.assert_called_once_with(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )

    # Calling again should return the same client without re-creating
    client2 = get_redis_client()
    assert client2 is client
    assert mock_from_url.call_count == 1


@pytest.mark.asyncio
async def test_close_redis(monkeypatch):
    monkeypatch.setattr("app.services.cache_service.get_redis_client", get_redis_client)
    
    mock_client = AsyncMock()
    monkeypatch.setattr("app.services.cache_service._redis_client", mock_client)

    await close_redis()
    mock_client.close.assert_called_once()
    assert cache_service._redis_client is None

    # Calling close_redis again when None should do nothing
    await close_redis()


@pytest.mark.asyncio
async def test_cache_get_exception(mock_redis):
    mock_redis.get.side_effect = Exception("Redis is down")
    val = await get_cached_val("test-key")
    assert val is None


@pytest.mark.asyncio
async def test_cache_set_exception(mock_redis):
    mock_redis.set.side_effect = Exception("Redis is read-only")
    success = await set_cached_val("test-key", {"some": "data"})
    assert success is False


@pytest.mark.asyncio
async def test_cache_set_default_ttl(mock_redis):
    success = await set_cached_val("test-key", {"some": "data"}, ttl=None)
    assert success is True
    mock_redis.set.assert_called_once_with(
        "test-key",
        '{"some": "data"}',
        ex=settings.CACHE_DEFAULT_TTL
    )


@pytest.mark.asyncio
async def test_cache_delete_success(mock_redis):
    mock_redis.delete.return_value = 1
    success = await delete_cached_val("test-key")
    assert success is True
    mock_redis.delete.assert_called_once_with("test-key")


@pytest.mark.asyncio
async def test_cache_delete_exception(mock_redis):
    mock_redis.delete.side_effect = Exception("Redis deletion error")
    success = await delete_cached_val("test-key")
    assert success is False
