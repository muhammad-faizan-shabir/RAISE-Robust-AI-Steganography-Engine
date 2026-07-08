"""Pydantic schemas for Notification model"""
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class NotificationBase(BaseModel):
    """Base schema for Notification"""
    type: str = "info"
    title: str
    message: str


class NotificationCreate(NotificationBase):
    """Schema for creating a new notification"""
    user_id: int


class NotificationResponse(NotificationBase):
    """Schema for notification response"""
    id: int
    user_id: int
    is_read: bool = False
    created_at: datetime
    timestamp: datetime
    
    class Config:
        orm_mode = True


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    is_read: Optional[bool] = None
    
    class Config:
        orm_mode = True

