"""align_pr28_pr30_supervisor_fields

Revision ID: d7e9f3a2b1c6
Revises: c4d8e2f1a0b5
Create Date: 2026-11-22 03:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd7e9f3a2b1c6'
down_revision: Union[str, Sequence[str], None] = 'c4d8e2f1a0b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add dietary preferences, event total_budget, recommended_dishes, and chat message_type/metadata."""
    chatmessagetype_enum = postgresql.ENUM(
        'CHAT',
        'AGENT_QA',
        'AGENT_TRIGGER',
        'SYSTEM',
        name='chatmessagetype',
        schema='core',
    )
    chatmessagetype_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        'users',
        sa.Column('dietary_preferences', sa.JSON(), nullable=True),
        schema='core',
    )
    op.add_column(
        'events',
        sa.Column('total_budget', sa.Numeric(precision=12, scale=2), nullable=True),
        schema='core',
    )
    op.add_column(
        'event_members',
        sa.Column('dietary_notes', sa.Text(), nullable=True),
        schema='core',
    )
    op.alter_column(
        'plans',
        'total_budget',
        existing_type=sa.Numeric(precision=10, scale=2),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('recommended_dishes', sa.JSON(), nullable=True),
        schema='core',
    )
    op.add_column(
        'chat_messages',
        sa.Column(
            'message_type',
            postgresql.ENUM(
                'CHAT',
                'AGENT_QA',
                'AGENT_TRIGGER',
                'SYSTEM',
                name='chatmessagetype',
                schema='core',
                create_type=False,
            ),
            nullable=False,
            server_default='CHAT',
        ),
        schema='core',
    )
    op.add_column(
        'chat_messages',
        sa.Column('metadata', sa.JSON(), nullable=True),
        schema='core',
    )


def downgrade() -> None:
    """Revert PR28-PR30 supervisor fields from core schema."""
    op.drop_column('chat_messages', 'metadata', schema='core')
    op.drop_column('chat_messages', 'message_type', schema='core')
    op.drop_column('plan_stops', 'recommended_dishes', schema='core')
    op.alter_column(
        'plans',
        'total_budget',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Numeric(precision=10, scale=2),
        existing_nullable=True,
        schema='core',
    )
    op.drop_column('event_members', 'dietary_notes', schema='core')
    op.drop_column('events', 'total_budget', schema='core')
    op.drop_column('users', 'dietary_preferences', schema='core')

    sa.Enum(name='chatmessagetype', schema='core').drop(op.get_bind(), checkfirst=True)
