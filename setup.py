from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:Kalyan@localhost:5432/operations_db"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Connected successfully!")