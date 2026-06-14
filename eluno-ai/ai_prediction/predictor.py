import os
import pickle
import pandas as pd
from datetime import date

# Define path to the model relative to this file
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# Load model globally to avoid loading on every request
_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model = pickle.load(f)
        else:
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Train the model first.")
    return _model

def predict_breach(order) -> dict:
    """
    Given an SQLAlchemy Order object, predict the breach probability.
    """
    model = get_model()
    
    # Calculate days_elapsed
    days_elapsed = (date.today() - order.created_at.date()).days
    if days_elapsed < 0:
        days_elapsed = 0

    # Build the feature dict
    data = {
        "inventory_available": [int(order.inventory_available)],
        "lens_type": [order.lens_type],
        "store_id": [order.store_id],
        "current_status": [order.current_status],
        "days_elapsed": [days_elapsed],
        "sla_days": [order.sla_days]
    }
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Predict probabilities. [:, 1] gives the probability for class 1 (breach)
    proba = model.predict_proba(df)[0][1]
    
    predicted_breach = bool(proba > 0.5)
    
    # Simple recommendation logic
    if predicted_breach:
        if not order.inventory_available:
            recommendation = "Out-of-stock lens. Expedite vendor procurement."
        elif order.current_status == "Order Placed":
            recommendation = "Order is stuck in initial phase. Start production immediately."
        else:
            recommendation = "High risk of breach. Assign priority flag to production team."
    else:
        recommendation = "On track. No immediate action needed."
        
    return {
        "order_id": order.id,
        "breach_probability": round(float(proba), 2),
        "predicted_breach": predicted_breach,
        "recommendation": recommendation,
        "model_version": "v1.0"
    }
