"""Preset prompts optimized for steganography"""

# Steganography-optimized image generation presets
# These prompts are designed to generate images with characteristics
# favorable for embedding hidden data with minimal visual artifacts

PRESETS = {
    "nature": {
        "prompt": (
            "beautiful serene landscape, rolling hills, calm lake reflection, "
            "soft clouds, natural lighting, smooth textures, high quality, "
            "detailed, photorealistic, peaceful scenery"
        ),
        "negative_prompt": (
            "blurry, noisy, grainy, artifacts, jpeg artifacts, "
            "overexposed, underexposed, low quality, distorted"
        ),
        "description": "Natural landscapes with smooth gradients and textures"
    },
    "abstract": {
        "prompt": (
            "abstract geometric art, smooth gradients, harmonious colors, "
            "clean composition, minimalist, flowing shapes, balanced design, "
            "modern art, high quality"
        ),
        "negative_prompt": (
            "noisy, grainy, chaotic, cluttered, artifacts, rough texture, "
            "low quality, pixelated"
        ),
        "description": "Geometric patterns with uniform color distribution"
    },
    "architecture": {
        "prompt": (
            "modern architecture, clean lines, minimalist interior, "
            "soft natural lighting, smooth walls, professional photography, "
            "high quality, contemporary design, spacious"
        ),
        "negative_prompt": (
            "cluttered, noisy, grainy, artifacts, low quality, "
            "messy, dark, poor lighting"
        ),
        "description": "Buildings and interiors with clean lines"
    },
    "art": {
        "prompt": (
            "oil painting, artistic masterpiece, rich textures, "
            "classical art style, museum quality, renaissance style, "
            "detailed brushwork, professional artwork"
        ),
        "negative_prompt": (
            "pixelated, noisy, low resolution, artifacts, "
            "amateur, sketch, unfinished"
        ),
        "description": "Artistic paintings that mask embedding changes"
    },
    "portrait": {
        "prompt": (
            "portrait photography, professional studio lighting, "
            "soft background, natural expression, high quality, "
            "professional headshot, bokeh effect, elegant"
        ),
        "negative_prompt": (
            "blurry, noisy, artifacts, low quality, distorted, "
            "bad lighting, amateur, overexposed"
        ),
        "description": "Professional portraits with complex regions"
    }
}


def get_preset(preset_name):
    """
    Get a preset configuration by name.
    
    Args:
        preset_name: Name of the preset (nature, abstract, architecture, art, portrait)
        
    Returns:
        Dict with prompt, negative_prompt, and description
        
    Raises:
        ValueError: If preset name is not found
    """
    if preset_name not in PRESETS:
        raise ValueError(
            f"Unknown preset: {preset_name}. "
            f"Available presets: {', '.join(PRESETS.keys())}"
        )
    return PRESETS[preset_name]


def get_all_presets():
    """
    Get all available presets.
    
    Returns:
        Dict of all presets
    """
    return PRESETS


def get_preset_names():
    """
    Get list of all preset names.
    
    Returns:
        List of preset names
    """
    return list(PRESETS.keys())

