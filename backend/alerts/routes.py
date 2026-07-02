from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utils.database import get_db
from alerts.service import trigger_breach_alert
from alerts.schemas import AlertCheckResponse

router = APIRouter()

@router.post("/check/{order_id}", response_model=AlertCheckResponse, summary="Check and trigger SLA breach alerts")
def check_order_alert(order_id: int, force: bool = False, db: Session = Depends(get_db)):
    """
    Checks the SLA breach probability of a given order. 
    If the probability is >= 0.70 (or forced), it sends an email alert and attempts to send a WhatsApp alert.
    """
    result = trigger_breach_alert(db, order_id, force=force)
    
    if result.get("success") is False:
        # Handle error case (e.g. order not found)
        return AlertCheckResponse(
            order_id=order_id,
            breach_probability=0.0,
            email_sent=False,
            whatsapp_sent=False,
            message=result.get("message", "Error processing alert.")
        )
        
    return AlertCheckResponse(**result)
