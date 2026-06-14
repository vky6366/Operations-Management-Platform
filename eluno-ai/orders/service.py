from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional
from utils.models import Order, LensInventory, OrderStatusHistory, Store
from orders import schemas

def create_order(db: Session, order_data: schemas.OrderCreate) -> Order:
    try:
        # 1. Validate Store
        store = db.query(Store).filter(Store.id == order_data.store_id).first()
        if not store:
            raise ValueError("Invalid store ID")

        # 2. Search lens_inventory for matching criteria
        inventory = db.query(LensInventory).filter(
            LensInventory.lens_power == order_data.lens_power,
            LensInventory.lens_type == order_data.lens_type,
            LensInventory.lens_index == order_data.lens_index,
            LensInventory.coating == order_data.coating
        ).first()

        # 3. Check stock and set SLA
        if inventory and inventory.stock_quantity > 0:
            inventory_available = True
            inventory.stock_quantity -= 1
            sla_days = 2
        else:
            inventory_available = False
            sla_days = 5

        expected_delivery = date.today() + timedelta(days=sla_days)

        # 4. Create Order
        new_order = Order(
            customer_name=order_data.customer_name,
            customer_phone=order_data.customer_phone,
            prescription=order_data.prescription,
            frame_name=order_data.frame_name,
            lens_power=order_data.lens_power,
            lens_type=order_data.lens_type,
            lens_index=order_data.lens_index,
            coating=order_data.coating,
            inventory_available=inventory_available,
            current_status="Order Placed",
            sla_days=sla_days,
            expected_delivery=expected_delivery,
            store_id=order_data.store_id
        )
        
        db.add(new_order)
        db.flush()  # gets new_order.id without committing

        # 5. Create initial OrderStatusHistory entry
        status_history = OrderStatusHistory(
            order_id=new_order.id,
            old_status=None,
            new_status="Order Placed",
            delay_reason=None
        )
        db.add(status_history)
        
        # 6. Commit transaction
        db.commit()
        db.refresh(new_order)
        
        return new_order
    except Exception:
        db.rollback()
        raise

def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
    return db.query(Order).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()

def update_order_status(db: Session, order_id: int, status_update: schemas.OrderStatusUpdate) -> Order:
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError("Order not found")

        old_status = order.current_status
        order.current_status = status_update.new_status

        status_history = OrderStatusHistory(
            order_id=order.id,
            old_status=old_status,
            new_status=status_update.new_status,
            delay_reason=status_update.delay_reason
        )
        db.add(status_history)
        
        db.commit()
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise

def get_active_orders(db: Session) -> List[dict]:
    # Define active statuses (e.g. anything not fully delivered/cancelled)
    active_statuses = ["Order Placed", "In Production", "Ready for Dispatch", "Out for Delivery"]
    orders = db.query(Order).filter(Order.current_status.in_(active_statuses)).all()
    
    result = []
    for o in orders:
        countdown = (o.expected_delivery - date.today()).days
        # Build dictionary from model properties
        order_dict = {c.name: getattr(o, c.name) for c in o.__table__.columns}
        order_dict["sla_countdown_days"] = countdown
        result.append(order_dict)
    return result

def filter_orders(
    db: Session, 
    status: Optional[str] = None, 
    lens_type: Optional[str] = None, 
    store_id: Optional[int] = None
) -> List[Order]:
    query = db.query(Order)
    if status:
        query = query.filter(Order.current_status == status)
    if lens_type:
        query = query.filter(Order.lens_type == lens_type)
    if store_id:
        query = query.filter(Order.store_id == store_id)
    return query.all()
