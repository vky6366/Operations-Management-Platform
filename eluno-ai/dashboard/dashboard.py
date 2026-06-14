import streamlit as st
import requests
import pandas as pd

API_BASE_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="Eluno AI - Order Management", layout="wide")

st.title("Eluno AI - Order Management Dashboard")

# --- Helper Functions ---
def fetch_active_orders():
    try:
        response = requests.get(f"{API_BASE_URL}/orders/active")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching active orders. Is the backend running? ({e})")
        return []

def fetch_orders_at_risk():
    try:
        response = requests.get(f"{API_BASE_URL}/ai/orders-at-risk")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching orders at risk: {e}")
        return []

def fetch_filtered_orders(status, lens_type, store_id):
    try:
        params = {}
        if status != "All": params["status"] = status
        if lens_type != "All": params["lens_type"] = lens_type
        if store_id != "All": params["store_id"] = int(store_id)
        
        response = requests.get(f"{API_BASE_URL}/orders/filter", params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching filtered orders: {e}")
        return []

def create_order(data):
    try:
        response = requests.post(f"{API_BASE_URL}/orders/create", json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        error_msg = response.text if 'response' in locals() and response else e
        st.error(f"Error creating order: {error_msg}")
        return None

def update_order_status(order_id, new_status, delay_reason):
    try:
        data = {"new_status": new_status}
        if delay_reason:
            data["delay_reason"] = delay_reason
        response = requests.patch(f"{API_BASE_URL}/orders/{order_id}/status", json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        error_msg = response.text if 'response' in locals() and response else e
        st.error(f"Error updating order: {error_msg}")
        return None

# --- Refresh Dashboard ---
if st.button("Refresh Dashboard"):
    st.rerun()

st.markdown("---")

# --- Fetch Initial Data ---
active_orders = fetch_active_orders()
orders_at_risk = fetch_orders_at_risk()

# --- KPI Cards ---
total_active = len(active_orders)
at_risk_count = len(orders_at_risk)
sla_breaches = len([o for o in active_orders if o.get("sla_countdown_days", 0) < 0])

# We use inventory_available as proxy for in-house %
if active_orders:
    in_house_perc = sum(1 for o in active_orders if o.get("inventory_available")) / total_active * 100
else:
    in_house_perc = 0

col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Active Orders", total_active)
col2.metric("Orders At Risk", at_risk_count)
col3.metric("SLA Breaches", sla_breaches)
col4.metric("Inventory Available %", f"{in_house_perc:.1f}%")

st.markdown("---")

# --- AI Risk Panel ---
st.subheader("⚠️ AI Risk Panel")
if orders_at_risk:
    st.warning(f"Found {at_risk_count} orders at high risk of SLA breach.")
    risk_df = pd.DataFrame(orders_at_risk)
    
    # Check if necessary columns exist to display
    display_cols = ["order_id", "breach_probability", "remaining_sla_days", "suggested_action"]
    cols_to_show = [c for c in display_cols if c in risk_df.columns]
    
    st.dataframe(risk_df[cols_to_show], use_container_width=True)
else:
    st.success("No high-risk orders detected. Everything is on track!")

st.markdown("---")

# --- Filters & Filtered Table ---
st.subheader("🔍 Filter Orders")
f_col1, f_col2, f_col3 = st.columns(3)
with f_col1:
    filter_status = st.selectbox("Status", ["All", "Order Placed", "In Production", "Ready for Dispatch", "Out for Delivery", "Delivered"])
with f_col2:
    filter_lens = st.selectbox("Lens Type", ["All", "Single Vision", "Progressive", "Bifocal"])
with f_col3:
    filter_store = st.selectbox("Store ID", ["All", "1", "2", "3", "4"])

filtered_orders = fetch_filtered_orders(filter_status, filter_lens, filter_store)
if filtered_orders:
    st.dataframe(pd.DataFrame(filtered_orders), use_container_width=True)
else:
    st.info("No orders match the selected filters.")

st.markdown("---")

# --- Active Orders Table ---
st.subheader("📋 Active Orders")
if active_orders:
    active_df = pd.DataFrame(active_orders)
    display_cols = ["id", "customer_name", "current_status", "lens_type", "sla_countdown_days", "store_id"]
    cols_to_show = [c for c in display_cols if c in active_df.columns]
    st.dataframe(active_df[cols_to_show], use_container_width=True)
else:
    st.info("No active orders found.")

st.markdown("---")

# --- Action Expanders ---
st.subheader("⚙️ Order Actions")

with st.expander("Create New Order"):
    with st.form("create_order_form"):
        c_name = st.text_input("Customer Name")
        c_phone = st.text_input("Customer Phone")
        c_presc = st.text_input("Prescription")
        c_frame = st.text_input("Frame Name")
        c_power = st.text_input("Lens Power (e.g., -2.50)")
        c_ltype = st.selectbox("Lens Type", ["Single Vision", "Progressive", "Bifocal"])
        c_index = st.selectbox("Lens Index", ["1.50", "1.56", "1.61", "1.67"])
        c_coat = st.selectbox("Coating", ["Blue Cut", "Anti-Glare", "Photochromic"])
        c_store = st.number_input("Store ID", min_value=1, max_value=4, step=1)
        
        submit_create = st.form_submit_button("Create Order")
        
        if submit_create:
            if not c_name or not c_phone:
                st.error("Name and Phone are required.")
            else:
                data = {
                    "customer_name": c_name,
                    "customer_phone": c_phone,
                    "prescription": c_presc,
                    "frame_name": c_frame,
                    "lens_power": c_power,
                    "lens_type": c_ltype,
                    "lens_index": c_index,
                    "coating": c_coat,
                    "store_id": int(c_store)
                }
                res = create_order(data)
                if res:
                    st.success(f"Order #{res.get('id')} created successfully!")

with st.expander("Update Order Status"):
    with st.form("update_status_form"):
        u_id = st.number_input("Order ID", min_value=1, step=1)
        u_status = st.selectbox("New Status", ["Order Placed", "In Production", "Ready for Dispatch", "Out for Delivery", "Delivered", "Cancelled"])
        u_reason = st.text_area("Delay Reason (Optional)")
        
        submit_update = st.form_submit_button("Update Status")
        if submit_update:
            res = update_order_status(u_id, u_status, u_reason)
            if res:
                st.success(f"Order #{u_id} updated to '{u_status}'.")
