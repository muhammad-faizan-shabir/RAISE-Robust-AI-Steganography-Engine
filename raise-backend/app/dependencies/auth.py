"""Authentication dependencies"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from dependencies.database import get_db
from services.supabase_service import supabase_service
from services.user_service import get_or_create_user
from models.users import User


# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Authorization credentials containing the JWT token
        db: Database session
        
    Returns:
        User object of the authenticated user
        
    Raises:
        HTTPException: If token is invalid or user cannot be found/created
    """
    # --- DEV MODE BYPASS START ---
    # Comment this block IN to bypass auth and force a specific user
    # from models.users import User
    # dev_user = db.query(User).filter(User.email == "your_dev_email@example.com").first()
    # if dev_user:
    #     return dev_user
    # --- DEV MODE BYPASS END ---

    # Extract token from credentials
    token = credentials.credentials
    
    # Verify and extract user info from JWT
    user_info = supabase_service.verify_and_extract(token)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get or create user in our database
    try:
        user = get_or_create_user(db, user_info)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to authenticate user: {str(e)}"
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get current active user (can be extended with active checks).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object if active
        
    Raises:
        HTTPException: If user is not active
    """
    # Add any additional checks here (e.g., user.is_active)
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional authentication dependency that returns None if no token provided.
    Useful for endpoints that work differently for authenticated vs anonymous users.
    
    Args:
        credentials: Optional HTTP Authorization credentials
        db: Database session
        
    Returns:
        User object if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        user_info = supabase_service.verify_and_extract(token)
        
        if not user_info:
            return None
        
        user = get_or_create_user(db, user_info)
        return user
    except Exception:
        return None

