import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from app.services.invoice_service import get_invoices_by_date_range, get_top_selling_days

@pytest.mark.asyncio
async def test_get_invoices_by_date_range(mock_db):
    mock_count_result = MagicMock()
    mock_count_result.scalar.return_value = 1
    
    mock_data_result = MagicMock()
    mock_invoice = MagicMock()
    mock_invoice.id = 1
    mock_data_result.scalars().all.return_value = [mock_invoice]
    
    mock_db.execute = AsyncMock(side_effect=[mock_count_result, mock_data_result])
    
    invoices, total = await get_invoices_by_date_range(
        mock_db,
        start_date=date(2022, 1, 1),
        end_date=date(2022, 1, 31)
    )
    
    assert total == 1
    assert len(invoices) == 1
    assert invoices[0].id == 1
    assert mock_db.execute.call_count == 2

@pytest.mark.asyncio
async def test_get_top_selling_days(mock_db):
    mock_row_1 = MagicMock()
    mock_row_1.sales_date = date(2022, 1, 15)
    mock_row_1.total_sales = 5000.50
    
    mock_result = MagicMock()
    mock_result.all.return_value = [mock_row_1]
    mock_db.execute = AsyncMock(return_value=mock_result)
    
    top_days = await get_top_selling_days(mock_db, limit=5)
    
    assert len(top_days) == 1
    assert top_days[0].sales_date == date(2022, 1, 15)
    assert top_days[0].total_sales == 5000.50
    mock_db.execute.assert_called_once()
