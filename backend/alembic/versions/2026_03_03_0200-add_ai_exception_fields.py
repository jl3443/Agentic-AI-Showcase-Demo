"""Add AI fields to exceptions table.

Revision ID: a1b2c3d4e5f6
Revises: bbf52409ee2e
Create Date: 2026-03-03 02:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "a1b2c3d4e5f6"
down_revision = "bbf52409ee2e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "exceptions",
        sa.Column("ai_suggested_resolution", sa.Text(), nullable=True),
    )
    op.add_column(
        "exceptions",
        sa.Column("ai_severity_reasoning", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("exceptions", "ai_severity_reasoning")
    op.drop_column("exceptions", "ai_suggested_resolution")
