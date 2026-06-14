import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from utils.models import Order, TATPrediction
from ai_prediction.predictor import predict_breach
from alerts.email_service import send_email_alert
from alerts.whatsapp_service import send_whatsapp_alert

def trigger_breach_alert(db: Session, order_id: int, force: bool = False) -> dict:
    """
    Automatic breach alerts. Predicts breach, saves to DB if >= 0.7, and sends alert.
    Reuses recent predictions to save computation, unless force=True.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        logging.warning(f"Order {order_id} not found for alerting.")
        return {"success": False, "message": "Order not found."}

    # Determine if we should force the alert due to explicit critical status
    force_alert = force or order.current_status in ["Delayed", "QC Failed"]

    # Check for recent prediction (within last hour)
    recent_time_threshold = datetime.utcnow() - timedelta(hours=1)
    recent_prediction = db.query(TATPrediction).filter(
        TATPrediction.order_id == order_id,
        TATPrediction.prediction_time >= recent_time_threshold
    ).order_by(TATPrediction.prediction_time.desc()).first()

    if recent_prediction and not force_alert:
        prob = recent_prediction.breach_probability
        
        # Simplified recommendation logic since we don't save recommendation in DB
        if not order.inventory_available:
            recommendation = "Out-of-stock lens. Expedite vendor procurement."
        elif order.current_status == "Order Placed":
            recommendation = "Order is stuck in initial phase. Start production immediately."
        else:
            recommendation = "High risk of breach. Assign priority flag to production team."
            
        prediction_result = {
            "breach_probability": prob,
            "predicted_breach": recent_prediction.predicted_breach,
            "recommendation": recommendation
        }
        logging.info(f"Reusing recent prediction for Order {order_id}: {prob}")
    else:
        try:
            prediction_result = predict_breach(order)
            prob = prediction_result["breach_probability"]

            # If force_alert is true and model still predicts low, artificially bump it so the alert makes sense.
            if force_alert and prob < 0.7:
                 prob = 0.85
                 prediction_result["breach_probability"] = prob
                 prediction_result["predicted_breach"] = True
                 prediction_result["recommendation"] = f"Order status is critically marked as {order.current_status}. Immediate action required."

            # Save to tat_predictions
            tat_record = TATPrediction(
                order_id=order.id,
                breach_probability=prob,
                predicted_breach=prediction_result["predicted_breach"],
                model_version=prediction_result["model_version"]
            )
            db.add(tat_record)
            db.commit()
            
        except Exception as e:
            logging.error(f"Prediction failed for order {order_id}: {e}")
            return {"success": False, "message": f"Prediction failed: {str(e)}"}
            
    if prob >= 0.7 or force_alert:
        order_details = {
            "id": order.id,
            "customer_name": order.customer_name,
            "current_status": order.current_status,
            "remaining_sla_days": (order.expected_delivery - datetime.utcnow().date()).days if order.expected_delivery else 0
        }

        # Trigger email alert (Primary)
        email_sent = send_email_alert(
            order_details=order_details,
            prediction=prediction_result
        )

        # Trigger WhatsApp alert (Optional)
        whatsapp_result = send_whatsapp_alert(
            order_details=order_details,
            prediction=prediction_result
        )
        
        return {
            "order_id": order.id,
            "breach_probability": prob,
            "email_sent": email_sent,
            "whatsapp_sent": whatsapp_result.get("success", False),
            "message": "High-risk alert generated successfully."
        }
    else:
        return {
            "order_id": order.id,
            "breach_probability": prob,
            "email_sent": False,
            "whatsapp_sent": False,
            "message": "No alert required."
        }
