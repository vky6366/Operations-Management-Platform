import os
import logging
from dotenv import load_dotenv

load_dotenv()

def send_whatsapp_alert(order_details: dict, prediction: dict) -> dict:
    enable_whatsapp = os.getenv("ENABLE_WHATSAPP_ALERTS", "False").lower() in ("true", "1", "yes")
    
    if not enable_whatsapp:
        return {"success": False, "message": "WhatsApp alerts disabled."}

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_whatsapp = os.getenv("TWILIO_WHATSAPP_FROM")
    to_whatsapp = os.getenv("ALERT_WHATSAPP_TO")

    if not all([account_sid, auth_token, from_whatsapp, to_whatsapp]):
        logging.warning("Twilio credentials missing. Skipping WhatsApp alert.")
        return {"success": False, "message": "Twilio credentials missing."}

    try:
        from twilio.rest import Client
        
        client = Client(account_sid, auth_token)
        
        order_id = order_details.get("id")
        customer_name = order_details.get("customer_name")
        breach_prob = prediction.get("breach_probability", 0) * 100
        recommendation = prediction.get("recommendation", "No recommendation.")
        
        message_body = (
            f"🚨 *Eluno AI - SLA Breach Alert* 🚨\n\n"
            f"Order ID: {order_id}\n"
            f"Customer: {customer_name}\n"
            f"Breach Probability: {breach_prob:.0f}%\n\n"
            f"*AI Recommendation:*\n"
            f"{recommendation}"
        )

        message = client.messages.create(
            body=message_body,
            from_=from_whatsapp,
            to=to_whatsapp
        )
        
        logging.info(f"WhatsApp alert sent for Order #{order_id}. SID: {message.sid}")
        return {"success": True, "message": "WhatsApp alert sent successfully."}
        
    except ImportError:
        logging.warning("Twilio package not installed. Skipping WhatsApp alert.")
        return {"success": False, "message": "Twilio package not installed."}
    except Exception as e:
        logging.error(f"Failed to send WhatsApp alert for Order #{order_details.get('id')}: {e}")
        return {"success": False, "message": str(e)}
