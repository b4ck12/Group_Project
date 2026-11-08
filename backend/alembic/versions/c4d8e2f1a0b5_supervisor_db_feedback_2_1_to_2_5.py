"""supervisor_db_feedback_2_1_to_2_5

Revision ID: c4d8e2f1a0b5
Revises: b3a7c1e8d9f4
Create Date: 2026-11-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c4d8e2f1a0b5'
down_revision: Union[str, Sequence[str], None] = 'b3a7c1e8d9f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply supervisor feedback items 2.1 through 2.5: drop expenses, add plan versioning and stop lifecycle."""
    # 1. Item 2.3: Drop deprecated settlement and expense tables from core schema
    op.execute("DROP TABLE IF EXISTS core.settlements CASCADE")
    op.execute("DROP TABLE IF EXISTS core.expense_splits CASCADE")
    op.execute("DROP TABLE IF EXISTS core.expenses CASCADE")

    # Drop deprecated enums
    op.execute("DROP TYPE IF EXISTS core.expensetype CASCADE")
    op.execute("DROP TYPE IF EXISTS core.splittype CASCADE")

    # 2. Item 2.5: Expand planstatus enum values in core schema
    op.execute("""
        DO $$
        BEGIN
            ALTER TYPE core.planstatus ADD VALUE IF NOT EXISTS 'INITIAL';
            ALTER TYPE core.planstatus ADD VALUE IF NOT EXISTS 'FINALIZED';
            ALTER TYPE core.planstatus ADD VALUE IF NOT EXISTS 'ONGOING';
            ALTER TYPE core.planstatus ADD VALUE IF NOT EXISTS 'COMPLETED';
        EXCEPTION
            WHEN undefined_object THEN NULL;
        END $$;
    """)

    # 3. Create new enums: transportmode and stopstatus in core schema
    transportmode_enum = postgresql.ENUM(
        'WALKING',
        'MOTORBIKE',
        'TAXI_GRAB',
        'CAR',
        'BUS',
        'TRAIN',
        'FLIGHT',
        'BOAT',
        'OTHER',
        name='transportmode',
        schema='core',
    )
    transportmode_enum.create(op.get_bind(), checkfirst=True)

    stopstatus_enum = postgresql.ENUM(
        'INITIAL_PROPOSED',
        'VOTING_OPEN',
        'SELECTED_AFTER_VOTE',
        'REJECTED_IN_VOTE',
        'FINALIZED_LOCKED',
        'ONGOING_ACTIVE',
        'ADAPTED_ON_TRIP',
        'SKIPPED_ON_TRIP',
        'COMPLETED',
        name='stopstatus',
        schema='core',
    )
    stopstatus_enum.create(op.get_bind(), checkfirst=True)

    # 4. Item 2.2: Add 1-to-N plan versioning and snapshot columns on core.plans
    op.add_column(
        'plans',
        sa.Column('version_number', sa.Integer(), nullable=False, server_default='1'),
        schema='core',
    )
    op.add_column(
        'plans',
        sa.Column('parent_plan_id', sa.String(), nullable=True),
        schema='core',
    )
    op.create_foreign_key(
        'fk_plans_parent_plan_id_plans',
        'plans',
        'plans',
        ['parent_plan_id'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='SET NULL',
    )
    op.add_column(
        'plans',
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        schema='core',
    )
    op.add_column(
        'plans',
        sa.Column('change_summary', sa.String(length=500), nullable=True),
        schema='core',
    )
    op.add_column(
        'plans',
        sa.Column('locked_at', sa.DateTime(timezone=True), nullable=True),
        schema='core',
    )
    op.create_unique_constraint(
        'uq_event_plan_version',
        'plans',
        ['event_id', 'version_number'],
        schema='core',
    )

    # 5. Item 2.4 & 2.5: Add transit attributes & 4-stage lifecycle columns on core.plan_stops
    op.add_column(
        'plan_stops',
        sa.Column('stop_date', sa.Date(), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('address', sa.String(length=500), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column(
            'transport_mode',
            postgresql.ENUM(
                'WALKING',
                'MOTORBIKE',
                'TAXI_GRAB',
                'CAR',
                'BUS',
                'TRAIN',
                'FLIGHT',
                'BOAT',
                'OTHER',
                name='transportmode',
                schema='core',
                create_type=False,
            ),
            nullable=True,
        ),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('transit_duration_minutes', sa.Integer(), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('transit_distance_km', sa.Float(), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('transit_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column(
            'stop_status',
            postgresql.ENUM(
                'INITIAL_PROPOSED',
                'VOTING_OPEN',
                'SELECTED_AFTER_VOTE',
                'REJECTED_IN_VOTE',
                'FINALIZED_LOCKED',
                'ONGOING_ACTIVE',
                'ADAPTED_ON_TRIP',
                'SKIPPED_ON_TRIP',
                'COMPLETED',
                name='stopstatus',
                schema='core',
                create_type=False,
            ),
            nullable=False,
            server_default='INITIAL_PROPOSED',
        ),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('is_initial_stop', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('is_finalized_stop', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('replaced_by_stop_id', sa.String(), nullable=True),
        schema='core',
    )
    op.create_foreign_key(
        'fk_plan_stops_replaced_by_stop_id_plan_stops',
        'plan_stops',
        'plan_stops',
        ['replaced_by_stop_id'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='SET NULL',
    )
    op.add_column(
        'plan_stops',
        sa.Column('change_reason', sa.String(length=500), nullable=True),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('locked_at', sa.DateTime(timezone=True), nullable=True),
        schema='core',
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Revert plan_stops additions
    op.drop_constraint('fk_plan_stops_replaced_by_stop_id_plan_stops', 'plan_stops', schema='core', type_='foreignkey')
    op.drop_column('plan_stops', 'locked_at', schema='core')
    op.drop_column('plan_stops', 'change_reason', schema='core')
    op.drop_column('plan_stops', 'replaced_by_stop_id', schema='core')
    op.drop_column('plan_stops', 'is_finalized_stop', schema='core')
    op.drop_column('plan_stops', 'is_initial_stop', schema='core')
    op.drop_column('plan_stops', 'stop_status', schema='core')
    op.drop_column('plan_stops', 'transit_cost', schema='core')
    op.drop_column('plan_stops', 'transit_distance_km', schema='core')
    op.drop_column('plan_stops', 'transit_duration_minutes', schema='core')
    op.drop_column('plan_stops', 'transport_mode', schema='core')
    op.drop_column('plan_stops', 'address', schema='core')
    op.drop_column('plan_stops', 'end_time', schema='core')
    op.drop_column('plan_stops', 'stop_date', schema='core')

    # Revert plans additions
    op.drop_constraint('uq_event_plan_version', 'plans', schema='core', type_='unique')
    op.drop_column('plans', 'locked_at', schema='core')
    op.drop_column('plans', 'change_summary', schema='core')
    op.drop_column('plans', 'is_active', schema='core')
    op.drop_constraint('fk_plans_parent_plan_id_plans', 'plans', schema='core', type_='foreignkey')
    op.drop_column('plans', 'parent_plan_id', schema='core')
    op.drop_column('plans', 'version_number', schema='core')

    # Drop custom enums
    sa.Enum(name='stopstatus', schema='core').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='transportmode', schema='core').drop(op.get_bind(), checkfirst=True)
