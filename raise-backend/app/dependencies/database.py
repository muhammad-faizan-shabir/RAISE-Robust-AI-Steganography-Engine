"""Database dependencies"""
from typing import Generator
from sqlalchemy.orm import Session

from core.database import SessionLocal


def get_db() -> Generator:
    """
    Dependency to get database session.
    Yields a database session and closes it after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

