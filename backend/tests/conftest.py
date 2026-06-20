import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.fixture
def mock_db() -> AsyncSession:
    return AsyncMock(spec=AsyncSession)

@pytest.fixture(autouse=True)
def mock_redis(monkeypatch):
    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=None)
    mock_client.set = AsyncMock(return_value=True)
    mock_client.delete = AsyncMock(return_value=True)
    
    monkeypatch.setattr("app.services.cache_service.get_redis_client", lambda: mock_client)
    return mock_client

@pytest.fixture(autouse=True)
def mock_smtp(monkeypatch):
    mock_smtp_instance = MagicMock()
    mock_smtp_instance.send_message = AsyncMock(return_value=({}, "OK"))
    mock_smtp_instance.__aenter__ = AsyncMock(return_value=mock_smtp_instance)
    mock_smtp_instance.__aexit__ = AsyncMock(return_value=None)

    
    monkeypatch.setattr("aiosmtplib.SMTP", MagicMock(return_value=mock_smtp_instance))
    return mock_smtp_instance

