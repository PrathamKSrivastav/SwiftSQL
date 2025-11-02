"""
Dependency injection for FastAPI endpoints
"""
from fastapi import HTTPException
from typing import Optional

# Global inference service instance
_inference_service: Optional[object] = None

def set_inference_service(service):
    """Set the global inference service instance"""
    global _inference_service
    _inference_service = service

def get_inference_service():
    """Dependency to get inference service"""
    if _inference_service is None:
        raise HTTPException(
            status_code=503,
            detail="ML models not loaded. Service is initializing."
        )
    return _inference_service
