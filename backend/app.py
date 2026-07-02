from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Database configuration and models
from utils.database import Base, engine
import utils.models  # Import all models to ensure they are registered

# Initialize database tables during startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="Operations Management Platform",
    description="AI-driven internal order and inventory management platform for eyewear operations.",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Operations Management Platform",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

# Include routers with error handling so the app doesn't crash if the files are empty or missing
try:
    from inventory.routes import router as inventory_router
    app.include_router(inventory_router, prefix="/inventory", tags=["Inventory"])
except (ImportError, ModuleNotFoundError) as e:
    logging.warning(f"Skipping inventory routes: {e}")

try:
    from orders.routes import router as orders_router
    app.include_router(orders_router, prefix="/orders", tags=["Orders"])
except (ImportError, ModuleNotFoundError) as e:
    logging.warning(f"Skipping orders routes: {e}")

try:
    from ai_prediction.routes import router as ai_router
    app.include_router(ai_router, prefix="/ai", tags=["AI Prediction"])
except (ImportError, ModuleNotFoundError) as e:
    logging.warning(f"Skipping ai_prediction routes: {e}")

try:
    from alerts.routes import router as alerts_router
    app.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
except (ImportError, ModuleNotFoundError) as e:
    logging.warning(f"Skipping alerts routes: {e}")

try:
    from ai_assistant.routes import router as ai_assistant_router
    app.include_router(ai_assistant_router, prefix="/ai", tags=["AI Operations Assistant"])
except (ImportError, ModuleNotFoundError) as e:
    logging.warning(f"Skipping ai_assistant routes: {e}")

try:
    from dashboard.api_routes import router as dashboard_router
    app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
except (ImportError, ModuleNotFoundError) as e:
    logging.warning(f"Skipping dashboard routes: {e}")
