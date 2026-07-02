import random
from datetime import date, timedelta
from utils.database import SessionLocal
from utils.models import Store, LensInventory, Order, OrderStatusHistory

def seed_orders():
    db = SessionLocal()
    
    try:
        # Check if stores and inventory exist
        stores = db.query(Store).all()
        inventory = db.query(LensInventory).all()
        
        if not stores or not inventory:
            print("Stores or Inventory missing. Please run seed_data.py first.")
            return

        existing_orders = db.query(Order).count()
        if existing_orders >= 50:
            print(f"{existing_orders} orders already exist. Skipping order seeding.")
            return
            
        names = ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Evan Wright", "Fiona Gallagher", "George Lucas", "Hannah Abbott"]
        frames = ["Aviator Black", "Wayfarer Classic", "Round Metal", "Clubmaster", "Cat Eye", "Rimless Titanium", "Geometric Gold"]
        statuses = ["Order Placed", "In Production", "Ready for Dispatch", "Out for Delivery"]
        
        orders_needed = 50 - existing_orders
        orders_to_add = []
        for i in range(orders_needed):  # Create mock orders to reach 50
            store = random.choice(stores)
            lens = random.choice(inventory)
            
            # Randomize stock availability
            in_stock = lens.stock_quantity > 0 and random.choice([True, False])
            sla_days = 2 if in_stock else 5
            
            # Manipulate expected_delivery to show SLA countdowns (some overdue, some on track)
            offset_days = random.randint(-3, 5) 
            expected_del = date.today() + timedelta(days=offset_days)
            
            order = Order(
                customer_name=random.choice(names),
                customer_phone=f"555-010{i:02d}",
                prescription=f"SPH {lens.lens_power} CYL -0.50",
                frame_name=random.choice(frames),
                lens_power=lens.lens_power,
                lens_type=lens.lens_type,
                lens_index=lens.lens_index,
                coating=lens.coating,
                inventory_available=in_stock,
                current_status=random.choice(statuses),
                sla_days=sla_days,
                expected_delivery=expected_del,
                store_id=store.id
            )
            orders_to_add.append(order)
            
        db.add_all(orders_to_add)
        db.commit()
        
        # Add history for each order
        for order in orders_to_add:
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=None,
                new_status=order.current_status
            )
            db.add(history)
            
        db.commit()
        print(f"Successfully seeded {len(orders_to_add)} mock orders.")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding orders: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting order seeding...")
    seed_orders()
