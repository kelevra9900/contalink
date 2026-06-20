import pytest
from datetime import date
from unittest.mock import AsyncMock, MagicMock
from app.jobs.daily_email_job import run_daily_sales_report_job

@pytest.mark.asyncio
async def test_run_daily_sales_report_job_success(monkeypatch):
    # Mock database session
    mock_session = AsyncMock()
    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)
    mock_session_local = MagicMock(return_value=mock_context)
    monkeypatch.setattr("app.jobs.daily_email_job.SessionLocal", mock_session_local)

    # Mock get_top_selling_days
    mock_row1 = MagicMock()
    mock_row1.sales_date = date(2022, 1, 15)
    mock_row1.total_sales = 5000.50

    mock_row2 = MagicMock()
    mock_row2.sales_date = date(2022, 1, 16)
    mock_row2.total_sales = 2500.00

    mock_get_top = AsyncMock(return_value=[mock_row1, mock_row2])
    monkeypatch.setattr("app.jobs.daily_email_job.get_top_selling_days", mock_get_top)

    # Mock send_top_sales_email
    mock_send_email = AsyncMock(return_value=True)
    monkeypatch.setattr("app.jobs.daily_email_job.send_top_sales_email", mock_send_email)

    await run_daily_sales_report_job()

    mock_get_top.assert_called_once_with(mock_session, limit=10)
    mock_send_email.assert_called_once_with([
        {"date": "2022-01-15", "total_sales": 5000.50},
        {"date": "2022-01-16", "total_sales": 2500.00}
    ])


@pytest.mark.asyncio
async def test_run_daily_sales_report_job_empty_db(monkeypatch):
    # Mock database session
    mock_session = AsyncMock()
    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)
    mock_session_local = MagicMock(return_value=mock_context)
    monkeypatch.setattr("app.jobs.daily_email_job.SessionLocal", mock_session_local)

    # Mock get_top_selling_days to return empty
    mock_get_top = AsyncMock(return_value=[])
    monkeypatch.setattr("app.jobs.daily_email_job.get_top_selling_days", mock_get_top)

    # Mock send_top_sales_email to ensure it's NOT called
    mock_send_email = AsyncMock()
    monkeypatch.setattr("app.jobs.daily_email_job.send_top_sales_email", mock_send_email)

    await run_daily_sales_report_job()

    mock_get_top.assert_called_once()
    mock_send_email.assert_not_called()


@pytest.mark.asyncio
async def test_run_daily_sales_report_job_email_failure(monkeypatch):
    # Mock database session
    mock_session = AsyncMock()
    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)
    mock_session_local = MagicMock(return_value=mock_context)
    monkeypatch.setattr("app.jobs.daily_email_job.SessionLocal", mock_session_local)

    # Mock get_top_selling_days
    mock_row1 = MagicMock()
    mock_row1.sales_date = date(2022, 1, 15)
    mock_row1.total_sales = 5000.50
    mock_get_top = AsyncMock(return_value=[mock_row1])
    monkeypatch.setattr("app.jobs.daily_email_job.get_top_selling_days", mock_get_top)

    # Mock send_top_sales_email to fail
    mock_send_email = AsyncMock(return_value=False)
    monkeypatch.setattr("app.jobs.daily_email_job.send_top_sales_email", mock_send_email)

    await run_daily_sales_report_job()

    mock_send_email.assert_called_once()


@pytest.mark.asyncio
async def test_run_daily_sales_report_job_exception(monkeypatch):
    # Mock database session to succeed on enter
    mock_session = AsyncMock()
    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)
    mock_session_local = MagicMock(return_value=mock_context)
    monkeypatch.setattr("app.jobs.daily_email_job.SessionLocal", mock_session_local)

    # Mock get_top_selling_days to raise exception during execution
    mock_get_top = AsyncMock(side_effect=Exception("Database down"))
    monkeypatch.setattr("app.jobs.daily_email_job.get_top_selling_days", mock_get_top)

    # Calling the job should catch the exception internally and not raise it
    await run_daily_sales_report_job()
