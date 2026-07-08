"""Steganography endpoints"""
import os
import uuid
import json
import math
import base64
from typing_extensions import Literal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from celery.result import AsyncResult

from dependencies.database import get_db
from dependencies.auth import get_current_user
from models.users import User
from models.stego_jobs import StegoJob, OperationType, JobStatus
from services.user_service import get_user_by_email
from core.config import settings
from celery_app.tasks.embed import embed_message as embed_task
from celery_app.tasks.extract import extract_message as extract_task
from celery_app.tasks.generate import generate_image as generate_task
from schemas.stego import (
    JobResponse, JobStatusResponse, ImagePreset, JobListResponse, JobListItem,
    EncryptTextRequest, EncryptTextResponse, DecryptTextRequest, DecryptTextResponse,
    CompressTextRequest, CompressTextResponse, DecompressTextRequest, DecompressTextResponse,
)
from services.encryption_service import EncryptionService, EncryptionKeyError
from services.compression_service import CompressionService

ALLOWED_SECRET_FILE_TYPES = {
    "image": ["image/png", "image/jpeg"],
    "pdf": ["application/pdf"],
}

router = APIRouter()


def ensure_directories():
    """Ensure upload and output directories exist"""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.OUTPUT_DIR, exist_ok=True)


def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )


async def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    """Save uploaded file to destination"""
    try:
        with open(destination, "wb") as buffer:
            content = await upload_file.read()
            
            # Check file size
            if len(content) > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
                )
            
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )


@router.post("/embed", response_model=JobResponse)
async def embed_message(
    image: UploadFile = File(..., description="Image file to embed message into"),
    message: Optional[str] = Form(None, description="Secret message to embed"),
    content_type: Literal["text", "image", "pdf"] = Form(
        default="text",
        description="Type of content to embed: text, image, or pdf"
    ),
    secret_file: Optional[UploadFile] = File(None, description="Secret file to embed (image or PDF)"),
    architecture: Literal["dense", "basic"] = Form(
        default="dense",
        description="SteganoGAN architecture to use"
    ),
    method: Literal["auto", "steganogan", "lsb"] = Form(
        default="auto",
        description="Embedding method: 'auto' tries SteganoGAN first then falls back to LSB, 'steganogan' forces SteganoGAN (no fallback), 'lsb' uses LSB directly"
    ),
    recipient_email: Optional[str] = Form(
        default=None,
        description="Email of the intended recipient. If provided, only this user (and the embedder) can extract the data."
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Embed a secret message, image, or PDF into an image using SteganoGAN.
    Protected endpoint requiring authentication.

    Parameters:
    - image: Cover image file (JPEG or PNG)
    - message: Secret message to embed (required when content_type is "text")
    - content_type: Type of content to embed ("text", "image", or "pdf")
    - secret_file: Secret file to embed (required when content_type is "image" or "pdf")
    - architecture: Model architecture ('dense' or 'basic')

    Returns: Job ID and initial status
    """
    ensure_directories()
    validate_image_file(image)

    # Build the message to embed
    if content_type == "text":
        if not message or not message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message is required when content_type is 'text'"
            )
        embed_payload = message
    else:
        # content_type is "image" or "pdf"
        if not secret_file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"secret_file is required when content_type is '{content_type}'"
            )

        # Validate secret file type
        allowed_types = ALLOWED_SECRET_FILE_TYPES.get(content_type, [])
        if secret_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid secret file type '{secret_file.content_type}'. Allowed for {content_type}: {', '.join(allowed_types)}"
            )

        # Read and base64-encode the secret file
        file_bytes = await secret_file.read()
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Secret file too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
            )

        b64_data = base64.b64encode(file_bytes).decode("utf-8")
        original_filename = secret_file.filename or "unknown"
        mime_type = secret_file.content_type
        embed_payload = f"RAISE_FILE:{mime_type}:{original_filename}:{b64_data}"

    # Resolve recipient user
    recipient_id = None
    if recipient_email and recipient_email.strip():
        recipient_email = recipient_email.strip().lower()
        if recipient_email == current_user.email.lower():
            # Embedder listed themselves — treat as no separate recipient
            recipient_id = current_user.id
        else:
            recipient_user = get_user_by_email(db, recipient_email)
            if not recipient_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No registered user found with email '{recipient_email}'. "
                           "The recipient must have an account before you can send them protected data."
                )
            recipient_id = recipient_user.id

    # Generate unique job ID and file paths
    job_id = str(uuid.uuid4())
    file_extension = os.path.splitext(image.filename)[1]
    input_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}_input{file_extension}")
    output_path = os.path.join(settings.OUTPUT_DIR, f"{job_id}_output{file_extension}")

    # Save uploaded file
    await save_upload_file(image, input_path)

    # Submit task to Celery
    task = embed_task.apply_async(
        kwargs={
            "image_path": input_path,
            "message": embed_payload,
            "output_path": output_path,
            "architecture": architecture,
            "user_id": current_user.id,
            "payload_type": content_type,
            "method": method,
            "recipient_id": recipient_id,
        },
        task_id=job_id,
    )

    # Save job to database (payload_type and recipient are known at creation time)
    db_job = StegoJob(
        job_id=job_id,
        user_id=current_user.id,
        operation_type=OperationType.EMBED,
        original_filename=image.filename,
        status=JobStatus.PENDING,
        payload_type=content_type,
        recipient_id=recipient_id,
    )
    db.add(db_job)
    db.commit()

    return JobResponse(
        job_id=task.id,
        status="PENDING",
        message="Embedding task submitted successfully"
    )


@router.post("/extract", response_model=JobResponse)
async def extract_message(
    image: UploadFile = File(..., description="Image file with embedded message"),
    architecture: Literal["dense", "basic"] = Form(
        default="dense",
        description="SteganoGAN architecture used for embedding (only relevant when method!='lsb')"
    ),
    method: Literal["auto", "steganogan", "lsb"] = Form(
        default="auto",
        description="Extraction method: 'auto' tries SteganoGAN first then falls back to LSB, 'steganogan' forces SteganoGAN, 'lsb' uses LSB directly"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Extract a secret message from an image.
    Protected endpoint requiring authentication.

    Parameters:
    - image: Image file with embedded message (JPEG or PNG)
    - architecture: SteganoGAN architecture used during embedding ('dense' or 'basic')
    - method: Extraction method ('steganogan' or 'lsb') — must match what was used to embed

    Returns: Job ID and initial status
    """
    ensure_directories()
    validate_image_file(image)

    # Generate unique job ID and file path
    job_id = str(uuid.uuid4())
    file_extension = os.path.splitext(image.filename)[1]
    input_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}_extract{file_extension}")

    # Save uploaded file
    await save_upload_file(image, input_path)

    # Submit task to Celery
    task = extract_task.apply_async(
        kwargs={
            "image_path": input_path,
            "architecture": architecture,
            "user_id": current_user.id,
            "method": method,
        },
        task_id=job_id,
    )

    # Save job to database (method_used is updated on completion for auto mode)
    db_job = StegoJob(
        job_id=job_id,
        user_id=current_user.id,
        operation_type=OperationType.EXTRACT,
        original_filename=image.filename,
        status=JobStatus.PENDING,
        method_used=method if method != "auto" else None,
    )
    db.add(db_job)
    db.commit()

    return JobResponse(
        job_id=task.id,
        status="PENDING",
        message="Extraction task submitted successfully"
    )


@router.post("/generate", response_model=JobResponse)
async def generate_cover_image(
    preset: ImagePreset = Form(..., description="Image style preset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a steganography-optimized cover image using AI Horde.
    Protected endpoint requiring authentication.
    
    This endpoint submits an image generation request to AI Horde, a free
    crowdsourced GPU cluster. The generation is processed asynchronously
    using Celery. Use the job_id to track progress and download the result.
    
    Presets:
    - nature: Natural landscapes with smooth gradients and textures
    - abstract: Geometric patterns with uniform color distribution
    - architecture: Buildings and interiors with clean lines
    - art: Artistic paintings that mask embedding changes
    - portrait: Professional portraits with complex regions
    
    Process:
    1. Submits generation request to AI Horde
    2. Polls for completion (typically 30s-5min depending on queue)
    3. Downloads and stores image locally
    
    Parameters:
    - preset: Image style preset (nature, abstract, architecture, art, portrait)
    
    Returns: Job ID to track progress via /jobs/{job_id}
    """
    ensure_directories()
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Submit task to Celery with current user's ID
    task = generate_task.apply_async(
        args=[preset, current_user.id],  # preset, user_id
        task_id=job_id
    )
    
    # Save job to database
    db_job = StegoJob(
        job_id=job_id,
        user_id=current_user.id,
        operation_type=OperationType.GENERATE,
        original_filename=f"preset_{preset}",
        status=JobStatus.PENDING
    )
    db.add(db_job)
    db.commit()
    
    return JobResponse(
        job_id=task.id,
        status="PENDING",
        message=f"Image generation submitted to AI Horde with preset: {preset}"
    )


@router.post("/generate-custom", response_model=JobResponse)
async def generate_custom_image(
    prompt: str = Form(..., description="Custom text prompt for image generation"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a custom cover image using AI Horde with a text prompt.
    Protected endpoint requiring authentication.
    
    This endpoint allows you to generate images using your own custom text prompt
    instead of predefined presets. The generation is processed asynchronously
    using Celery via AI Horde's crowdsourced GPU cluster.
    
    Process:
    1. Submits your custom prompt to AI Horde
    2. Polls for completion (typically 30s-5min depending on queue and complexity)
    3. Downloads and stores the generated image locally
    
    Tips for good prompts:
    - Be specific and descriptive
    - Include style keywords (e.g., "photorealistic", "oil painting", "digital art")
    - Mention desired elements (e.g., "sunset over mountains", "abstract geometric patterns")
    - Avoid overly complex or contradictory descriptions
    
    Examples:
    - "A serene mountain landscape at sunset with smooth gradients"
    - "Abstract geometric patterns with vibrant colors and clean lines"
    - "A professional portrait of a person in soft lighting"
    - "Futuristic cityscape with neon lights and reflections"
    
    Parameters:
    - prompt: Your custom text description for the image
    
    Returns: Job ID to track progress via /jobs/{job_id}
    """
    ensure_directories()
    
    # Validate prompt
    if not prompt or len(prompt.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt must be at least 3 characters long"
        )
    
    if len(prompt) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt must be less than 1000 characters"
        )
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # Submit task to Celery with custom prompt
    task = generate_task.apply_async(
        args=[prompt, current_user.id],  # prompt (as string), user_id
        task_id=job_id
    )
    
    # Save job to database
    db_job = StegoJob(
        job_id=job_id,
        user_id=current_user.id,
        operation_type=OperationType.GENERATE,
        original_filename=f"custom_prompt",
        status=JobStatus.PENDING
    )
    db.add(db_job)
    db.commit()
    
    return JobResponse(
        job_id=task.id,
        status="PENDING",
        message=f"Custom image generation submitted to AI Horde with prompt: {prompt[:50]}..."
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the status of a steganography job.
    Protected endpoint requiring authentication.
    
    Poll this endpoint to check the progress and result of an embed or extract job.
    
    Job States:
    - PENDING: Job is queued
    - PROGRESS: Job is being processed
    - SUCCESS: Job completed successfully
    - FAILURE: Job failed
    
    Parameters:
    - job_id: The job ID returned from embed or extract endpoint
    
    Returns: Job status and result (if completed)
    """
    task_result = AsyncResult(job_id)
    
    # Update database with current status
    db_job = db.query(StegoJob).filter(StegoJob.job_id == job_id).first()
    if db_job:
        db_job.status = (
            JobStatus[task_result.state]
            if task_result.state in ["PENDING", "PROGRESS", "SUCCESS", "FAILURE"]
            else JobStatus.PENDING
        )

        if task_result.state == "SUCCESS":
            result_data = task_result.result or {}
            db_job.result = json.dumps(result_data)
            # Persist method, payload type, and recipient from the task result
            if isinstance(result_data, dict):
                if result_data.get("method_used") and not db_job.method_used:
                    db_job.method_used = result_data["method_used"]
                if result_data.get("payload_type") and not db_job.payload_type:
                    db_job.payload_type = result_data["payload_type"]
                elif result_data.get("content_type") and not db_job.payload_type:
                    db_job.payload_type = result_data["content_type"]
                if result_data.get("recipient_id") and not db_job.recipient_id:
                    db_job.recipient_id = result_data["recipient_id"]
        elif task_result.state == "FAILURE":
            db_job.error = str(task_result.info)

        db.commit()
    
    response = JobStatusResponse(
        job_id=job_id,
        status=task_result.state,
        result=None,
        error=None,
        progress=None
    )
    
    if task_result.state == "PENDING":
        response.result = {"message": "Job is waiting to be processed"}
    elif task_result.state == "PROGRESS":
        response.progress = task_result.info
        response.result = {"message": task_result.info.get("status", "Processing...")}
    elif task_result.state == "SUCCESS":
        response.result = task_result.result
    elif task_result.state == "FAILURE":
        response.error = str(task_result.info)
        response.result = {"message": "Job failed"}
    
    return response


@router.get("/download/{job_id}")
async def download_result(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download the result image from an embed job.
    Protected endpoint requiring authentication.
    
    Use this endpoint to download the image with the embedded message after the
    embed job has completed successfully.
    
    Parameters:
    - job_id: The job ID from the embed endpoint
    
    Returns: The processed image file
    """
    task_result = AsyncResult(job_id)
    
    if task_result.state != "SUCCESS":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Job is not ready. Current status: {task_result.state}"
        )
    
    result = task_result.result

    # Handle extract jobs that contain an extracted file
    if "extracted_file_path" in result:
        file_path = result["extracted_file_path"]
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Extracted file not found"
            )
        return FileResponse(
            path=file_path,
            media_type=result.get("extracted_mime_type", "application/octet-stream"),
            filename=result.get("extracted_filename", f"extracted_{job_id}"),
        )

    # Handle embed jobs (has output_path)
    if "output_path" not in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job does not have a downloadable result"
        )

    output_path = result["output_path"]

    if not os.path.exists(output_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result file not found"
        )

    # Determine filename
    filename = f"embedded_{job_id}.png"

    return FileResponse(
        path=output_path,
        media_type="image/png",
        filename=filename
    )


@router.get("", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    operation_type: Optional[str] = Query(None, description="Filter by operation type (embed, extract, or generate)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all steganography jobs for the current user.
    Protected endpoint requiring authentication.
    
    Returns a paginated list of all jobs (embed, extract, and generate) submitted by the user.
    Jobs are ordered by creation date (newest first).
    
    Parameters:
    - page: Page number (default: 1)
    - page_size: Number of items per page (default: 10, max: 100)
    - operation_type: Filter by operation type ('embed', 'extract', or 'generate')
    
    Returns: Paginated list of jobs with their current status
    """
    # Build query
    query = db.query(StegoJob).filter(StegoJob.user_id == current_user.id)
    
    # Apply operation type filter if provided
    if operation_type:
        if operation_type.lower() == "embed":
            query = query.filter(StegoJob.operation_type == OperationType.EMBED)
        elif operation_type.lower() == "extract":
            query = query.filter(StegoJob.operation_type == OperationType.EXTRACT)
        elif operation_type.lower() == "generate":
            query = query.filter(StegoJob.operation_type == OperationType.GENERATE)
    
    # Get total count
    total = query.count()
    
    # Calculate pagination
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    
    # Get paginated results
    jobs = query.order_by(desc(StegoJob.created_at)).offset(offset).limit(page_size).all()
    
    # Convert jobs to response format
    items = []
    for job in jobs:
        result_dict = None
        if job.result:
            try:
                result_dict = json.loads(job.result)
            except:
                result_dict = None
        
        items.append(JobListItem(
            id=job.id,
            job_id=job.job_id,
            operation_type=job.operation_type.value.lower(),
            original_filename=job.original_filename,
            status=job.status.value,
            result=result_dict,
            error=job.error,
            payload_type=job.payload_type,
            method_used=job.method_used,
            recipient_id=job.recipient_id,
            created_at=job.created_at,
        ))
    
    return JobListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/encrypt", response_model=EncryptTextResponse)
async def encrypt_text(
    request: EncryptTextRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Encrypt a plain-text message using AES-256-GCM.
    Protected endpoint requiring authentication.

    The encryption key is managed server-side via the ENCRYPTION_KEY environment
    variable. The returned base64 string embeds the nonce and is self-contained
    for decryption via the /decrypt endpoint.

    Intended workflow:
    1. Encrypt your message here → receive encrypted_text
    2. Use encrypted_text as the message field in POST /embed
    3. After extraction (POST /extract), pass the result to POST /decrypt

    Parameters:
    - text: Plain-text message to encrypt

    Returns: Base64-encoded AES-256-GCM ciphertext (nonce + ciphertext)
    """
    try:
        encrypted = EncryptionService.encrypt(request.text)
    except EncryptionKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Encryption service is not configured: {str(exc)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Encryption failed: {str(exc)}"
        )
    return EncryptTextResponse(encrypted_text=encrypted)


@router.post("/decrypt", response_model=DecryptTextResponse)
async def decrypt_text(
    request: DecryptTextRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Decrypt an AES-256-GCM encrypted message.
    Protected endpoint requiring authentication.

    Accepts the base64-encoded ciphertext produced by POST /encrypt and returns
    the original plain-text message. Returns 400 if the payload is invalid or
    has been tampered with.

    Parameters:
    - encrypted_text: Base64-encoded ciphertext from the /encrypt endpoint

    Returns: Original plain-text message
    """
    try:
        decrypted = EncryptionService.decrypt(request.encrypted_text)
    except EncryptionKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Encryption service is not configured: {str(exc)}"
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Decryption failed: {str(exc)}"
        )
    return DecryptTextResponse(decrypted_text=decrypted)


@router.post("/compress", response_model=CompressTextResponse)
async def compress_text(
    request: CompressTextRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Compress a plain-text message using zlib and return a base64-encoded result.
    Protected endpoint requiring authentication.

    Reduces the size of the message before embedding, which is useful when the
    cover image has limited capacity. The output is a printable base64 string
    that can be passed directly to POST /encrypt or POST /embed.

    Intended workflow:
    1. Compress your message here → receive compressed_text
    2. Optionally encrypt compressed_text via POST /encrypt
    3. Use the result as the message field in POST /embed
    4. After extraction, reverse the steps: decrypt (if encrypted) then decompress

    Parameters:
    - text: Plain-text message to compress

    Returns: Base64-encoded zlib-compressed string
    """
    try:
        compressed = CompressionService.compress(request.text)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Compression failed: {str(exc)}"
        )
    return CompressTextResponse(compressed_text=compressed)


@router.post("/decompress", response_model=DecompressTextResponse)
async def decompress_text(
    request: DecompressTextRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Decompress a base64-encoded zlib-compressed message back to plain text.
    Protected endpoint requiring authentication.

    Accepts the base64-encoded string produced by POST /compress and returns
    the original plain-text message. Returns 400 if the payload is invalid
    or corrupted.

    Parameters:
    - compressed_text: Base64-encoded compressed message from the /compress endpoint

    Returns: Original plain-text message
    """
    try:
        decompressed = CompressionService.decompress(request.compressed_text)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Decompression failed: {str(exc)}"
        )
    return DecompressTextResponse(decompressed_text=decompressed)

