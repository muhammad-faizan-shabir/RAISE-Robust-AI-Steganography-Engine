"""Supabase authentication service for JWT verification"""
import jwt
from typing import Optional, Dict, Any
from datetime import datetime
from supabase import create_client, Client

from core.config import settings


class SupabaseService:
    """Service for handling Supabase authentication operations"""
    
    def __init__(self):
        """Initialize Supabase client"""
        self.client: Optional[Client] = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            except Exception as e:
                print(f"Failed to initialize Supabase client: {e}")
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode a Supabase JWT token.
        
        Args:
            token: The JWT token to verify
            
        Returns:
            Dictionary containing token claims if valid, None otherwise
        """
        if not settings.SUPABASE_JWT_SECRET:
            raise ValueError("SUPABASE_JWT_SECRET is not configured")
        
        try:
            # Decode and verify the JWT token
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            
            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                return None
            
            return payload
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {e}")
            return None
        except Exception as e:
            print(f"Error verifying token: {e}")
            return None
    
    def extract_user_info(self, token_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract user information from decoded JWT token payload.
        
        Args:
            token_payload: The decoded JWT token payload
            
        Returns:
            Dictionary containing user information
        """
        # Supabase JWT structure:
        # - sub: user ID (UUID)
        # - email: user email
        # - app_metadata: contains provider info
        # - user_metadata: contains user profile data
        
        user_metadata = token_payload.get("user_metadata", {})
        app_metadata = token_payload.get("app_metadata", {})
        
        return {
            "supabase_id": token_payload.get("sub"),
            "email": token_payload.get("email"),
            "name": user_metadata.get("full_name") or user_metadata.get("name") or token_payload.get("email", "").split("@")[0],
            "provider": app_metadata.get("provider", "email"),
            "email_verified": token_payload.get("email_confirmed_at") is not None
        }
    
    def verify_and_extract(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token and extract user information in one step.
        
        Args:
            token: The JWT token to verify
            
        Returns:
            Dictionary containing user information if token is valid, None otherwise
        """
        payload = self.verify_jwt_token(token)
        if not payload:
            return None
        
        return self.extract_user_info(payload)
    
    def send_password_reset_email(self, email: str) -> bool:
        """
        Send password reset email via Supabase.
        
        Args:
            email: User's email address
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        if not self.client:
            print("Supabase client not initialized")
            return False
        
        try:
            # Supabase will send password reset email
            response = self.client.auth.reset_password_email(email)
            return True
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            return False
    
    def reset_password_with_token(self, access_token: str, new_password: str) -> bool:
        """
        Reset user password using access token from reset link.
        
        Args:
            access_token: The access token from password reset email
            new_password: The new password to set
            
        Returns:
            True if password was reset successfully, False otherwise
        """
        if not self.client:
            print("Supabase client not initialized")
            return False
        
        try:
            # Update password using the access token
            response = self.client.auth.update_user(
                access_token,
                {"password": new_password}
            )
            return response is not None
        except Exception as e:
            print(f"Error resetting password: {e}")
            return False


# Create global instance
supabase_service = SupabaseService()

