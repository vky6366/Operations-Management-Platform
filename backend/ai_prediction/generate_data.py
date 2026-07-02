import os
import random
import pandas as pd

# Define possible values based on models.py and seed_data.py
LENS_TYPES = ["Single Vision", "Progressive", "Bifocal"]
STATUSES = ["Delivered", "Order Placed", "In Production", "Ready for Dispatch", "Out for Delivery"]

def generate_synthetic_data(num_records=1000, output_path="data/synthetic_orders.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    data = []
    for i in range(1, num_records + 1):
        lens_type = random.choice(LENS_TYPES)
        store_id = random.randint(1, 4)
        inventory_available = random.choice([True, False])
        
        # If inventory is available, SLA is usually shorter (e.g. 2 days) else 5 days
        sla_days = 2 if inventory_available else 5
        
        current_status = random.choice(STATUSES)
        
        # Simulate days elapsed
        days_elapsed = random.randint(1, 10)
        
        previous_qc_failures = random.randint(0, 3)
        
        # Determine breach logic (mostly for generating realistic-looking target)
        # Higher days_elapsed relative to sla_days -> higher chance of breach
        # More QC failures -> higher chance
        breach_score = (days_elapsed / sla_days) + (previous_qc_failures * 0.5)
        
        # Add some randomness to breached flag
        if breach_score > 1.2:
            breached = random.choices([1, 0], weights=[0.8, 0.2])[0]
        else:
            breached = random.choices([1, 0], weights=[0.1, 0.9])[0]
            
        record = {
            "order_id": i,
            "lens_type": lens_type,
            "store_id": store_id,
            "inventory_available": int(inventory_available),
            "current_status": current_status,
            "days_elapsed": days_elapsed,
            "previous_qc_failures": previous_qc_failures,
            "sla_days": sla_days,
            "breached": breached
        }
        data.append(record)

    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Generated {num_records} synthetic order records at {output_path}")

if __name__ == "__main__":
    # Ensure it writes to the correct backend/data directory
    output_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "synthetic_orders.csv")
    generate_synthetic_data(1000, output_file)
