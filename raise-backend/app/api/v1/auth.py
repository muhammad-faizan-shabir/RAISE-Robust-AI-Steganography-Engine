"""Authentication endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from dependencies.database import get_db
from dependencies.auth import get_current_user, get_current_active_user
from schemas.user import UserResponse, SupabaseAuthRequest
from services.supabase_service import supabase_service
from services.user_service import get_or_create_user, update_last_login, get_user_by_email
from models.users import User

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    """Request schema for forgot password"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request schema for reset password"""
    token: str
    new_password: str


@router.post("/callback", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def auth_callback(auth_request: SupabaseAuthRequest, db: Session = Depends(get_db)):
    """
    Authentication callback endpoint.
    Receives Supabase JWT token from frontend and syncs user to local database.
    
    Frontend should call this after successful Supabase authentication.
    
    Args:
        auth_request: Contains access_token and user data from Supabase
        db: Database session
        
    Returns:
        UserResponse with user data
        
    Raises:
        HTTPException: If token is invalid or user sync fails
    """
    # Verify the JWT token
    user_info = supabase_service.verify_and_extract(auth_request.access_token)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    
    # Verify that the token matches the user data sent by frontend
    if user_info.get("supabase_id") != auth_request.user.supabase_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not match user data"
        )
    
    # Sync user to database
    try:
        user = get_or_create_user(db, {
            "supabase_id": auth_request.user.supabase_id,
            "email": auth_request.user.email,
            "name": auth_request.user.name,
            "provider": auth_request.user.auth_provider
        })
        
        return user
    except Exception as e:
        print(f"Failed to sync user data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync user data: {str(e)}"
        )


@router.post("/refresh", response_model=UserResponse)
async def refresh_token(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Refresh user session.
    Validates current token and updates last login timestamp.
    
    Note: Token refresh is typically handled by Supabase on the frontend.
    This endpoint just validates the token and updates our database.
    
    Args:
        current_user: Current authenticated user (from dependency)
        db: Database session
        
    Returns:
        UserResponse with updated user data
    """
    # Update last login
    update_last_login(db, current_user.id)
    
    # Refresh user data from database
    db.refresh(current_user)
    
    return current_user


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout current user.
    
    Note: Since we're using stateless JWT authentication, actual logout
    is handled on the frontend by removing the token.
    This endpoint can be used for logging logout activity or cleanup.
    
    Args:
        current_user: Current authenticated user (from dependency)
        db: Database session
        
    Returns:
        Success message
    """
    # Could log logout activity here if needed
    # For now, just return success
    
    return {
        "message": "Successfully logged out",
        "detail": "Remove the access token from your client storage"
    }


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset email.
    Sends password reset link via Supabase to user's email.
    
    Args:
        request: Contains user email
        db: Database session
        
    Returns:
        Success message
        
    Note:
        - Always returns success even if email doesn't exist (security best practice)
        - Actual password reset is handled by Supabase
        - Reset link will be sent to user's email
    """
    # Check if user exists in our database
    user = get_user_by_email(db, request.email)
    
    if user and user.supabase_id:
        # User exists and has Supabase account
        # Trigger password reset via Supabase
        try:
            result = supabase_service.send_password_reset_email(request.email)
            if not result:
                # Log error but don't expose to user
                print(f"Failed to send password reset email to {request.email}")
        except Exception as e:
            # Log error but don't expose to user
            print(f"Error sending password reset email: {str(e)}")
    
    # Always return success message (security best practice)
    # Don't reveal whether email exists or not
    return {
        "message": "If an account exists with this email, you will receive a password reset link shortly.",
        "detail": "Please check your email and follow the instructions to reset your password."
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using reset token.
    Verifies token and updates password via Supabase.
    
    Args:
        request: Contains reset token and new password
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If token is invalid or password reset fails
    """
    try:
        # Verify and use the reset token via Supabase
        result = supabase_service.reset_password_with_token(
            request.token,
            request.new_password
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        return {
            "message": "Password reset successful",
            "detail": "You can now login with your new password"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error resetting password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password. Please try again."
        )


@router.get("/health")
async def auth_health_check():
    """
    Health check for auth service.
    Verifies Supabase configuration is present.
    
    Returns:
        Health status
    """
    from core.config import settings
    
    is_configured = bool(
        settings.SUPABASE_URL and 
        settings.SUPABASE_KEY and 
        settings.SUPABASE_JWT_SECRET
    )
    
    return {
        "status": "healthy" if is_configured else "not_configured",
        "supabase_configured": is_configured
    }

