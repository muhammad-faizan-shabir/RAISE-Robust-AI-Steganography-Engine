"""Utility functions for Celery tasks"""
import logging
from datetime import datetime

from core.database import SessionLocal
from models import ActivityLog

logger = logging.getLogger(__name__)


def log_activity(user_id: int, action_type: str, details: str = None):
    """
    Helper function to log user activity to the database.
    
    Args:
        user_id: ID of the user performing the action
        action_type: Type of action being performed
        details: Optional additional details about the action
    """
    db = SessionLocal()
    try:
        activity_log = ActivityLog(
            user_id=user_id,
            action_type=action_type,
            details=details,
            timestamp=datetime.utcnow()
        )
        db.add(activity_log)
        db.commit()
        logger.info(f"Activity logged - User: {user_id}, Action: {action_type}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log activity: {e}")
    finally:
        db.close()

