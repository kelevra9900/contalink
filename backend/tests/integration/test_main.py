import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from app.main import app, scheduler, lifespan

@pytest.mark.asyncio
async def test_main_lifespan(monkeypatch):
    mock_close_redis = AsyncMock()
    monkeypatch.setattr("app.main.cache_service.close_redis", mock_close_redis)

    mock_start = MagicMock()
    mock_shutdown = MagicMock()
    monkeypatch.setattr(scheduler, "start", mock_start)
    monkeypatch.setattr(scheduler, "shutdown", mock_shutdown)

    async with lifespan(app):
        # Startup phase assertions
        mock_start.assert_called_once()
        job = scheduler.get_job("daily_sales_report_job")
        assert job is not None

    # Shutdown phase assertions
    mock_shutdown.assert_called_once()
    mock_close_redis.assert_called_once()


@pytest.mark.asyncio
async def test_health_check_endpoint_healthy(monkeypatch):
    mock_conn = AsyncMock()
    mock_conn.execute = AsyncMock()
    mock_connect = MagicMock()
    mock_connect.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_connect.__aexit__ = AsyncMock(return_value=None)
    mock_engine = MagicMock()
    mock_engine.connect = MagicMock(return_value=mock_connect)
    monkeypatch.setattr("app.main.engine", mock_engine)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["environment"] == "development"
    assert data["version"] == "1.0.0"
    assert isinstance(data["uptime_seconds"], (int, float))
    assert data["services"]["database"]["status"] == "reachable"
    assert data["services"]["database"]["message"] == "Connected successfully"
    assert data["services"]["redis"]["status"] == "reachable"
    assert data["services"]["redis"]["message"] == "Connected successfully"


@pytest.mark.asyncio
async def test_health_check_endpoint_db_unreachable(monkeypatch):
    mock_connect = MagicMock()
    mock_connect.__aenter__ = AsyncMock(side_effect=Exception("Database down"))
    mock_engine = MagicMock()
    mock_engine.connect = MagicMock(return_value=mock_connect)
    monkeypatch.setattr("app.main.engine", mock_engine)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "unhealthy"
    assert data["services"]["database"]["status"] == "unreachable"
    assert "Database down" in data["services"]["database"]["message"]
    assert data["services"]["redis"]["status"] == "reachable"


@pytest.mark.asyncio
async def test_health_check_endpoint_redis_unreachable(monkeypatch, mock_redis):
    mock_conn = AsyncMock()
    mock_conn.execute = AsyncMock()
    mock_connect = MagicMock()
    mock_connect.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_connect.__aexit__ = AsyncMock(return_value=None)
    mock_engine = MagicMock()
    mock_engine.connect = MagicMock(return_value=mock_connect)
    monkeypatch.setattr("app.main.engine", mock_engine)

    mock_redis.ping.side_effect = Exception("Redis connection lost")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "unhealthy"
    assert data["services"]["database"]["status"] == "reachable"
    assert data["services"]["redis"]["status"] == "unreachable"
    assert "Redis connection lost" in data["services"]["redis"]["message"]
