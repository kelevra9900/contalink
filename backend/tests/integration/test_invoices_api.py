import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, datetime
from decimal import Decimal
from unittest.mock import AsyncMock

from app.main import app
from app.db.database import get_db
from app.services import invoice_service

MOCK_INVOICE = AsyncMock()
MOCK_INVOICE.id = 101
MOCK_INVOICE.invoice_number = "INV-101"
MOCK_INVOICE.total = Decimal("150.75")
MOCK_INVOICE.invoice_date = datetime(2022, 1, 15, 12, 0, 0)
MOCK_INVOICE.status = "Vigente"
MOCK_INVOICE.active = True

MOCK_TOP_DAY = AsyncMock()
MOCK_TOP_DAY.sales_date = date(2022, 1, 15)
MOCK_TOP_DAY.total_sales = Decimal("5000.50")

@pytest.fixture
def override_db_dependency(monkeypatch):
    mock_session = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_session
    yield mock_session
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_query_invoices_success(override_db_dependency, monkeypatch):
    mock_get_invoices = AsyncMock(return_value=([MOCK_INVOICE], 1))
    monkeypatch.setattr(invoice_service, "get_invoices_by_date_range", mock_get_invoices)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/invoices",
            params={
                "start_date": "2022-01-01",
                "end_date": "2022-01-31",
                "page": 1,
                "page_size": 10
            }
        )

    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 1
    assert len(data["invoices"]) == 1
    assert data["invoices"][0]["id"] == 101
    assert data["invoices"][0]["invoice_number"] == "INV-101"
    assert data["invoices"][0]["total"] == "150.75"
    assert data["cached"] is False

@pytest.mark.asyncio
async def test_query_invoices_invalid_date_range(override_db_dependency):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/invoices",
            params={
                "start_date": "2022-01-31",
                "end_date": "2022-01-01"
            }
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Start date cannot be after end date"

@pytest.mark.asyncio
async def test_query_invoices_missing_params(override_db_dependency):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/invoices", params={"start_date": "2022-01-01"})

    assert response.status_code == 422

@pytest.mark.asyncio
async def test_get_top_selling_days_success(override_db_dependency, monkeypatch):
    mock_get_top = AsyncMock(return_value=[MOCK_TOP_DAY])
    monkeypatch.setattr(invoice_service, "get_top_selling_days", mock_get_top)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/api/invoices/top-days")
        response = await ac.get("/api/invoices/top-days")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["date"] == "2022-01-15"
    assert data[0]["total_sales"] == "5000.50"


@pytest.mark.asyncio
async def test_query_invoices_cache_hit(override_db_dependency, mock_redis):
    mock_redis.get.return_value = '{"invoices": [{"id": 202, "invoice_number": "INV-202", "total": 999.99, "invoice_date": "2022-01-20T10:00:00", "status": "Vigente", "active": true}], "total_count": 1}'

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/invoices",
            params={
                "start_date": "2022-01-01",
                "end_date": "2022-01-31",
                "page": 1,
                "page_size": 20
            }
        )

    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 1
    assert data["cached"] is True
    assert data["invoices"][0]["id"] == 202
    assert data["invoices"][0]["invoice_number"] == "INV-202"
    assert data["invoices"][0]["total"] == "999.99"


@pytest.mark.asyncio
async def test_get_top_selling_days_cache_hit(override_db_dependency, mock_redis):
    import json
    cached_top_days = [{"date": "2022-01-22", "total_sales": "15000.75"}]
    mock_redis.get.return_value = json.dumps(cached_top_days)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/invoices/top-days")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["date"] == "2022-01-22"
    assert data[0]["total_sales"] == "15000.75"

