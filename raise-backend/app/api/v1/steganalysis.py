"""
Steganalysis endpoint using StegExpose.
Detects LSB steganography in lossless images (PNG, BMP).

Setup:
    1. Install Java (required to run StegExpose):
           sudo apt-get install default-jre

    2. Download StegExpose.jar from GitHub releases:
           wget https://github.com/b3dk7/StegExpose/raw/master/StegExpose.jar \
                -O /opt/StegExpose.jar

    3. Set STEGEXPOSE_JAR_PATH in your .env:
           STEGEXPOSE_JAR_PATH=/opt/StegExpose.jar

How StegExpose works:
    - Analyzes lossless images (PNG / BMP) for LSB steganography
    - Uses 4 statistical detectors: Primary Sets, Chi Square, Sample Pairs, RS Analysis
    - Combines them into a single Fusion score (0.0 – 1.0)
    - Default detection threshold is 0.2  (images scoring above this are flagged)
    - ⚠️  NOT designed for JPEG — only accept PNG / BMP in this endpoint
"""

import os
import csv
import tempfile
import subprocess
from io import StringIO
from pathlib import Path
from typing import Optional, Tuple

from typing_extensions import Literal

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field

from dependencies.auth import get_current_user
from models.users import User
from core.config import settings

router = APIRouter()

# ── Config ───────────────────────────────────────────────────────────────────
# Path to StegExpose.jar — set via env var or fall back to project root
STEGEXPOSE_JAR = getattr(
    settings,
    "STEGEXPOSE_JAR_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "StegExpose.jar"),
)

# Default threshold used by StegExpose (0.2 is the recommended value from the paper)
DEFAULT_THRESHOLD = 0.2


# ── Response Schemas ─────────────────────────────────────────────────────────

class DetectorScores(BaseModel):
    primary_sets: Optional[float] = Field(
        None,
        description="Primary Sets detector score (0–1). May be None if detector could not run."
    )
    chi_square: Optional[float] = Field(
        None,
        description="Chi Square Attack score (0–1). May be None if detector could not run."
    )
    sample_pairs: Optional[float] = Field(
        None,
        description="Sample Pairs detector score (0–1). May be None if detector could not run."
    )
    rs_analysis: Optional[float] = Field(
        None,
        description="RS Analysis detector score (0–1). May be None if detector could not run."
    )


class StegExposeResponse(BaseModel):
    filename: str = Field(..., description="Uploaded image filename")
    fusion_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description=(
            "Fusion score (0–1) — the primary probability metric. "
            "Combines all 4 detectors intelligently. "
            "Scores above the threshold indicate likely hidden data."
        ),
    )
    threshold_used: float = Field(
        ...,
        description="Detection threshold applied. Images above this are flagged."
    )
    above_threshold: bool = Field(
        ...,
        description="True if fusion score exceeds the threshold (hidden data likely present)"
    )
    verdict: str = Field(..., description="Clean / Suspicious / Likely Stego")
    estimated_hidden_bytes: Optional[int] = Field(
        None,
        description=(
            "Estimated size of hidden message in bytes. "
            "Only meaningful when above_threshold is True."
        ),
    )
    detector_scores: DetectorScores = Field(
        ...,
        description="Individual scores from each of the 4 statistical detectors"
    )
    speed_mode: str = Field(..., description="Speed mode used: 'standard' or 'fast'")
    note: Optional[str] = Field(None, description="Warnings or additional context")


# ── Helpers ──────────────────────────────────────────────────────────────────

def _verdict(fusion: float, threshold: float) -> str:
    """Map fusion score to a human-readable verdict."""
    if fusion < threshold:
        return "Clean"
    elif fusion < threshold + 0.2:
        return "Suspicious"
    else:
        return "Likely Stego"


def _safe_float(value: str) -> Optional[float]:
    """Parse a CSV cell to float, returning None for empty / NaN values."""
    if not value or value.strip().lower() in ("", "nan", "null", "none"):
        return None
    try:
        return round(float(value.strip()), 6)
    except ValueError:
        return None


def _safe_int(value: str) -> Optional[int]:
    """Parse a CSV cell to int, returning None for empty / invalid values."""
    if not value or value.strip().lower() in ("", "nan", "null", "none"):
        return None
    try:
        return int(float(value.strip()))
    except ValueError:
        return None


def _parse_csv_output(csv_text: str, filename: str) -> dict:
    """
    Parse StegExpose's CSV report into a structured dict.

    CSV format (standard mode):
        File name,
        Above stego threshold?,
        Secret message size in bytes (ignore for clean files),
        Primary Sets,
        Chi Square,
        Sample Pairs,
        RS analysis,
        Fusion (mean)

    CSV format (fast mode):
        ... same but last column is 'Fusion (mean & fast)'
    """
    reader = csv.DictReader(StringIO(csv_text.strip()))

    target_filename = os.path.basename(filename)

    for row in reader:
        # StegExpose uses the full path as the file name key
        row_filename = os.path.basename(list(row.values())[0])
        if row_filename == target_filename or target_filename in list(row.values())[0]:
            # Normalise column names to lowercase with underscores
            normalised = {k.strip().lower(): v.strip() for k, v in row.items()}

            above = normalised.get("above stego threshold?", "false").lower() == "true"

            # Fusion column name differs between speed modes
            fusion_val = (
                normalised.get("fusion (mean)")
                or normalised.get("fusion (mean & fast)")
                or normalised.get("fusion")
                or "0"
            )

            return {
                "above_threshold": above,
                "hidden_bytes": _safe_int(
                    normalised.get("secret message size in bytes (ignore for clean files)", "")
                ),
                "primary_sets": _safe_float(normalised.get("primary sets", "")),
                "chi_square":   _safe_float(normalised.get("chi square", "")),
                "sample_pairs": _safe_float(normalised.get("sample pairs", "")),
                "rs_analysis":  _safe_float(normalised.get("rs analysis", "")),
                "fusion":       _safe_float(fusion_val) or 0.0,
            }

    # If we reach here, StegExpose produced no row for our image
    return {}


def _run_stegexpose(
    image_path: str,
    speed: Literal["standard", "fast"],
    threshold: float,
) -> Tuple[str, dict]:
    """
    Run StegExpose against a single image by placing it in a temp directory.

    StegExpose only accepts a DIRECTORY argument, so we:
    1. Create a temp dir
    2. Symlink/copy the image into it
    3. Write CSV output to a temp file
    4. Read and parse the CSV
    5. Clean everything up

    Returns (raw_csv_output, parsed_dict)
    """
    if not os.path.isfile(STEGEXPOSE_JAR):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"StegExpose.jar not found at '{STEGEXPOSE_JAR}'. "
                "Download it from https://github.com/b3dk7/StegExpose and set "
                "STEGEXPOSE_JAR_PATH in your .env file."
            ),
        )

    # Create a temp working directory containing only our image
    work_dir = tempfile.mkdtemp(prefix="stegexpose_")
    csv_path = os.path.join(work_dir, "report.csv")

    # Link the image into the working directory
    image_link = os.path.join(work_dir, os.path.basename(image_path))
    try:
        os.symlink(image_path, image_link)
    except OSError:
        # Symlinks may not be available on all systems — fall back to copy
        import shutil
        shutil.copy2(image_path, image_link)

    try:
        # Build the command:
        # java -jar StegExpose.jar <dir> <speed> <threshold> <csv_file>
        cmd = [
            "java", "-jar", STEGEXPOSE_JAR,
            work_dir,
            speed,
            str(threshold),
            csv_path,
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60,  # 1-minute limit per image
        )

        # StegExpose exits 0 regardless of findings; check for JVM errors
        if result.returncode != 0 and "Exception" in (result.stderr or ""):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"StegExpose JVM error: {result.stderr[:500]}",
            )

        # Read the CSV it wrote
        if not os.path.isfile(csv_path):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "StegExpose did not produce a CSV report. "
                    f"stdout: {result.stdout[:300]} | stderr: {result.stderr[:300]}"
                ),
            )

        with open(csv_path, "r") as f:
            raw_csv = f.read()

        parsed = _parse_csv_output(raw_csv, os.path.basename(image_path))
        return raw_csv, parsed

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="StegExpose timed out (>60s). Try a smaller image.",
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "'java' not found in PATH. Install Java first:\n"
                "  sudo apt-get install default-jre"
            ),
        )
    finally:
        # Always clean up temp dir
        import shutil
        shutil.rmtree(work_dir, ignore_errors=True)


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post(
    "/analyze",
    response_model=StegExposeResponse,
    summary="Analyze image for steganography (StegExpose)",
    description="""
Upload an image to detect steganography
using StegExpose — a Java-based statistical steganalysis tool.

---

**Detection method:**  
StegExpose runs 4 statistical attacks on the image and fuses their scores:

| Detector | Based on |
|---|---|
| **Primary Sets** | Dumitrescu (2002) |
| **Chi Square** | Westfeld (2000) |
| **Sample Pairs** | Dumitrescu (2003) |
| **RS Analysis** | Fridrich (2001) |

The **Fusion score** (0–1) is the key metric. Images scoring above the threshold
are considered to likely contain hidden data.

---

**Speed modes:**
- `standard` — runs all 4 detectors (more accurate, ~1.2s per image)
- `fast` — skips expensive detectors early if image looks clean (~0.34s per image)

**Threshold:** default `0.2` (recommended by the StegExpose paper).
Lower = more sensitive (more false positives). Higher = stricter.
    """,
    tags=["Steganalysis"],
)
async def analyze_image_stegexpose(
    image: UploadFile = File(
        ...,
        description="Image to be analyzed."
    ),
    speed: Literal["standard", "fast"] = Form(
        default="standard",
        description=(
            "Detection speed mode. "
            "'standard' = all 4 detectors (accurate). "
            "'fast' = early termination (quicker)."
        ),
    ),
    threshold: float = Form(
        default=DEFAULT_THRESHOLD,
        ge=0.0,
        le=1.0,
        description=(
            "Detection threshold (0.0–1.0). Images with fusion score above this "
            "are flagged as containing hidden data. Default: 0.2"
        ),
    ),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze an image for steganography using StegExpose.
    Returns fusion score, per-detector breakdown, estimated hidden message size,
    and a plain-language verdict.
    """

    
    ext = Path(image.filename or "").suffix.lower()

    # Read
    content = await image.read()

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # ── Run StegExpose ─────────────────────────────────────────────
        raw_csv, parsed = _run_stegexpose(tmp_path, speed, threshold)

        # ── Handle empty parse result ──────────────────────────────────
        if not parsed:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "StegExpose ran but returned no results for this image. "
                    "This can happen with very small images (< 20×20 px) or "
                    "corrupted files."
                ),
            )

        fusion = parsed.get("fusion", 0.0)
        above  = parsed.get("above_threshold", fusion >= threshold)

        # ── Build response ─────────────────────────────────────────────
        note = None
        if ext == ".bmp":
            note = "BMP images are supported but less commonly tested. Results are reliable."

        verdict = _verdict(fusion, threshold)
        estimated_hidden_bytes = parsed.get("hidden_bytes")

        if verdict == 'Clean':
            estimated_hidden_bytes = 0

        return StegExposeResponse(
            filename=image.filename or "unknown",
            fusion_score=fusion,
            threshold_used=threshold,
            above_threshold=above,
            verdict=verdict,
            estimated_hidden_bytes=estimated_hidden_bytes,
            detector_scores=DetectorScores(
                primary_sets=parsed.get("primary_sets"),
                chi_square=parsed.get("chi_square"),
                sample_pairs=parsed.get("sample_pairs"),
                rs_analysis=parsed.get("rs_analysis"),
            ),
            speed_mode=speed,
            note=note,
        )

    finally:
        # ── Always clean up temp image ─────────────────────────────────
        if os.path.exists(tmp_path):
            os.remove(tmp_path)