"""Steganography Jobs Model"""
from sqlalchemy import Column, String, Integer, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from core.database import Base
import enum


class OperationType(str, enum.Enum):
    """Operation type enum"""
    EMBED = "EMBED"
    EXTRACT = "EXTRACT"
    GENERATE = "GENERATE"


class JobStatus(str, enum.Enum):
    """Job status enum"""
    PENDING = "PENDING"
    PROGRESS = "PROGRESS"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


class StegoJob(Base):
    """Steganography job model"""
    __tablename__ = "stego_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(Integer, nullable=False, index=True)
    operation_type = Column(SQLEnum(OperationType), nullable=False)
    original_filename = Column(String(255), nullable=False)
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING, nullable=False)
    result = Column(Text, nullable=True)  # JSON string
    error = Column(Text, nullable=True)

    # Records what kind of data was hidden: "text", "image", or "pdf"
    payload_type = Column(String(20), nullable=True)
    # Records which method was used to hide the data: "steganogan" or "lsb"
    method_used = Column(String(20), nullable=True)
    # For embed jobs: the user ID of the intended recipient (NULL = no restriction)
    recipient_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return (
            f"<StegoJob(job_id='{self.job_id}', "
            f"operation_type='{self.operation_type}', "
            f"status='{self.status}', "
            f"method='{self.method_used}', "
            f"payload='{self.payload_type}')>"
        )
