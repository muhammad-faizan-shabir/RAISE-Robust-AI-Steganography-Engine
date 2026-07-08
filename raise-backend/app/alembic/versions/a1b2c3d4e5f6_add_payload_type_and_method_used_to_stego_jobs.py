"""add payload_type and method_used to stego_jobs

Revision ID: a1b2c3d4e5f6
Revises: c694d0939431
Create Date: 2026-05-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'c694d0939431'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # payload_type: what kind of data was hidden — "text", "image", or "pdf"
    op.add_column(
        'stego_jobs',
        sa.Column('payload_type', sa.String(length=20), nullable=True)
    )
    # method_used: which steganography method was applied — "steganogan" or "lsb"
    op.add_column(
        'stego_jobs',
        sa.Column('method_used', sa.String(length=20), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('stego_jobs', 'method_used')
    op.drop_column('stego_jobs', 'payload_type')
