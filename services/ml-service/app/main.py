from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api.router import api_router
from app.core.config import settings
from app.services.inference import InferenceService
from app.dependencies import set_inference_service  # Import here

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for ML model loading"""
    
    # Startup: Load ML models
    logger.info("🚀 Loading ML models...")
    try:
        inference_service = InferenceService(settings.MODEL_PATH)
        inference_service.load_models()
        set_inference_service(inference_service)  # Set global instance
        logger.info("✅ ML models loaded successfully")
        yield
    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        raise
    finally:
        # Shutdown: Cleanup
        logger.info("🛑 Shutting down ML service...")
        set_inference_service(None)

# Create FastAPI app
app = FastAPI(
    title="SwiftSQL ML Service",
    description="Natural Language to SQL conversion using LSTM models",
    version="2.0.0",
    lifespan=lifespan
)

# CORS - Only in development
if settings.ENV == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.dependencies import _inference_service
    model_status = "loaded" if _inference_service and _inference_service.models_loaded else "not_loaded"
    
    return {
        "status": "healthy" if model_status == "loaded" else "unhealthy",
        "service": "ml-service",
        "version": "2.0.0",
        "model_status": model_status,
        "environment": settings.ENV
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SwiftSQL ML Service",
        "version": "2.0.0",
        "docs": "/docs"
    }
