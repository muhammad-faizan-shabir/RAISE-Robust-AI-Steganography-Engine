"""add_generate_operation_type

Revision ID: c694d0939431
Revises: b70aee728a0a
Create Date: 2025-12-12 15:21:43.587981

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c694d0939431'
down_revision = 'b70aee728a0a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add 'GENERATE' value to the operationtype enum (uppercase to match existing values)
    op.execute("ALTER TYPE operationtype ADD VALUE IF NOT EXISTS 'GENERATE'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values directly
    # You would need to recreate the enum type to remove a value
    pass

