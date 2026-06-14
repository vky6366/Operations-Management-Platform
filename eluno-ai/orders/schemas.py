from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    prescription: str
    frame_name: str
    lens_power: str
    lens_type: str
    lens_index: str
    coating: str
    store_id: int

class OrderResponse(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    prescription: str
    frame_name: str
    lens_power: str
    lens_type: str
    lens_index: str
    coating: str
    inventory_available: bool
    current_status: str
    sla_days: int
    expected_delivery: date
    created_at: datetime
    store_id: int

    # Ensure Pydantic can read from SQLAlchemy ORM objects
    model_config = ConfigDict(from_attributes=True)

class OrderStatusUpdate(BaseModel):
    new_status: str
    delay_reason: Optional[str] = None

class ActiveOrderResponse(OrderResponse):
    sla_countdown_days: int
