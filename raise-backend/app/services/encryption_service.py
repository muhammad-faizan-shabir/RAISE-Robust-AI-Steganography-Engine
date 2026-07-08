"""AES-256-GCM encryption service for steganography message encryption"""
import os
import base64
import binascii
import logging
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

from core.config import settings

logger = logging.getLogger(__name__)

NONCE_SIZE = 12  # 96-bit nonce recommended for AES-GCM


class EncryptionKeyError(Exception):
    """Raised when the encryption key is missing or malformed."""
    pass


class EncryptionService:
    """
    Stateless service providing AES-256-GCM encryption and decryption.

    The key is sourced exclusively from the ENCRYPTION_KEY environment variable
    (a 64-character hex string representing 32 bytes). The nonce is randomly
    generated per encryption call and prepended to the ciphertext so that the
    combined payload is self-contained for decryption.

    Output format (base64-encoded):
        nonce (12 bytes) || ciphertext+tag (variable)
    """

    @classmethod
    def _get_key(cls) -> bytes:
        """
        Load and validate the AES-256 key from settings.

        Returns:
            32-byte key as bytes.

        Raises:
            EncryptionKeyError: If ENCRYPTION_KEY is missing or not a valid 64-char hex string.
        """
        raw = settings.ENCRYPTION_KEY
        if not raw:
            raise EncryptionKeyError(
                "ENCRYPTION_KEY is not set. Generate one with: openssl rand -hex 32"
            )
        try:
            key_bytes = binascii.unhexlify(raw)
        except (binascii.Error, ValueError) as exc:
            raise EncryptionKeyError(
                "ENCRYPTION_KEY must be a 64-character hexadecimal string."
            ) from exc

        if len(key_bytes) != 32:
            raise EncryptionKeyError(
                f"ENCRYPTION_KEY decoded to {len(key_bytes)} bytes; expected 32 (64 hex chars)."
            )
        return key_bytes

    @classmethod
    def encrypt(cls, plain_text: str) -> str:
        """
        Encrypt a plain-text string using AES-256-GCM.

        A fresh random 12-byte nonce is generated for each call. The resulting
        payload is ``base64(nonce || ciphertext+tag)``.

        Args:
            plain_text: The message to encrypt.

        Returns:
            Base64-encoded string containing the nonce and authenticated ciphertext.

        Raises:
            EncryptionKeyError: If the server encryption key is misconfigured.
        """
        key = cls._get_key()
        aesgcm = AESGCM(key)
        nonce = os.urandom(NONCE_SIZE)
        ciphertext = aesgcm.encrypt(nonce, plain_text.encode("utf-8"), None)
        payload = nonce + ciphertext
        encoded = base64.b64encode(payload).decode("utf-8")
        logger.debug("Message encrypted successfully (payload length: %d bytes)", len(payload))
        return encoded

    @classmethod
    def decrypt(cls, encrypted_text: str) -> str:
        """
        Decrypt a previously encrypted string using AES-256-GCM.

        Args:
            encrypted_text: Base64-encoded string produced by :meth:`encrypt`.

        Returns:
            The original plain-text message.

        Raises:
            EncryptionKeyError: If the server encryption key is misconfigured.
            ValueError: If the input is not valid base64, too short, or the
                authentication tag fails (i.e. tampered or wrong key).
        """
        key = cls._get_key()

        try:
            payload = base64.b64decode(encrypted_text)
        except Exception as exc:
            raise ValueError("encrypted_text is not valid base64.") from exc

        if len(payload) <= NONCE_SIZE:
            raise ValueError(
                f"encrypted_text payload is too short "
                f"(got {len(payload)} bytes, need more than {NONCE_SIZE})."
            )

        nonce = payload[:NONCE_SIZE]
        ciphertext = payload[NONCE_SIZE:]

        aesgcm = AESGCM(key)
        try:
            plain_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        except InvalidTag as exc:
            raise ValueError(
                "Decryption failed: the ciphertext is invalid or has been tampered with."
            ) from exc

        logger.debug("Message decrypted successfully")
        return plain_bytes.decode("utf-8")
