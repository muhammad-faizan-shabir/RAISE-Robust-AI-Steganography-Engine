"""Steganography service with SteganoGAN and LSB fallback"""
import os
import numpy as np
from PIL import Image
from typing_extensions import Literal
from steganogan import SteganoGAN
import torch.optim as _torch_optim

# The pretrained SteganoGAN model was pickled with an older PyTorch that did not
# include 'defaults' in the Adam optimizer state dict.  Newer PyTorch's
# Optimizer.__setstate__ calls self.defaults.setdefault(...) immediately after
# __dict__.update(state), which raises AttributeError when 'defaults' is absent.
# Patch: inject an empty 'defaults' dict into the state before the original
# __setstate__ runs so that self.__dict__.update(state) always populates it.
_orig_optimizer_setstate = _torch_optim.Optimizer.__setstate__

def _patched_optimizer_setstate(self, state):
    if 'defaults' not in state:
        state = {**state, 'defaults': {}}
    _orig_optimizer_setstate(self, state)

_torch_optim.Optimizer.__setstate__ = _patched_optimizer_setstate

# steganogan.utils.bits_to_bytearray joins bits with str(), expecting '0'/'1' strings.
# Newer PyTorch returns boolean tensors, so .tolist() yields True/False, and
# str(True) == 'True' — causing "invalid literal for int() with base 2: 'TrueTrue...'".
# Patch: normalise each element to int(bool(b)) before joining.
import steganogan.utils as _sg_utils
import steganogan.models as _sg_models
_orig_bits_to_bytearray = _sg_utils.bits_to_bytearray

def _patched_bits_to_bytearray(bits):
    normalized = [int(bool(b)) for b in bits]
    return _orig_bits_to_bytearray(normalized)

# Patch both the module attribute AND the already-bound name in models.py,
# since models.py uses `from steganogan.utils import bits_to_bytearray`.
_sg_utils.bits_to_bytearray = _patched_bits_to_bytearray
_sg_models.bits_to_bytearray = _patched_bits_to_bytearray

LSB_HEADER_BYTES = 4  # 4-byte big-endian payload length prefix


class StegoService:
    """
    Service class for steganography operations.
    Supports SteganoGAN (dense/basic) and LSB (Least Significant Bit) methods.
    """

    _models = {}

    # ─── SteganoGAN ──────────────────────────────────────────────────────────

    @classmethod
    def _get_model(cls, architecture: Literal["dense", "basic"]) -> SteganoGAN:
        if architecture not in cls._models:
            cls._models[architecture] = SteganoGAN.load(architecture=architecture)
        return cls._models[architecture]

    @classmethod
    def embed_steganogan(
        cls,
        image_path: str,
        message: str,
        output_path: str,
        architecture: Literal["dense", "basic"] = "dense",
    ) -> str:
        """Embed a message using SteganoGAN neural steganography."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Input image not found: {image_path}")
        model = cls._get_model(architecture)
        model.encode(image_path, output_path, message)
        return output_path

    @classmethod
    def extract_steganogan(
        cls,
        image_path: str,
        architecture: Literal["dense", "basic"] = "dense",
    ) -> str:
        """Extract a message using SteganoGAN neural steganography."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Input image not found: {image_path}")
        model = cls._get_model(architecture)
        return model.decode(image_path)

    # ─── LSB ─────────────────────────────────────────────────────────────────

    @classmethod
    def get_lsb_capacity(cls, image_path: str) -> int:
        """
        Return the maximum number of bytes that can be hidden in the image
        via LSB steganography (excludes the 4-byte internal length header).
        """
        with Image.open(image_path) as img:
            arr = np.array(img.convert("RGB"), dtype=np.uint8)
        # 3 channels, 1 LSB each → 3 bits per pixel → floor(total_bits / 8) bytes
        return arr.size // 8 - LSB_HEADER_BYTES

    @classmethod
    def embed_lsb(cls, image_path: str, data: bytes, output_path: str) -> str:
        """
        Embed raw bytes into the image using LSB steganography.
        Output is always saved as PNG (lossless) regardless of input format.

        Raises:
            FileNotFoundError: if image_path does not exist.
            ValueError: if the data is too large for the cover image.
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Input image not found: {image_path}")

        with Image.open(image_path) as img:
            arr = np.array(img.convert("RGB"), dtype=np.uint8)

        capacity = arr.size // 8 - LSB_HEADER_BYTES
        if len(data) > capacity:
            raise ValueError(
                f"Payload too large for LSB embedding in this image. "
                f"Capacity: {capacity} bytes, required: {len(data)} bytes. "
                f"Please use a larger cover image or reduce the payload size."
            )

        # Prepend 4-byte big-endian length header
        header = len(data).to_bytes(LSB_HEADER_BYTES, "big")
        payload = header + data
        payload_bits = np.unpackbits(np.frombuffer(payload, dtype=np.uint8))

        flat = arr.flatten().copy()
        n = len(payload_bits)
        flat[:n] = (flat[:n] & np.uint8(0xFE)) | payload_bits

        out_img = Image.fromarray(flat.reshape(arr.shape), mode="RGB")
        out_img.save(output_path, "PNG")
        return output_path

    @classmethod
    def extract_lsb(cls, image_path: str) -> bytes:
        """
        Extract bytes hidden via LSB steganography.

        Raises:
            FileNotFoundError: if image_path does not exist.
            ValueError: if the image does not appear to contain valid LSB data.
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Input image not found: {image_path}")

        with Image.open(image_path) as img:
            arr = np.array(img.convert("RGB"), dtype=np.uint8)

        lsbs = (arr.flatten() & np.uint8(1)).astype(np.uint8)

        # Read 4-byte length header
        header_bits = lsbs[: LSB_HEADER_BYTES * 8]
        n_bytes = int.from_bytes(np.packbits(header_bits).tobytes(), "big")

        max_possible = (len(lsbs) - LSB_HEADER_BYTES * 8) // 8
        if n_bytes <= 0 or n_bytes > max_possible:
            raise ValueError(
                f"Invalid LSB header: reported length {n_bytes} bytes is out of range "
                f"(max {max_possible}). This image may not contain LSB-embedded data."
            )

        data_bits = lsbs[LSB_HEADER_BYTES * 8: LSB_HEADER_BYTES * 8 + n_bytes * 8]
        return np.packbits(data_bits).tobytes()[:n_bytes]

    # ─── Backward-compatible aliases ─────────────────────────────────────────

    @classmethod
    def embed_message(
        cls,
        image_path: str,
        message: str,
        output_path: str,
        architecture: Literal["dense", "basic"] = "dense",
    ) -> str:
        return cls.embed_steganogan(image_path, message, output_path, architecture)

    @classmethod
    def extract_message(
        cls,
        image_path: str,
        architecture: Literal["dense", "basic"] = "dense",
    ) -> str:
        return cls.extract_steganogan(image_path, architecture)
