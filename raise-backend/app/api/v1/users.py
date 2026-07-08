"""User management endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from dependencies.database import get_db
from dependencies.auth import get_current_active_user
from schemas.user import UserResponse, UserUpdate
from models.users import User
from services.user_service import update_user_profile
from services.supabase_service import supabase_service

router = APIRouter()


class ChangePasswordRequest(BaseModel):
    """Schema for password change request"""
    current_password: str
    new_password: str


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user information.
    Protected endpoint requiring valid JWT token.
    
    Args:
        current_user: Current authenticated user (from dependency)
        
    Returns:
        UserResponse with current user data
    """
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current authenticated user information.
    Protected endpoint requiring valid JWT token.
    
    Args:
        user_update: User update data
        current_user: Current authenticated user (from dependency)
        db: Database session
        
    Returns:
        UserResponse with updated user data
    """
    try:
        # Update user profile
        updated_user = update_user_profile(
            db=db,
            user_id=current_user.id,
            name=user_update.name,
            username=user_update.username
        )
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: ChangePasswordRequest,
    authorization: str = Header(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Change user password via Supabase.
    Protected endpoint requiring valid JWT token.
    
    Args:
        password_data: Current and new password
        authorization: Bearer token from header
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    try:
        # Extract token from Authorization header
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header"
            )
        
        access_token = authorization.replace("Bearer ", "")
        
        # Update password via Supabase
        if not supabase_service.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable"
            )
        
        # Use Supabase to update password
        try:
            response = supabase_service.client.auth.update_user(
                access_token,
                {"password": password_data.new_password}
            )
            
            if not response:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to update password"
                )
            
            return {"message": "Password updated successfully"}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update password: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

