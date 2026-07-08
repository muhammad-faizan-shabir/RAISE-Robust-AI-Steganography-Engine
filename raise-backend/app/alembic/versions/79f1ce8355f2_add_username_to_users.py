"""add_username_to_users

Revision ID: 79f1ce8355f2
Revises: c985ca16ee18
Create Date: 2025-12-08 10:49:34.209020

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '79f1ce8355f2'
down_revision = 'c985ca16ee18'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add username column to users table
    op.add_column('users', sa.Column('username', sa.String(length=100), nullable=True))
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    # Remove username column
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('users', 'username')

