from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from utils.database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String, nullable=False)
    location = Column(String)

    # Relationship
    orders = relationship("Order", back_populates="store", cascade="all, delete-orphan")


class LensInventory(Base):
    __tablename__ = "lens_inventory"

    id = Column(Integer, primary_key=True, index=True)
    lens_power = Column(String)
    lens_type = Column(String)
    lens_index = Column(String)
    coating = Column(String)
    stock_quantity = Column(
        Integer,
        default=0,
        nullable=False
    )
    in_house = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    prescription = Column(Text)
    frame_name = Column(String)
    lens_power = Column(String, index=True)
    lens_type = Column(String, index=True)
    lens_index = Column(String)
    coating = Column(String)
    inventory_available = Column(Boolean)
    current_status = Column(
        String,
        default="Order Placed",
        nullable=False,
        index=True
    )
    sla_days = Column(Integer)
    expected_delivery = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    store_id = Column(
        Integer,
        ForeignKey("stores.id", ondelete="CASCADE")
    )

    # Relationships
    store = relationship("Store", back_populates="orders")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")
    tat_predictions = relationship("TATPrediction", back_populates="order", cascade="all, delete-orphan")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE")
    )
    old_status = Column(String)
    new_status = Column(String)
    delay_reason = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    order = relationship("Order", back_populates="status_history")


class TATPrediction(Base):
    __tablename__ = "tat_predictions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    breach_probability = Column(Float)
    predicted_breach = Column(Boolean)
    model_version = Column(String)
    prediction_time = Column(DateTime, default=datetime.utcnow)

    # Relationship
    order = relationship("Order", back_populates="tat_predictions")
