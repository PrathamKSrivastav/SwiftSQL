import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import utilities (your model inference)
from app.utils import predict_sql

# Define request/response models
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    sql: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Loading ML models...")
    try:
        # Models are loaded when utils.py is imported
        logger.info("✅ Seq2Seq Model loaded (Encoder-Decoder)")
        logger.info("✅ Tokenizers loaded")
    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down ML service...")

# Create FastAPI app
app = FastAPI(
    title="SwiftSQL ML Service",
    description="NLP to SQL Conversion Engine with Seq2Seq",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Health Check Route
# ==========================================
@app.get("/health")
async def health_check():
    """Check service health"""
    return {
        "status": "healthy",
        "service": "SwiftSQL ML Service",
        "version": "2.0.0",
        "model": "Seq2Seq Encoder-Decoder"
    }

# ==========================================
# NLP to SQL Conversion Route
# ==========================================
@app.post("/api/nlp-to-sql", response_model=QueryResponse)
async def generate_sql(request: QueryRequest):
    """Convert natural language to SQL using Seq2Seq model"""
    try:
        sql_query = predict_sql(request.question)
        logger.info(f"✅ Generated SQL: {sql_query}")
        return QueryResponse(sql=sql_query)
    except Exception as e:
        logger.error(f"❌ Error generating SQL: {e}")
        return QueryResponse(sql=f"ERROR: {str(e)}")

# ==========================================
# Root Route
# ==========================================
@app.get("/")
async def root():
    """API info"""
    return {
        "name": "SwiftSQL ML Service",
        "version": "2.0.0",
        "status": "running",
        "model": "Seq2Seq Encoder-Decoder",
        "endpoints": {
            "health": "/health",
            "generate_sql": "/api/nlp-to-sql"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
