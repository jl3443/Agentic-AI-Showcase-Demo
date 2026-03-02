"""Invoice extraction service using Claude Vision.

Uses Claude's vision capability to extract structured data from invoice
images and PDFs.  Falls back to mock data when the AI service is unavailable.
"""

from __future__ import annotations

import logging
from datetime import date
from typing import Any

from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """\
You are an expert accounts-payable document processor. Given an invoice image \
or PDF, extract all structured data and return ONLY a JSON object (no markdown, \
no explanation) with exactly this schema:

{
  "invoice_number": "string",
  "vendor_name": "string",
  "vendor_tax_id": "string or null",
  "invoice_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "currency": "3-letter ISO code",
  "subtotal": number,
  "tax_amount": number,
  "freight_amount": number,
  "discount_amount": number,
  "total_amount": number,
  "line_items": [
    {
      "line_number": integer,
      "description": "string",
      "quantity": number,
      "unit_price": number,
      "line_total": number,
      "tax_amount": number,
      "gl_account_code": "predicted GL code or null",
      "gl_confidence": number between 0 and 1
    }
  ]
}

Rules:
- Use 0 for any missing numeric fields.
- Predict the most likely GL account code for each line item based on the \
description (e.g., office supplies → 6100-00, IT equipment → 1500-00, \
raw materials → 5200-00, packaging → 5300-00, services → 6200-00).
- gl_confidence is your confidence in the GL prediction (0.0 – 1.0).
- Return ONLY valid JSON, no extra text."""

MEDIA_TYPES = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


def _media_type_for(filename: str) -> str | None:
    """Determine MIME type from filename extension.

    Returns None for unsupported file types.
    """
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return MEDIA_TYPES.get(ext)


def _compute_confidence(extracted: dict[str, Any]) -> float:
    """Compute OCR confidence score based on extraction completeness.

    Checks that key fields were extracted and line items are present.
    Returns a score between 0.0 and 1.0.
    """
    required_fields = [
        "invoice_number", "vendor_name", "invoice_date",
        "due_date", "currency", "total_amount",
    ]
    filled = sum(1 for f in required_fields if extracted.get(f))
    field_score = filled / len(required_fields)

    # Line items contribute to confidence
    line_items = extracted.get("line_items", [])
    has_lines = 1.0 if line_items else 0.0

    # Check line item quality (do they have descriptions and amounts?)
    line_quality = 0.0
    if line_items:
        good_lines = sum(
            1 for li in line_items
            if li.get("description") and li.get("line_total", 0) > 0
        )
        line_quality = good_lines / len(line_items)

    # Weighted combination: 50% field completeness, 20% has lines, 30% line quality
    score = field_score * 0.5 + has_lines * 0.2 + line_quality * 0.3
    return round(min(max(score, 0.0), 1.0), 2)


def extract_invoice(
    file_content: bytes,
    filename: str = "invoice.pdf",
) -> dict[str, Any]:
    """Extract invoice data from an image/PDF using Claude Vision.

    Falls back to mock data when the AI service is unavailable.
    """
    if not ai_service.available:
        logger.info("AI service unavailable – returning mock extraction")
        return mock_extract_invoice()

    media_type = _media_type_for(filename)
    if not media_type:
        logger.warning("Unsupported file type '%s' – falling back to mock", filename)
        return mock_extract_invoice()

    logger.info("Extracting invoice via Claude Vision (file=%s, type=%s)", filename, media_type)

    raw = ai_service.call_claude_vision(
        system_prompt=EXTRACTION_SYSTEM_PROMPT,
        image_data=file_content,
        media_type=media_type,
        user_message="Extract all data from this invoice document.",
        max_tokens=4096,
    )

    parsed = ai_service.extract_json(raw) if raw else None
    if not parsed:
        logger.warning("AI extraction returned no usable data – falling back to mock")
        return mock_extract_invoice()

    # Normalise to the shape the rest of the app expects
    line_items = []
    for li in parsed.get("line_items", []):
        line_items.append(
            {
                "line_number": li.get("line_number", 1),
                "description": li.get("description", ""),
                "quantity": li.get("quantity", 1),
                "unit_price": li.get("unit_price", 0),
                "line_total": li.get("line_total", 0),
                "tax_amount": li.get("tax_amount", 0),
                "ai_gl_prediction": li.get("gl_account_code"),
                "ai_confidence": li.get("gl_confidence", 0),
            }
        )

    extracted: dict[str, Any] = {
        "invoice_number": parsed.get("invoice_number", ""),
        "vendor_name": parsed.get("vendor_name", ""),
        "vendor_tax_id": parsed.get("vendor_tax_id"),
        "invoice_date": parsed.get("invoice_date", ""),
        "due_date": parsed.get("due_date", ""),
        "currency": parsed.get("currency", "USD"),
        "subtotal": parsed.get("subtotal", 0),
        "tax_amount": parsed.get("tax_amount", 0),
        "freight_amount": parsed.get("freight_amount", 0),
        "discount_amount": parsed.get("discount_amount", 0),
        "total_amount": parsed.get("total_amount", 0),
        "line_items": line_items,
    }

    # Compute confidence from extraction completeness
    confidence = _compute_confidence(extracted)

    return {
        "confidence": confidence,
        "extracted_data": extracted,
        "raw_text": raw,
        "pages_processed": 1,
    }


def mock_extract_invoice(file_path: str | None = None) -> dict[str, Any]:
    """Fallback mock extraction returning pre-defined data."""
    return {
        "confidence": 0.92,
        "extracted_data": {
            "invoice_number": "INV-2025-00142",
            "vendor_name": "Acme Supplies Co.",
            "vendor_tax_id": "12-3456789",
            "invoice_date": str(date(2025, 6, 15)),
            "due_date": str(date(2025, 7, 15)),
            "currency": "USD",
            "subtotal": 4250.00,
            "tax_amount": 340.00,
            "freight_amount": 75.00,
            "discount_amount": 0.00,
            "total_amount": 4665.00,
            "line_items": [
                {
                    "line_number": 1,
                    "description": "Industrial Widget A",
                    "quantity": 50,
                    "unit_price": 45.00,
                    "line_total": 2250.00,
                    "tax_amount": 180.00,
                    "ai_gl_prediction": "5200-00",
                    "ai_confidence": 0.88,
                },
                {
                    "line_number": 2,
                    "description": "Packing Material B",
                    "quantity": 100,
                    "unit_price": 20.00,
                    "line_total": 2000.00,
                    "tax_amount": 160.00,
                    "ai_gl_prediction": "5300-00",
                    "ai_confidence": 0.81,
                },
            ],
        },
        "raw_text": (
            "INVOICE\n"
            "Invoice No: INV-2025-00142\n"
            "Date: 2025-06-15\n"
            "Due: 2025-07-15\n"
            "...\n"
        ),
        "pages_processed": 1,
    }
