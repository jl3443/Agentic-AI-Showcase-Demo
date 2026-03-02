"""AI chat assistant service for AP operations."""

from __future__ import annotations

import logging
import uuid
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.approval import ApprovalStatus, ApprovalTask
from app.models.exception import Exception_, ExceptionStatus
from app.models.invoice import Invoice, InvoiceStatus
from app.models.vendor import Vendor
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

CHAT_SYSTEM_PROMPT = """\
You are an AI assistant specialised in Accounts Payable operations. You help \
AP clerks, analysts, and managers with their daily work.

You have access to the following live system statistics (provided in each \
message). Use them to answer questions about the current state of operations.

Your capabilities:
- Answer questions about AP workflows: invoice processing, matching, \
exceptions, approvals, vendor management
- Explain exception types and suggest resolution approaches
- Provide guidance on approval decisions
- Help interpret matching results and discrepancy details
- Offer best-practice advice for AP operations

Keep answers concise and actionable. Use bullet points for lists. \
When referencing amounts, always include the currency."""

# Maximum messages stored per conversation
MAX_HISTORY = 20

# Maximum number of conversations to keep in memory (per-process)
MAX_CONVERSATIONS = 100


def _get_system_stats(db: Session) -> str:
    """Query live stats to embed in the system prompt."""
    total_invoices = db.query(Invoice).count()
    pending_approval = (
        db.query(Invoice)
        .filter(Invoice.status == InvoiceStatus.pending_approval)
        .count()
    )
    open_exceptions = (
        db.query(Exception_)
        .filter(Exception_.status == ExceptionStatus.open)
        .count()
    )
    pending_tasks = (
        db.query(ApprovalTask)
        .filter(ApprovalTask.status == ApprovalStatus.pending)
        .count()
    )
    active_vendors = db.query(Vendor).filter(Vendor.status == "active").count()

    total_pending_amount = (
        db.query(func.coalesce(func.sum(Invoice.total_amount), 0))
        .filter(Invoice.status == InvoiceStatus.pending_approval)
        .scalar()
    )

    # Status breakdown
    status_counts = (
        db.query(Invoice.status, func.count(Invoice.id))
        .group_by(Invoice.status)
        .all()
    )
    status_breakdown = ", ".join(
        f"{s.value}: {c}" for s, c in status_counts
    )

    # Exception breakdown
    exc_counts = (
        db.query(Exception_.exception_type, func.count(Exception_.id))
        .filter(Exception_.status == ExceptionStatus.open)
        .group_by(Exception_.exception_type)
        .all()
    )
    exc_breakdown = ", ".join(
        f"{t.value}: {c}" for t, c in exc_counts
    ) or "none"

    return (
        f"=== LIVE SYSTEM STATS ===\n"
        f"Total invoices: {total_invoices}\n"
        f"Pending approval: {pending_approval}\n"
        f"Pending approval amount: USD {total_pending_amount:,.2f}\n"
        f"Open exceptions: {open_exceptions}\n"
        f"Pending approval tasks: {pending_tasks}\n"
        f"Active vendors: {active_vendors}\n"
        f"Invoice status breakdown: {status_breakdown}\n"
        f"Open exception types: {exc_breakdown}\n"
        f"========================="
    )


# In-memory conversation store keyed by (user_id, conversation_id).
# Capped at MAX_CONVERSATIONS to prevent unbounded memory growth.
_conversations: dict[str, list[dict[str, str]]] = {}


def _conv_key(user_id: str, conversation_id: str) -> str:
    """Build a composite key that isolates conversations per user."""
    return f"{user_id}:{conversation_id}"


def chat(
    db: Session,
    message: str,
    conversation_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> dict[str, str]:
    """Process a chat message and return the AI response.

    Args:
        user_id: If provided, scopes the conversation to this user so that
            other users cannot access or inject messages into it.
    """
    if not ai_service.available:
        return {
            "response": (
                "AI assistant is not available. Please configure the "
                "LLM_API_KEY in your environment settings to enable "
                "the AI chat assistant."
            ),
            "conversation_id": conversation_id or str(uuid.uuid4()),
        }

    # Get or create conversation
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
    key = _conv_key(user_id or "anonymous", conversation_id)

    if key not in _conversations:
        # Evict oldest conversation if at capacity
        if len(_conversations) >= MAX_CONVERSATIONS:
            oldest_key = next(iter(_conversations))
            del _conversations[oldest_key]
            logger.info("Evicted oldest conversation to stay within limit")
        _conversations[key] = []

    history = _conversations[key]

    # Build system prompt with live stats
    stats = _get_system_stats(db)
    system = f"{CHAT_SYSTEM_PROMPT}\n\n{stats}"

    # Add user message to history
    history.append({"role": "user", "content": message})

    # Cap stored history to MAX_HISTORY to prevent unbounded growth
    if len(history) > MAX_HISTORY:
        _conversations[key] = history[-MAX_HISTORY:]
        history = _conversations[key]

    # Call Claude with conversation history
    raw = ai_service.call_claude_conversation(
        system_prompt=system,
        messages=history,
        max_tokens=1024,
    )

    response_text = raw or "I'm sorry, I wasn't able to process that request. Please try again."

    # Add assistant response to history
    history.append({"role": "assistant", "content": response_text})

    return {
        "response": response_text,
        "conversation_id": conversation_id,
    }
