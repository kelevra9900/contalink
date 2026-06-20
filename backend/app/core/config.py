from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    
    DATABASE_URL: str = "postgresql+asyncpg://developer:REPLACED_PASSWORD@localhost/testinvoices"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_DEFAULT_TTL: int = 300
    
    SMTP_HOST: str = "smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "no-reply@contalink-invoices.com"
    EMAIL_TO: str = "team@example.com"
    
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

settings = Settings()

