"""Celery tasks module"""
from celery_app.tasks.embed import embed_message
from celery_app.tasks.extract import extract_message

__all__ = ["embed_message", "extract_message"]

