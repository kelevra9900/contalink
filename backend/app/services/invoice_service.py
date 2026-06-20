from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, Date, desc
from app.models.invoice import DBInvoice
from datetime import date, datetime, time
from typing import Tuple, List, Any

async def get_invoices_by_date_range(
    db: AsyncSession,
    start_date: date,
    end_date: date,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[DBInvoice], int]:
    start_dt = datetime.combine(start_date, time.min)
    end_dt = datetime.combine(end_date, time.max)

    filter_cond = and_(
        DBInvoice.invoice_date >= start_dt,
        DBInvoice.invoice_date <= end_dt,
        DBInvoice.active == True
    )

    count_stmt = select(func.count(DBInvoice.id)).where(filter_cond)
    count_result = await db.execute(count_stmt)
    total_count = count_result.scalar() or 0

    offset = (page - 1) * page_size
    data_stmt = (
        select(DBInvoice)
        .where(filter_cond)
        .order_by(DBInvoice.invoice_date.desc(), DBInvoice.id.desc())
        .offset(offset)
        .limit(page_size)
    )
    data_result = await db.execute(data_stmt)
    invoices = list(data_result.scalars().all())

    return invoices, total_count

async def get_top_selling_days(db: AsyncSession, limit: int = 10) -> List[Any]:
    invoice_date_casted = func.cast(DBInvoice.invoice_date, Date)
    stmt = (
        select(
            invoice_date_casted.label("sales_date"),
            func.sum(DBInvoice.total).label("total_sales")
        )
        .where(DBInvoice.active == True)
        .group_by(invoice_date_casted)
        .order_by(desc("total_sales"))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.all())
