"""Main API v1 router that aggregates all endpoint routers"""
from fastapi import APIRouter

from api.v1 import auth, users, stego, notifications, steganalysis

api_router = APIRouter()

# Include all v1 routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(stego.router, prefix="/stego", tags=["Steganography"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(steganalysis.router, prefix="/steganalysis", tags=["Steganalysis"])

