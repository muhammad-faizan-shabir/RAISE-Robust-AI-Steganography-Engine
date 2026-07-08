"""Pydantic schemas for steganography operations"""
from enum import Enum
from typing import Optional, List
from datetime import datetime
from typing_extensions import Literal
from pydantic import BaseModel, Field


class EmbedRequest(BaseModel):
    """Request schema for embedding a message"""
    message: str = Field(..., description="Message to embed in the image")
    architecture: Literal["dense", "basic"] = Field(
        default="dense",
        description="SteganoGAN architecture to use (dense or basic)"
    )


class ExtractRequest(BaseModel):
    """Request schema for extracting a message"""
    architecture: Literal["dense", "basic"] = Field(
        default="dense",
        description="SteganoGAN architecture used for embedding"
    )


class JobResponse(BaseModel):
    """Response schema for job submission"""
    job_id: str = Field(..., description="Unique job identifier")
    status: str = Field(..., description="Job status")
    message: str = Field(..., description="Status message")


class JobStatusResponse(BaseModel):
    """Response schema for job status"""
    job_id: str = Field(..., description="Unique job identifier")
    status: str = Field(..., description="Job status (PENDING, PROGRESS, SUCCESS, FAILURE)")
    result: Optional[dict] = Field(None, description="Job result data")
    error: Optional[str] = Field(None, description="Error message if failed")
    progress: Optional[dict] = Field(None, description="Progress information")


class ExtractResult(BaseModel):
    """Result schema for message extraction"""
    extracted_message: str = Field(..., description="The extracted message")
    image_path: str = Field(..., description="Path to the processed image")


class EmbedResult(BaseModel):
    """Result schema for message embedding"""
    output_image_path: str = Field(..., description="Path to the output image")
    message: str = Field(..., description="Success message")


class ImagePreset(str, Enum):
    """Available image generation presets optimized for steganography"""
    nature = "nature"
    abstract = "abstract"
    architecture = "architecture"
    art = "art"
    portrait = "portrait"


class GenerateRequest(BaseModel):
    """Request schema for image generation"""
    preset: ImagePreset = Field(..., description="Image style preset")


class GenerateResult(BaseModel):
    """Result schema for image generation"""
    output_path: str = Field(..., description="Path to generated image")
    preset: str = Field(..., description="Preset used")
    seed: Optional[int] = Field(None, description="Generation seed from AI Horde")


class JobListItem(BaseModel):
    """Schema for job list item"""
    id: int = Field(..., description="Database ID")
    job_id: str = Field(..., description="Unique job identifier")
    operation_type: str = Field(..., description="Operation type (embed or extract)")
    original_filename: str = Field(..., description="Original filename")
    status: str = Field(..., description="Job status")
    result: Optional[dict] = Field(None, description="Job result data")
    error: Optional[str] = Field(None, description="Error message if failed")
    payload_type: Optional[str] = Field(None, description="Type of embedded payload: text, image, or pdf")
    method_used: Optional[str] = Field(None, description="Steganography method used: steganogan or lsb")
    recipient_id: Optional[int] = Field(None, description="User ID of the intended recipient (embed jobs only)")
    created_at: datetime = Field(..., description="Job creation timestamp")

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    """Response schema for job list"""
    items: List[JobListItem] = Field(..., description="List of jobs")
    total: int = Field(..., description="Total number of jobs")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")


class EncryptTextRequest(BaseModel):
    """Request schema for encrypting a message"""
    text: str = Field(..., description="Plain-text message to encrypt")


class EncryptTextResponse(BaseModel):
    """Response schema for an encrypted message"""
    encrypted_text: str = Field(
        ...,
        description="AES-256-GCM encrypted message encoded as base64 (nonce + ciphertext)"
    )


class DecryptTextRequest(BaseModel):
    """Request schema for decrypting an encrypted message"""
    encrypted_text: str = Field(
        ...,
        description="Base64-encoded encrypted message produced by the /encrypt endpoint"
    )


class DecryptTextResponse(BaseModel):
    """Response schema for a decrypted message"""
    decrypted_text: str = Field(..., description="Original plain-text message")


class CompressTextRequest(BaseModel):
    """Request schema for compressing a message"""
    text: str = Field(..., description="Plain-text message to compress")


class CompressTextResponse(BaseModel):
    """Response schema for a compressed message"""
    compressed_text: str = Field(
        ...,
        description="Base64-encoded zlib-compressed message"
    )


class DecompressTextRequest(BaseModel):
    """Request schema for decompressing a message"""
    compressed_text: str = Field(
        ...,
        description="Base64-encoded compressed message produced by the /compress endpoint"
    )


class DecompressTextResponse(BaseModel):
    """Response schema for a decompressed message"""
    decompressed_text: str = Field(..., description="Original plain-text message")

