from pydantic import BaseModel

class AlertCheckResponse(BaseModel):
    order_id: int
    breach_probability: float
    email_sent: bool
    whatsapp_sent: bool
    message: str
