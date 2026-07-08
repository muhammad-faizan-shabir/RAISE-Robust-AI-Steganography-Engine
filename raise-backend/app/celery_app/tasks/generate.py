"""Celery task for generating images using AI Horde"""
import logging
import os
import time
import uuid
from io import BytesIO

from PIL import Image
from celery_app.worker import celery_app
from celery_app.utils import log_activity
from core.config import settings
from services.ai_horde_client import get_ai_horde_client, AIHordeError, AIHordeTimeoutError

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="celery_app.tasks.generate_image")
def generate_image(
    self,
    preset: str,
    user_id: int = 1
):
    """
    Celery task to generate an image using AI Horde.
    
    Args:
        preset: Image preset name (nature, abstract, architecture, art, portrait)
        user_id: ID of the user performing the action (default: 1)
        
    Returns:
        Dict with status and result information including output_path
    """
    logger.info(f"Starting generate_image task - User ID: {user_id}, Preset: {preset}")
    
    client = get_ai_horde_client()
    job_id = None
    
    try:
        # Log activity
        log_activity(
            user_id=user_id,
            action_type="generate_image",
            details=f"Generating image with preset: {preset}"
        )
        
        # Stage 1: Submit to AI Horde (10% progress)
        self.update_state(
            state="PROGRESS",
            meta={
                "status": "Submitting to AI Horde...",
                "progress": 10,
                "preset": preset
            }
        )
        
        job_id = client.submit_generation(preset)
        logger.info(f"Submitted to AI Horde. Job ID: {job_id}")
        
        # Stage 2: Poll for completion (10-90% progress)
        self.update_state(
            state="PROGRESS",
            meta={
                "status": "Waiting in queue...",
                "progress": 20,
                "ai_horde_job_id": job_id
            }
        )
        
        start_time = time.time()
        max_wait = settings.AI_HORDE_TIMEOUT
        poll_interval = settings.AI_HORDE_POLL_INTERVAL
        
        done = False
        while not done:
            # Check if we've exceeded timeout
            elapsed = time.time() - start_time
            if elapsed > max_wait:
                logger.error(f"Generation timeout after {elapsed:.0f} seconds")
                # Try to cancel the job
                client.cancel_generation(job_id)
                raise AIHordeTimeoutError(
                    f"Generation timeout after {max_wait} seconds. "
                    "Please try again later when AI Horde queue is less busy."
                )
            
            # Check status
            done, status_info = client.check_status(job_id)
            
            if done:
                logger.info("Generation complete!")
                break
            
            # Calculate progress based on queue position and time
            queue_pos = status_info.get("queue_position", 0)
            wait_time = status_info.get("wait_time", 0)
            
            # Progress: 20% to 90% based on various factors
            if queue_pos > 0:
                # In queue, show queue position
                progress = min(90, 20 + (70 * (1 - min(queue_pos / 10, 1))))
                status_msg = f"Position {queue_pos} in queue..."
            else:
                # Processing
                progress = 85
                status_msg = "Generating image..."
            
            self.update_state(
                state="PROGRESS",
                meta={
                    "status": status_msg,
                    "progress": int(progress),
                    "queue_position": queue_pos,
                    "wait_time": wait_time,
                    "elapsed": int(elapsed)
                }
            )
            
            logger.debug(
                f"Status check - Queue: {queue_pos}, "
                f"Wait: {wait_time}s, Elapsed: {elapsed:.0f}s"
            )
            
            # Wait before next poll
            time.sleep(poll_interval)
        
        # Stage 3: Download image (95% progress)
        self.update_state(
            state="PROGRESS",
            meta={
                "status": "Downloading generated image...",
                "progress": 95
            }
        )
        
        image_data, seed = client.get_result(job_id)
        logger.info(f"Downloaded image. Size: {len(image_data)} bytes, Seed: {seed}")
        
        # Stage 4: Save locally (100% progress)
        # Generate unique filename
        filename = f"{uuid.uuid4()}_generated.png"
        output_path = os.path.join(settings.OUTPUT_DIR, filename)
        
        # Ensure output directory exists
        os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
        
        # Convert image to PNG format (AI Horde may return WebP)
        try:
            # Open image from bytes
            image = Image.open(BytesIO(image_data))
            
            # Convert RGBA to RGB if necessary (PNG with transparency -> opaque PNG)
            if image.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                if image.mode in ('RGBA', 'LA'):
                    background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
                    image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Save as PNG
            image.save(output_path, 'PNG')
            logger.info(f"Image converted and saved to: {output_path}")
            
        except Exception as e:
            logger.error(f"Error converting image format: {str(e)}")
            # Fallback: save raw bytes
            with open(output_path, "wb") as f:
                f.write(image_data)
            logger.warning("Saved raw image bytes as fallback")
        
        logger.info(f"Image saved to: {output_path}")
        
        # Return success
        return {
            "status": "completed",
            "message": "Image generated successfully",
            "output_path": output_path,
            "preset": preset,
            "seed": seed,
            "ai_horde_job_id": job_id
        }
        
    except AIHordeTimeoutError as e:
        logger.error(f"Generation timeout: {str(e)}")
        raise Exception(str(e))
        
    except AIHordeError as e:
        logger.error(f"AI Horde error: {str(e)}")
        raise Exception(f"AI Horde error: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        # Try to cancel the job if we have a job_id
        if job_id:
            try:
                client.cancel_generation(job_id)
            except:
                pass
        raise

