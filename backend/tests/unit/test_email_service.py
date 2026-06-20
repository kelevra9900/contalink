import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.email_service import send_top_sales_email
from app.core.config import settings

@pytest.mark.asyncio
async def test_send_top_sales_email(mock_smtp):
    top_days_data = [
        {"date": "2022-01-15", "total_sales": 12500.50},
        {"date": "2022-01-20", "total_sales": 8700.00}
    ]
    
    success = await send_top_sales_email(top_days_data)
    
    assert success is True
    mock_smtp.send_message.assert_called_once()
    
    sent_msg = mock_smtp.send_message.call_args[0][0]
    assert sent_msg["Subject"] == "Daily Top 10 Sales Report"
    assert settings.EMAIL_FROM in sent_msg["From"]
    assert settings.EMAIL_TO in sent_msg["To"]


@pytest.mark.asyncio
async def test_send_top_sales_email_exception(monkeypatch):
    # Mock SMTP instance to throw exception on enter
    mock_smtp_instance = MagicMock()
    mock_smtp_instance.__aenter__ = AsyncMock(side_effect=Exception("Connection refused"))
    
    mock_smtp_class = MagicMock(return_value=mock_smtp_instance)
    monkeypatch.setattr("aiosmtplib.SMTP", mock_smtp_class)

    top_days_data = [{"date": "2022-01-15", "total_sales": 12500.50}]
    
    success = await send_top_sales_email(top_days_data)
    assert success is False


@pytest.mark.asyncio
async def test_send_top_sales_email_with_auth_and_tls(monkeypatch, mock_smtp):
    monkeypatch.setattr(settings, "SMTP_PORT", 465)
    monkeypatch.setattr(settings, "SMTP_USER", "test_user")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "test_pass")

    mock_smtp_class = MagicMock(return_value=mock_smtp)
    monkeypatch.setattr("aiosmtplib.SMTP", mock_smtp_class)

    top_days_data = [{"date": "2022-01-15", "total_sales": 12500.50}]

    success = await send_top_sales_email(top_days_data)
    assert success is True
    
    mock_smtp_class.assert_called_once_with(
        hostname=settings.SMTP_HOST,
        port=465,
        use_tls=True,
        start_tls=False,
        username="test_user",
        password="test_pass"
    )


@pytest.mark.asyncio
async def test_send_top_sales_email_start_tls(monkeypatch, mock_smtp):
    monkeypatch.setattr(settings, "SMTP_PORT", 587)
    monkeypatch.setattr(settings, "SMTP_USER", "")

    mock_smtp_class = MagicMock(return_value=mock_smtp)
    monkeypatch.setattr("aiosmtplib.SMTP", mock_smtp_class)

    top_days_data = [{"date": "2022-01-15", "total_sales": 12500.50}]

    success = await send_top_sales_email(top_days_data)
    assert success is True
    
    mock_smtp_class.assert_called_once_with(
        hostname=settings.SMTP_HOST,
        port=587,
        use_tls=False,
        start_tls=True
    )
