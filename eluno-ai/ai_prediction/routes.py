from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from utils.database import get_db
from utils.models import Order, TATPrediction
from ai_prediction.predictor import predict_breach

router = APIRouter()

@router.get("/predict/{order_id}")
def predict_order_breach(order_id: int, db: Session = Depends(get_db)):
    """
    Predict breach probability for a specific order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        prediction_result = predict_breach(order)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    # Save to tat_predictions table
    tat_record = TATPrediction(
        order_id=order.id,
        breach_probability=prediction_result["breach_probability"],
        predicted_breach=prediction_result["predicted_breach"],
        model_version=prediction_result["model_version"]
    )
    db.add(tat_record)
    db.commit()

    return prediction_result

@router.get("/orders-at-risk", summary="Get active orders at risk of breaching SLA")
def get_orders_at_risk(db: Session = Depends(get_db)):
    """
    Fetch all active orders and return those with a high probability of breaching.
    """
    active_statuses = ["Order Placed", "In Production", "Ready for Dispatch", "Out for Delivery"]
    active_orders = db.query(Order).filter(Order.current_status.in_(active_statuses)).all()
    
    at_risk_list = []
    for order in active_orders:
        try:
            pred = predict_breach(order)
            if pred["breach_probability"] > 0.6: # Threshold for "at risk"
                remaining_sla = (order.expected_delivery - date.today()).days
                at_risk_list.append({
                    "order_id": order.id,
                    "customer_name": order.customer_name,
                    "store_id": order.store_id,
                    "current_status": order.current_status,
                    "breach_probability": pred["breach_probability"],
                    "remaining_sla_days": remaining_sla,
                    "ai_recommendation": pred["recommendation"]
                })
        except Exception:
            # Skip orders that fail prediction
            continue

    # Sort by highest breach probability
    at_risk_list.sort(key=lambda x: x["breach_probability"], reverse=True)
    return at_risk_list
