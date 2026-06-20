from sqlalchemy import Column, Integer, Numeric, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel, Field
import datetime as dt
from typing import Optional
from decimal import Decimal

Base = declarative_base()

class DBInvoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, nullable=True)
    total = Column(Numeric, nullable=True)
    invoice_date = Column(DateTime, nullable=True)
    status = Column(String, nullable=True)
    active = Column(Boolean, nullable=False, default=True)

class InvoiceResponse(BaseModel):
    id: int = Field(description="The unique identifier of the invoice")
    invoice_number: Optional[str] = Field(None, description="The alphanumeric identifier of the invoice document")
    total: Optional[Decimal] = Field(None, description="The total amount billed in the invoice")
    invoice_date: Optional[dt.datetime] = Field(None, description="The date and time when the invoice was issued")
    status: Optional[str] = Field(None, description="Current workflow state of the invoice")
    active: bool = Field(description="Active state indicating if the invoice is not soft-deleted")

    model_config = {
        "from_attributes": True
    }

class TopDayResponse(BaseModel):
    date: dt.date = Field(description="The calendar date for the aggregate sales")
    total_sales: Decimal = Field(description="The aggregate sales amount for this date")

class PaginatedInvoicesResponse(BaseModel):
    invoices: list[InvoiceResponse] = Field(description="List of invoices matching the query")
    total_count: int = Field(description="Total number of invoices found matching the date range")
    page: int = Field(description="Current page number")
    page_size: int = Field(description="Number of records per page")
    cached: bool = Field(description="Indicates whether the response was served from cache")

