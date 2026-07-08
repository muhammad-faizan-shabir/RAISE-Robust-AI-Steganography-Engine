"""zlib-based compression service for steganography message compression"""
import zlib
import base64
import logging

logger = logging.getLogger(__name__)

# Maximum zlib compression level for smallest output
_COMPRESSION_LEVEL = 9


class CompressionService:
    """
    Stateless service providing zlib compression and decompression.

    Both methods work with plain strings and return plain strings so that the
    output is directly compatible with the encryption service and the
    steganography embed endpoint.

    Output format (base64-encoded):
        base64(zlib.compress(text.encode("utf-8")))
    """

    @classmethod
    def compress(cls, text: str) -> str:
        """
        Compress a plain-text string using zlib and return a base64-encoded result.

        Args:
            text: The plain-text message to compress.

        Returns:
            Base64-encoded string of the zlib-compressed data.

        Raises:
            ValueError: If compression fails unexpectedly.
        """
        try:
            compressed_bytes = zlib.compress(text.encode("utf-8"), _COMPRESSION_LEVEL)
            encoded = base64.b64encode(compressed_bytes).decode("utf-8")
            logger.debug(
                "Message compressed: %d chars -> %d base64 chars",
                len(text),
                len(encoded),
            )
            return encoded
        except zlib.error as exc:
            raise ValueError(f"Compression failed: {str(exc)}") from exc

    @classmethod
    def decompress(cls, compressed_text: str) -> str:
        """
        Decompress a base64-encoded zlib-compressed string back to plain text.

        Args:
            compressed_text: Base64-encoded string produced by :meth:`compress`.

        Returns:
            The original plain-text message.

        Raises:
            ValueError: If the input is not valid base64 or not valid zlib data.
        """
        try:
            compressed_bytes = base64.b64decode(compressed_text)
        except Exception as exc:
            raise ValueError("compressed_text is not valid base64.") from exc

        try:
            plain_bytes = zlib.decompress(compressed_bytes)
        except zlib.error as exc:
            raise ValueError(
                f"Decompression failed: the data is invalid or corrupted. ({str(exc)})"
            ) from exc

        logger.debug("Message decompressed successfully")
        return plain_bytes.decode("utf-8")
