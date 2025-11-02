from fastapi import APIRouter
from app.api.endpoints import convert

api_router = APIRouter()

api_router.include_router(convert.router, prefix="/convert", tags=["conversion"])
