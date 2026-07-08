"""User service for user management operations"""
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from models.users import User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get user by email address.
    
    Args:
        db: Database session
        email: User email address
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_supabase_id(db: Session, supabase_id: str) -> Optional[User]:
    """
    Get user by Supabase ID.
    
    Args:
        db: Database session
        supabase_id: Supabase user ID
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.supabase_id == supabase_id).first()


def get_or_create_user(db: Session, user_info: Dict[str, Any]) -> User:
    """
    Get existing user or create new user from Supabase user info.
    Syncs Supabase user data to local PostgreSQL database.
    
    Args:
        db: Database session
        user_info: Dictionary containing user information from Supabase JWT
                   Expected keys: supabase_id, email, name, provider
        
    Returns:
        User object (existing or newly created)
    """
    supabase_id = user_info.get("supabase_id")
    email = user_info.get("email")
    
    # Try to find user by Supabase ID first
    user = get_user_by_supabase_id(db, supabase_id)
    
    if user:
        # Update last login and sync any changed info
        user.last_login = datetime.utcnow()
        user.name = user_info.get("name", user.name)
        user.email = email  # Update email if changed
        db.commit()
        db.refresh(user)
        return user
    
    # If not found by Supabase ID, check by email (for existing users)
    user = get_user_by_email(db, email)
    
    if user:
        # Link existing user to Supabase account
        user.supabase_id = supabase_id
        user.auth_provider = user_info.get("provider", "email")
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    # Create new user
    new_user = User(
        email=email,
        name=user_info.get("name", email.split("@")[0]),
        supabase_id=supabase_id,
        auth_provider=user_info.get("provider", "email"),
        last_login=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def update_last_login(db: Session, user_id: int) -> None:
    """
    Update user's last login timestamp.
    
    Args:
        db: Database session
        user_id: User ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.last_login = datetime.utcnow()
        db.commit()


def update_user_profile(
    db: Session, 
    user_id: int, 
    name: Optional[str] = None,
    username: Optional[str] = None
) -> User:
    """
    Update user profile information.
    
    Args:
        db: Database session
        user_id: User ID
        name: Optional new name
        username: Optional new username
        
    Returns:
        Updated User object
        
    Raises:
        ValueError: If user not found or username already taken
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise ValueError("User not found")
    
    # Update name if provided
    if name is not None:
        user.name = name
    
    # Check if username is already taken by another user
    if username is not None and username != user.username:
        existing_user = db.query(User).filter(
            User.username == username,
            User.id != user_id
        ).first()
        if existing_user:
            raise ValueError("Username already taken")
        user.username = username
    
    db.commit()
    db.refresh(user)
    return user

