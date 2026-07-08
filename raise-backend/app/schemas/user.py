"""Pydantic schemas for User model"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base schema for User"""
    email: EmailStr
    name: str
    username: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user (from Supabase or direct)"""
    supabase_id: Optional[str] = None  # Supabase UUID (required for OAuth)
    auth_provider: Optional[str] = "email"  # email, google, github


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    username: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    username: Optional[str] = None
    auth_provider: Optional[str] = None
    registered_date: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class SupabaseAuthRequest(BaseModel):
    """Schema for Supabase authentication callback from frontend"""
    access_token: str
    user: Optional[UserCreate] = None


class TokenData(BaseModel):
    """Schema for JWT token data"""
    supabase_id: str
    email: str
    name: str
    provider: str
    email_verified: bool

