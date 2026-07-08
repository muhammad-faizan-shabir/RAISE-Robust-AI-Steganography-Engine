"""update_notifications_table

Revision ID: c985ca16ee18
Revises: 2f8a3b9c1d4e
Create Date: 2025-12-08 10:37:24.766289

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c985ca16ee18'
down_revision = '2f8a3b9c1d4e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to notifications table
    op.add_column('notifications', sa.Column('title', sa.String(length=255), nullable=True))
    op.add_column('notifications', sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('notifications', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))
    
    # Update existing rows to have a default title
    op.execute("UPDATE notifications SET title = 'Notification' WHERE title IS NULL")
    
    # Make title non-nullable after setting defaults
    op.alter_column('notifications', 'title', nullable=False)


def downgrade() -> None:
    # Remove the added columns
    op.drop_column('notifications', 'created_at')
    op.drop_column('notifications', 'is_read')
    op.drop_column('notifications', 'title')

