"""AI Horde API client for Stable Diffusion image generation"""
import base64
import logging
from typing import Dict, Optional, Tuple
import httpx

from core.config import settings
from services.preset_prompts import get_preset

logger = logging.getLogger(__name__)


class AIHordeError(Exception):
    """Base exception for AI Horde API errors"""
    pass


class AIHordeTimeoutError(AIHordeError):
    """Raised when generation times out"""
    pass


class AIHordeClient:
    """Client for interacting with AI Horde API"""
    
    def __init__(self):
        """Initialize AI Horde client"""
        self.base_url = settings.AI_HORDE_BASE_URL
        self.api_key = settings.AI_HORDE_API_KEY
        self.timeout = settings.AI_HORDE_TIMEOUT
        self.client = httpx.Client(timeout=30.0)
        
        if not self.api_key:
            logger.warning("No AI Horde API key set - using anonymous mode (lower priority)")
        else:
            logger.info("AI Horde client initialized with API key")
        
    def __del__(self):
        """Cleanup HTTP client"""
        try:
            self.client.close()
        except:
            pass
    
    def _get_headers(self) -> Dict[str, str]:
        """
        Get HTTP headers for API requests.
        
        Returns:
            Dict of headers including API key
        """
        headers = {
            "Content-Type": "application/json",
        }
        # AI Horde requires apikey header, use "0000000000" for anonymous
        if self.api_key:
            headers["apikey"] = self.api_key
        else:
            headers["apikey"] = "0000000000"
        return headers
    
    def submit_generation(self, prompt_or_preset: str) -> str:
        """
        Submit an image generation request to AI Horde.
        
        Args:
            prompt_or_preset: Either a preset name (nature, abstract, etc.) or a custom text prompt
            
        Returns:
            Generation job ID
            
        Raises:
            AIHordeError: If submission fails
        """
        try:
            # Try to get preset first, if it fails, treat as custom prompt
            try:
                preset = get_preset(prompt_or_preset)
                prompt = preset["prompt"]
                logger.info(f"Using preset: {prompt_or_preset}")
            except (KeyError, ValueError):
                # Not a preset, use as custom prompt
                prompt = prompt_or_preset
                logger.info(f"Using custom prompt: {prompt[:50]}...")
            
            # Build params dict
            params = {
                "steps": settings.SD_STEPS,
                "cfg_scale": settings.SD_CFG_SCALE,
                "width": settings.SD_IMAGE_WIDTH,
                "height": settings.SD_IMAGE_HEIGHT,
                "sampler_name": settings.SD_SAMPLER,
                "n": 1
            }
            
            # Build payload according to AI Horde API spec
            payload = {
                "prompt": prompt,
                "params": params,
                "nsfw": False,
                "censor_nsfw": True,
                "trusted_workers": False,
                "r2": True  # Use R2 storage for faster downloads
            }
            
            # Add models if specified, otherwise use any available
            if settings.AI_HORDE_MODEL:
                payload["models"] = [settings.AI_HORDE_MODEL]
            
            logger.info(f"Submitting generation request with prompt: {prompt[:50]}...")
            logger.debug(f"Payload: {payload}")
            
            response = self.client.post(
                f"{self.base_url}/generate/async",
                json=payload,
                headers=self._get_headers()
            )
            
            # Log response for debugging
            if response.status_code != 200:
                logger.error(f"AI Horde API error: Status {response.status_code}")
                logger.error(f"Response body: {response.text}")
            
            response.raise_for_status()
            result = response.json()
            
            job_id = result.get("id")
            if not job_id:
                raise AIHordeError("No job ID returned from AI Horde")
            
            logger.info(f"Generation submitted successfully. Job ID: {job_id}")
            return job_id
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error submitting generation: {str(e)}")
            raise AIHordeError(f"Failed to submit generation: {str(e)}")
        except Exception as e:
            logger.error(f"Error submitting generation: {str(e)}")
            raise AIHordeError(f"Unexpected error: {str(e)}")
    
    def check_status(self, job_id: str) -> Tuple[bool, Dict]:
        """
        Check the status of a generation job.
        
        Args:
            job_id: The generation job ID
            
        Returns:
            Tuple of (is_done, status_info)
            status_info contains: queue_position, wait_time, etc.
            
        Raises:
            AIHordeError: If status check fails
        """
        try:
            response = self.client.get(
                f"{self.base_url}/generate/check/{job_id}",
                headers=self._get_headers()
            )
            
            response.raise_for_status()
            result = response.json()
            
            is_done = result.get("done", False)
            status_info = {
                "done": is_done,
                "queue_position": result.get("queue_position", 0),
                "wait_time": result.get("wait_time", 0),
                "processing": result.get("processing", 0),
                "finished": result.get("finished", 0)
            }
            
            return is_done, status_info
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error checking status: {str(e)}")
            raise AIHordeError(f"Failed to check status: {str(e)}")
        except Exception as e:
            logger.error(f"Error checking status: {str(e)}")
            raise AIHordeError(f"Unexpected error: {str(e)}")
    
    def get_result(self, job_id: str) -> Tuple[bytes, Optional[int]]:
        """
        Get the generated image from a completed job.
        
        Args:
            job_id: The generation job ID
            
        Returns:
            Tuple of (image_data as bytes, seed)
            
        Raises:
            AIHordeError: If retrieval fails
        """
        try:
            response = self.client.get(
                f"{self.base_url}/generate/status/{job_id}",
                headers=self._get_headers()
            )
            
            response.raise_for_status()
            result = response.json()
            
            if not result.get("done"):
                raise AIHordeError("Job is not complete yet")
            
            generations = result.get("generations", [])
            if not generations:
                raise AIHordeError("No generations returned")
            
            generation = generations[0]
            
            # Get image - can be base64 or URL
            img_data = generation.get("img")
            if not img_data:
                raise AIHordeError("No image data in response")
            
            # If it's a URL, download it
            if img_data.startswith("http"):
                logger.info(f"Downloading image from URL: {img_data}")
                img_response = self.client.get(img_data)
                img_response.raise_for_status()
                image_bytes = img_response.content
            else:
                # It's base64 encoded
                logger.info("Decoding base64 image data")
                image_bytes = base64.b64decode(img_data)
            
            seed = generation.get("seed")
            
            logger.info(f"Successfully retrieved generated image. Size: {len(image_bytes)} bytes")
            return image_bytes, seed
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error getting result: {str(e)}")
            raise AIHordeError(f"Failed to get result: {str(e)}")
        except Exception as e:
            logger.error(f"Error getting result: {str(e)}")
            raise AIHordeError(f"Unexpected error: {str(e)}")
    
    def cancel_generation(self, job_id: str) -> bool:
        """
        Cancel a generation job.
        
        Args:
            job_id: The generation job ID
            
        Returns:
            True if cancelled successfully
        """
        try:
            response = self.client.delete(
                f"{self.base_url}/generate/status/{job_id}",
                headers=self._get_headers()
            )
            
            response.raise_for_status()
            logger.info(f"Generation cancelled: {job_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error cancelling generation: {str(e)}")
            return False


# Global client instance
_client = None


def get_ai_horde_client() -> AIHordeClient:
    """
    Get or create the global AI Horde client instance.
    
    Returns:
        AIHordeClient instance
    """
    global _client
    if _client is None:
        _client = AIHordeClient()
    return _client

