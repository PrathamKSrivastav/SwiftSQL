from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import logging

from app.dependencies import get_inference_service  # Import from dependencies
from app.services.inference import InferenceService

logger = logging.getLogger(__name__)

router = APIRouter()

class ConvertRequest(BaseModel):
    query: str = Field(..., description="Natural language query to convert to SQL", min_length=3)
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "show all users from the database"
            }
        }

class ConvertResponse(BaseModel):
    sql: str = Field(..., description="Generated SQL query")
    original_query: str = Field(..., description="Original natural language query")
    
    class Config:
        json_schema_extra = {
            "example": {
                "sql": "SELECT * FROM users",
                "original_query": "show all users from the database"
            }
        }

class ModelInfoResponse(BaseModel):
    models_loaded: bool
    model_path: str
    input_vocab_size: int
    target_vocab_size: int
    max_lengths: dict

    model_config = {"protected_namespaces": ()}

@router.post("", response_model=ConvertResponse)
async def convert_to_sql(
    request: ConvertRequest,
    inference_service: InferenceService = Depends(get_inference_service)
):
    """
    Convert natural language query to SQL
    
    - **query**: Natural language query (e.g., "show all users")
    """
    try:
        logger.info(f"Converting query: {request.query}")
        
        # Generate SQL using LSTM model
        sql_query = inference_service.predict_sql(request.query)
        
        if not sql_query or sql_query.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="Failed to generate SQL query. Please try rephrasing your question."
            )
        
        return ConvertResponse(
            sql=sql_query,
            original_query=request.query
        )
        
    except RuntimeError as e:
        logger.error(f"Runtime error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request"
        )

@router.get("/info", response_model=ModelInfoResponse)
async def get_model_info(
    inference_service: InferenceService = Depends(get_inference_service)
):
    """Get information about loaded ML models"""
    return inference_service.get_model_info()
