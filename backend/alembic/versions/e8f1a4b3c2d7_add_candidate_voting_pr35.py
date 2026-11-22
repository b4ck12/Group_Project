"""add_candidate_voting_pr35

Revision ID: e8f1a4b3c2d7
Revises: d7e9f3a2b1c6
Create Date: 2026-11-23 03:42:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e8f1a4b3c2d7'
down_revision: Union[str, Sequence[str], None] = 'd7e9f3a2b1c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add candidate_options/selected_candidate_id on plan_stops and candidate_id/name on plan_votes."""
    op.add_column(
        'plan_stops',
        sa.Column('candidate_options', sa.JSON(), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('selected_candidate_id', sa.String(length=100), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_votes',
        sa.Column('candidate_id', sa.String(length=100), nullable=False, server_default=''),
        schema='core',
    )
    op.add_column(
        'plan_votes',
        sa.Column('candidate_name', sa.String(length=255), nullable=True),
        schema='core',
    )
    op.alter_column(
        'plan_votes',
        'value',
        existing_type=postgresql.ENUM('UP', 'DOWN', 'NEUTRAL', name='votevalue', schema='core'),
        nullable=True,
        schema='core',
    )


def downgrade() -> None:
    """Revert candidate voting columns from plan_stops and plan_votes."""
    op.alter_column(
        'plan_votes',
        'value',
        existing_type=postgresql.ENUM('UP', 'DOWN', 'NEUTRAL', name='votevalue', schema='core'),
        nullable=False,
        schema='core',
    )
    op.drop_column('plan_votes', 'candidate_name', schema='core')
    op.drop_column('plan_votes', 'candidate_id', schema='core')
    op.drop_column('plan_stops', 'selected_candidate_id', schema='core')
    op.drop_column('plan_stops', 'candidate_options', schema='core')
