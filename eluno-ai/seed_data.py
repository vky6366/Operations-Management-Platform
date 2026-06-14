import random
from utils.database import SessionLocal
from utils.models import Store, LensInventory

def seed_database():
    db = SessionLocal()

    try:
        # 1. Seed Stores
        store_names = ["HSR Layout", "Koramangala", "Indiranagar", "Online"]
        
        # Check if stores already exist to avoid duplicates
        existing_stores = db.query(Store).count()
        if existing_stores == 0:
            stores_to_add = []
            for name in store_names:
                location = name if name != "Online" else "Web"
                stores_to_add.append(Store(store_name=name, location=location))
            
            db.add_all(stores_to_add)
            db.commit()
            print(f"✅ Added {len(stores_to_add)} stores.")
        else:
            print("⚠️ Stores already exist. Skipping store seeding.")

        # 2. Seed Lens Inventory
        # Generate powers from -0.50 to -6.00 in 0.25 steps
        powers = [f"{-i * 0.25:.2f}" for i in range(2, 25)] 
        lens_types = ["Single Vision", "Progressive", "Bifocal"]
        indices = ["1.50", "1.56", "1.61", "1.67"]
        coatings = ["Blue Cut", "Anti-Glare", "Photochromic"]

        existing_inventory = db.query(LensInventory).count()
        if existing_inventory == 0:
            inventory_records = []
            # Insert 75 random records as requested (between 50-100)
            for _ in range(75):
                lens = LensInventory(
                    lens_power=random.choice(powers),
                    lens_type=random.choice(lens_types),
                    lens_index=random.choice(indices),
                    coating=random.choice(coatings),
                    stock_quantity=random.randint(5, 100),  # Random stock between 5 and 100
                    in_house=random.choice([True, False])
                )
                inventory_records.append(lens)
            
            db.add_all(inventory_records)
            db.commit()
            print(f"✅ Added {len(inventory_records)} lens inventory records.")
        else:
            print("⚠️ Inventory already exists. Skipping inventory seeding.")

    except Exception as e:
        db.rollback()
        print(f"❌ An error occurred during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Starting database seeding...")
    seed_database()
    print("✨ Database seeding completed!")
