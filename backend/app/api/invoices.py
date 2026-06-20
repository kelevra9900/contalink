from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.invoice import PaginatedInvoicesResponse, TopDayResponse
from app.services import invoice_service, cache_service
from datetime import date
from typing import List
from decimal import Decimal

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get(
    "",
    response_model=PaginatedInvoicesResponse,
    summary="Query invoices by date range",
    responses={
        200: {"description": "Invoices retrieved successfully (either from cache or database)"},
        400: {"description": "Invalid date range parameters (e.g., start_date is after end_date)"},
        422: {"description": "Validation error for missing or malformed query parameters"}
    }
)
async def query_invoices(
    start_date: date = Query(..., description="Start date of the search range (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date of the search range (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve active invoices within a specified date range.

    This endpoint features:
    - **Pagination**: Supports `page` and `page_size` parameters for efficient client consumption.
    - **Caching (Redis)**: Results are cached in Redis to minimize database load.
    - **Validation**: Ensures that `start_date` is not later than `end_date`.

    Cache Key Pattern: `invoices:{start_date}:{end_date}:p{page}:sz{page_size}`
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be after end date"
        )

    cache_key = f"invoices:{start_date}:{end_date}:p{page}:sz{page_size}"
    cached_data = await cache_service.get_cached_val(cache_key)
    
    if cached_data:
        return PaginatedInvoicesResponse(
            invoices=cached_data["invoices"],
            total_count=cached_data["total_count"],
            page=page,
            page_size=page_size,
            cached=True
        )

    invoices, total_count = await invoice_service.get_invoices_by_date_range(
        db, start_date, end_date, page, page_size
    )

    response_invoices = []
    for inv in invoices:
        response_invoices.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "total": inv.total,
            "invoice_date": inv.invoice_date,
            "status": inv.status,
            "active": inv.active
        })

    result = {
        "invoices": response_invoices,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "cached": False
    }

    cache_payload = {
        "invoices": [
            {
                "id": i["id"],
                "invoice_number": i["invoice_number"],
                "total": str(i["total"]) if i["total"] is not None else None,
                "invoice_date": i["invoice_date"].isoformat() if i["invoice_date"] else None,
                "status": i["status"],
                "active": i["active"]
            } for i in response_invoices
        ],
        "total_count": total_count
    }
    await cache_service.set_cached_val(cache_key, cache_payload)

    return PaginatedInvoicesResponse(**result)

@router.get(
    "/top-days",
    response_model=List[TopDayResponse],
    summary="Get top selling days",
    responses={
        200: {"description": "Top selling days retrieved successfully (either from cache or database)"},
        500: {"description": "Internal server error while executing aggregation"}
    }
)
async def get_top_selling_days(db: AsyncSession = Depends(get_db)):
    """
    Retrieve the top 10 calendar days with the highest cumulative sales volume.

    This endpoint features:
    - **Server-side Aggregation**: Performs sum-grouping of active invoice totals on the database engine.
    - **Caching (Redis)**: Results are cached for 10 minutes (TTL: 600s).

    Cache Key: `invoices:top-days`
    """
    cache_key = "invoices:top-days"
    cached_data = await cache_service.get_cached_val(cache_key)
    
    if cached_data:
        return [TopDayResponse(date=row["date"], total_sales=Decimal(row["total_sales"])) for row in cached_data]

    top_days = await invoice_service.get_top_selling_days(db, limit=10)

    response_data = []
    for row in top_days:
        response_data.append({
            "date": row.sales_date,
            "total_sales": row.total_sales or Decimal("0.0")
        })

    cache_payload = [
        {
            "date": str(row["date"]),
            "total_sales": str(row["total_sales"])
        } for row in response_data
    ]
    await cache_service.set_cached_val(cache_key, cache_payload, ttl=600)

    return response_data
