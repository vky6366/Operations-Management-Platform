from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utils.database import get_db
from utils.models import LensInventory

router = APIRouter()

@router.get("/stats")
def get_inventory_stats(db: Session = Depends(get_db)):
    """
    Show top 10 lens combinations by available stock.
    """
    results = db.query(
        LensInventory.lens_power,
        LensInventory.lens_type,
        LensInventory.stock_quantity
    ).order_by(LensInventory.stock_quantity.desc()).limit(10).all()
    
    return [
        {
            "name": f"{row.lens_type} ({row.lens_power})", 
            "stock": row.stock_quantity
        }
        for row in results
    ]
