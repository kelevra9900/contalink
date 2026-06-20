from pydantic import BaseModel, Field
from typing import Dict

class ServiceStatus(BaseModel):
    status: str = Field(..., description="Reachability status: 'reachable' or 'unreachable'")
    message: str = Field(..., description="Details regarding connection status or error description")

class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="Overall health of the application: 'healthy' or 'unhealthy'")
    environment: str = Field(..., description="Running environment (e.g., development, production)")
    version: str = Field(..., description="System API version")
    uptime_seconds: float = Field(..., description="Server uptime in seconds since boot")
    services: Dict[str, ServiceStatus] = Field(..., description="Status of dependency systems like database and redis")
