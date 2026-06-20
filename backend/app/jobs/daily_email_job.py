import logging
from app.db.database import SessionLocal
from app.services.invoice_service import get_top_selling_days
from app.services.email_service import send_top_sales_email

logger = logging.getLogger(__name__)

async def run_daily_sales_report_job():
    logger.info("Executing scheduled morning background job: Daily Top 10 Sales Report.")
    
    async with SessionLocal() as db:
        try:
            top_days = await get_top_selling_days(db, limit=10)
            
            if not top_days:
                logger.warning("No invoices found in database. Daily sales report empty, skipping email.")
                return

            formatted_data = []
            for row in top_days:
                formatted_data.append({
                    "date": str(row.sales_date),
                    "total_sales": float(row.total_sales or 0.0)
                })

            success = await send_top_sales_email(formatted_data)
            if success:
                logger.info("Daily sales report job completed successfully.")
            else:
                logger.error("Daily sales report job failed to send the email.")
                
        except Exception as e:
            logger.error(f"Error during daily sales report job execution: {e}")
