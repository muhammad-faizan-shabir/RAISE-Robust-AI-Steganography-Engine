"""Add supabase auth fields and remove sessions table and role column

Revision ID: 2f8a3b9c1d4e
Revises: 14d6a721c226
Create Date: 2025-11-30 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2f8a3b9c1d4e'
down_revision = '14d6a721c226'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add supabase_id column
    op.add_column('users', sa.Column('supabase_id', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_users_supabase_id'), 'users', ['supabase_id'], unique=True)
    
    # Add auth_provider column with default value
    op.add_column('users', sa.Column('auth_provider', sa.String(length=50), nullable=True))
    
    # Drop password column as we use Supabase for auth
    op.drop_column('users', 'password')
    
    # Set default auth_provider to 'email' for existing users
    op.execute("UPDATE users SET auth_provider = 'email' WHERE auth_provider IS NULL")
    
    # Remove role column (not needed for this application)
    op.drop_column('users', 'role')
    
    # Drop sessions table (not needed for JWT-based authentication)
    op.drop_index(op.f('ix_sessions_token'), table_name='sessions')
    op.drop_index(op.f('ix_sessions_id'), table_name='sessions')
    op.drop_table('sessions')


def downgrade() -> None:
    # Recreate sessions table
    op.create_table('sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=255), nullable=False),
        sa.Column('expiry', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sessions_id'), 'sessions', ['id'], unique=False)
    op.create_index(op.f('ix_sessions_token'), 'sessions', ['token'], unique=True)
    
    # Recreate role column with default value
    op.add_column('users', sa.Column('role', sa.String(length=50), nullable=False, server_default='user'))
    
    # Remove supabase_id index and column
    op.drop_index(op.f('ix_users_supabase_id'), table_name='users')
    op.drop_column('users', 'supabase_id')
    
    # Remove auth_provider column
    op.drop_column('users', 'auth_provider')
    
    # Recreate password column
    op.add_column('users', sa.Column('password', sa.String(length=255), nullable=False, server_default=''))

