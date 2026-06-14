from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from utils.database import get_db
from orders import schemas, service

router = APIRouter()

@router.post("/create", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order_endpoint(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order.
    - Checks if matching lens inventory is available.
    - If available, decrements stock by 1 and sets SLA to 2 days.
    - If not available, sets SLA to 5 days.
    - Calculates expected delivery date and logs initial order status.
    """
    try:
        new_order = service.create_order(db=db, order_data=order)
        return new_order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Wrap any database or logic errors in an HTTP 500 response
        raise HTTPException(status_code=500, detail=str(e))

from typing import List, Optional

@router.get("/", response_model=List[schemas.OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return service.get_orders(db=db, skip=skip, limit=limit)

@router.get("/active", response_model=List[schemas.ActiveOrderResponse])
def get_active_orders(db: Session = Depends(get_db)):
    return service.get_active_orders(db=db)

@router.get("/filter", response_model=List[schemas.OrderResponse])
def filter_orders(
    status: Optional[str] = None,
    lens_type: Optional[str] = None,
    store_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return service.filter_orders(db=db, status=status, lens_type=lens_type, store_id=store_id)

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = service.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int, 
    status_update: schemas.OrderStatusUpdate, 
    db: Session = Depends(get_db)
):
    try:
        return service.update_order_status(db=db, order_id=order_id, status_update=status_update)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
