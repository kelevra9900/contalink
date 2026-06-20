import pytest
from unittest.mock import AsyncMock, MagicMock
from app.db.database import get_db

@pytest.mark.asyncio
async def test_get_db(monkeypatch):
    mock_session = AsyncMock()
    mock_session.close = AsyncMock()

    # Mock the async context manager returned by SessionLocal()
    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)

    mock_session_local = MagicMock(return_value=mock_context)
    monkeypatch.setattr("app.db.database.SessionLocal", mock_session_local)

    generator = get_db()

    # Step into generator, it should execute till yield
    yielded_session = await generator.__anext__()

    assert yielded_session is mock_session
    mock_session_local.assert_called_once()
    mock_session.close.assert_not_called()

    # Step out of generator, triggering the finally block
    with pytest.raises(StopAsyncIteration):
        await generator.__anext__()

    mock_session.close.assert_called_once()
