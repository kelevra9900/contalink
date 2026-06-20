import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import text

from app.core.config import settings
from app.api.invoices import router as invoices_router
from app.services import cache_service
from app.db.database import engine
from app.jobs.daily_email_job import run_daily_sales_report_job
from app.models.health import HealthCheckResponse

START_TIME = time.time()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing backend server...")
    
    trigger = CronTrigger(hour=8, minute=0)
    scheduler.add_job(
        run_daily_sales_report_job,
        trigger=trigger,
        id="daily_sales_report_job",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Background job scheduler started (configured to run daily at 08:00 AM).")

    yield

    logger.info("Shutting down backend server...")
    scheduler.shutdown()
    await cache_service.close_redis()
    logger.info("Cleanup complete.")

app = FastAPI(
    title="Invoice Consultation System API",
    description=(
        "Backend API system for retrieving customer invoice documents, by Roger Torres"
        "aggregating sales statistics, and sending scheduled daily reports."
    ),
    version="1.0.0",
    lifespan=lifespan
)

origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoices_router, prefix="/api")

@app.get(
    "/health",
    tags=["Health"],
    summary="Check health of server",
    response_model=HealthCheckResponse,
    responses={
        200: {"description": "Server is fully operational and all dependencies are reachable"},
        503: {"description": "One or more core dependencies (database, cache) are unreachable"}
    }
)
async def health_check(response: Response):
    """
    Perform a system health check.

    This endpoint verifies:
    - **Database Connectivity**: Executes a query to verify Postgres is reachable.
    - **Redis Cache Connectivity**: Pings Redis to verify cache connectivity.
    - **Uptime**: Calculates and returns the total seconds since server boot.

    If any core dependency fails, the overall status will be `"unhealthy"`
    and the status code will be set to `503 Service Unavailable`.
    """
    db_status = "reachable"
    db_message = "Connected successfully"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "unreachable"
        db_message = str(e)
        logger.error(f"Database health check failed: {e}")

    redis_status = "reachable"
    redis_message = "Connected successfully"
    try:
        client = cache_service.get_redis_client()
        await client.ping()
    except Exception as e:
        redis_status = "unreachable"
        redis_message = str(e)
        logger.error(f"Redis health check failed: {e}")

    is_healthy = db_status == "reachable" and redis_status == "reachable"
    overall_status = "healthy" if is_healthy else "unhealthy"
    
    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    uptime_seconds = time.time() - START_TIME

    return {
        "status": overall_status,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "uptime_seconds": round(uptime_seconds, 2),
        "services": {
            "database": {
                "status": db_status,
                "message": db_message
            },
            "redis": {
                "status": redis_status,
                "message": redis_message
            }
        }
    }
