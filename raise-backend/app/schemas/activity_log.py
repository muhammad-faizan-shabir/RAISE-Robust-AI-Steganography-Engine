"""Pydantic schemas for ActivityLog model"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ActivityLogBase(BaseModel):
    """Base schema for ActivityLog"""
    action_type: str
    details: Optional[str] = None


class ActivityLogCreate(ActivityLogBase):
    """Schema for creating a new activity log"""
    user_id: int


class ActivityLogResponse(ActivityLogBase):
    """Schema for activity log response"""
    id: int
    user_id: int
    timestamp: datetime
    
    class Config:
        orm_mode = True

