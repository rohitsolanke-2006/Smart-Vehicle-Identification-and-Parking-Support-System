"""ANPR (Automatic Number Plate Recognition) router.

Accepts an image upload, extracts the licence plate text using EasyOCR
and returns the best candidate string.  Falls back to a deterministic mock
when easyocr is not installed (demo / CI environments).
"""

import re
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.auth_service import require_role

router = APIRouter(prefix="/vision", tags=["Vision / ANPR"])


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------

class ScanResult(BaseModel):
    plate: Optional[str] = None
    confidence: Optional[float] = None
    mock: bool = False
    message: str


# ---------------------------------------------------------------------------
# Plate cleaning helper
# ---------------------------------------------------------------------------

PLATE_RE = re.compile(r"[A-Z0-9]{4,12}")


def _best_plate(texts: list) -> Optional[str]:
    """Pick the most plate-like string from OCR results."""
    candidates = []
    for text, conf in texts:
        cleaned = re.sub(r"[^A-Z0-9]", "", text.upper())
        if PLATE_RE.fullmatch(cleaned):
            candidates.append((cleaned, conf))
    if not candidates:
        return None
    # Return highest-confidence candidate
    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[0][0]


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post("/scan", response_model=ScanResult)
async def scan_plate(
    file: UploadFile = File(...),
    _=Depends(require_role("guard")),
):
    """Upload a vehicle image → return detected licence plate text."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (jpg/png)")

    image_bytes = await file.read()

    # ── Try real EasyOCR ──────────────────────────────────────────────────
    try:
        import easyocr  # optional; heavy install
        import numpy as np
        from PIL import Image
        import io

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(img)

        reader = easyocr.Reader(["en"], gpu=False, verbose=False)
        raw = reader.readtext(img_array)  # returns [(bbox, text, conf), ...]

        texts = [(item[1], item[2]) for item in raw]
        plate = _best_plate(texts)

        if plate:
            conf = next(c for t, c in texts if re.sub(r"[^A-Z0-9]", "", t.upper()) == plate)
            return ScanResult(
                plate=plate,
                confidence=round(float(conf), 3),
                mock=False,
                message=f"Plate detected: {plate}",
            )

        return ScanResult(
            plate=None,
            confidence=None,
            mock=False,
            message="No licence plate detected in image. Please retake closer.",
        )

    except ImportError:
        # ── EasyOCR not installed: return mock result for demo ────────────
        import hashlib

        digest = hashlib.md5(image_bytes[:512]).hexdigest()[:4].upper()
        mock_plate = f"MH12{digest}"
        return ScanResult(
            plate=mock_plate,
            confidence=0.91,
            mock=True,
            message=f"[DEMO MODE] Simulated plate: {mock_plate}. Install easyocr for live scanning.",
        )
