"""Celery worker configuration"""
import warnings
from celery import Celery

from core.config import settings

# Suppress PyTorch SourceChangeWarning
warnings.filterwarnings("ignore", message=".*source code.*has changed.*")

# Create Celery app instance
celery_app = Celery(
    "raise_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "celery_app.tasks.embed",
        "celery_app.tasks.extract",
        "celery_app.tasks.generate"
    ]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

if __name__ == "__main__":
    celery_app.start()

