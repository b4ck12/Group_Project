"""align_models_with_design_docs

Revision ID: b3a7c1e8d9f4
Revises: e1ed950842d0
Create Date: 2026-10-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b3a7c1e8d9f4'
down_revision: Union[str, Sequence[str], None] = 'e1ed950842d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to align models with design documents and core schema isolation."""
    # 1. Ensure core schema exists
    op.execute("CREATE SCHEMA IF NOT EXISTS core")

    # 2. Migrate existing tables from public to core schema if they are currently in public
    tables_to_migrate = [
        'users',
        'events',
        'event_members',
        'invitations',
        'plans',
        'plan_stops',
        'plan_votes',
        'expenses',
        'expense_splits',
        'settlements',
        'agent_logs',
    ]
    for table in tables_to_migrate:
        op.execute(f"ALTER TABLE IF EXISTS public.{table} SET SCHEMA core")

    # 3. Create or update enum types in core schema
    # Update eventrole to include 'HOST'
    op.execute("""
        DO $$
        BEGIN
            ALTER TYPE eventrole ADD VALUE IF NOT EXISTS 'HOST';
        EXCEPTION
            WHEN undefined_object THEN NULL;
        END $$;
    """)

    # Create new enum types in core schema
    eventscope_enum = postgresql.ENUM('DAY_HANGOUT', 'VACATION', name='eventscope', schema='core')
    eventscope_enum.create(op.get_bind(), checkfirst=True)

    budgettier_enum = postgresql.ENUM('BUDGET', 'MODERATE', 'LUXURY', name='budgettier', schema='core')
    budgettier_enum.create(op.get_bind(), checkfirst=True)

    planstatus_enum = postgresql.ENUM('DRAFT', 'VOTING', 'CONFIRMED', 'ARCHIVED', name='planstatus', schema='core')
    planstatus_enum.create(op.get_bind(), checkfirst=True)

    timeslot_enum = postgresql.ENUM('MORNING', 'AFTERNOON', 'EVENING', name='timeslot', schema='core')
    timeslot_enum.create(op.get_bind(), checkfirst=True)

    chatrole_enum = postgresql.ENUM('USER', 'AI', 'SYSTEM', name='chatrole', schema='core')
    chatrole_enum.create(op.get_bind(), checkfirst=True)

    authprovider_enum = postgresql.ENUM('LOCAL', 'GOOGLE', 'FACEBOOK', name='authprovider', schema='core')
    authprovider_enum.create(op.get_bind(), checkfirst=True)

    # 4. Updates for core.events
    op.add_column(
        'events',
        sa.Column('scope', sa.Enum('DAY_HANGOUT', 'VACATION', name='eventscope', schema='core'), nullable=False, server_default='VACATION'),
        schema='core',
    )
    op.add_column(
        'events',
        sa.Column('destination', sa.String(length=255), nullable=True),
        schema='core',
    )
    op.add_column(
        'events',
        sa.Column('budget_tier', sa.Enum('BUDGET', 'MODERATE', 'LUXURY', name='budgettier', schema='core'), nullable=True),
        schema='core',
    )
    op.add_column(
        'events',
        sa.Column('macro_locked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        schema='core',
    )
    op.add_column(
        'events',
        sa.Column('final_locked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        schema='core',
    )
    op.add_column(
        'events',
        sa.Column('created_by', sa.String(), nullable=True),
        schema='core',
    )
    op.create_foreign_key(
        'fk_events_created_by_users',
        'events',
        'users',
        ['created_by'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='SET NULL',
    )
    op.add_column(
        'events',
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        schema='core',
    )

    # 5. Updates for core.plans
    op.add_column(
        'plans',
        sa.Column('status', sa.Enum('DRAFT', 'VOTING', 'CONFIRMED', 'ARCHIVED', name='planstatus', schema='core'), nullable=False, server_default='DRAFT'),
        schema='core',
    )
    op.add_column(
        'plans',
        sa.Column('macro_roadmap', sa.JSON(), nullable=True),
        schema='core',
    )

    # 6. Updates for core.plan_stops
    op.add_column(
        'plan_stops',
        sa.Column('day_number', sa.Integer(), nullable=False, server_default='1'),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('time_slot', sa.Enum('MORNING', 'AFTERNOON', 'EVENING', name='timeslot', schema='core'), nullable=True),
        schema='core',
    )
    # Rename 'order' column to 'order_index'
    op.alter_column(
        'plan_stops',
        'order',
        new_column_name='order_index',
        schema='core',
    )
    # 3.2 Fix numeric precision: change from bare Numeric() -> Numeric(10, 2)
    op.alter_column(
        'plan_stops',
        'estimated_cost',
        type_=sa.Numeric(precision=10, scale=2),
        existing_type=sa.Numeric(),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('up_votes', sa.Integer(), nullable=False, server_default='0'),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('down_votes', sa.Integer(), nullable=False, server_default='0'),
        schema='core',
    )
    op.add_column(
        'plan_stops',
        sa.Column('backup_options', sa.JSON(), nullable=True),
        schema='core',
    )

    # 7. Updates for core.plan_votes
    # Drop existing unique constraint and foreign key pointing to plans.id
    op.drop_constraint('uq_plan_user_vote', 'plan_votes', schema='core', type_='unique')
    op.drop_constraint('plan_votes_plan_id_fkey', 'plan_votes', schema='core', type_='foreignkey')
    op.drop_column('plan_votes', 'plan_id', schema='core')

    # Add stop_id pointing to core.plan_stops.id
    op.add_column(
        'plan_votes',
        sa.Column('stop_id', sa.String(), nullable=False),
        schema='core',
    )
    op.create_foreign_key(
        'fk_plan_votes_stop_id_plan_stops',
        'plan_votes',
        'plan_stops',
        ['stop_id'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='CASCADE',
    )
    op.create_unique_constraint(
        'uq_stop_user_vote',
        'plan_votes',
        ['stop_id', 'user_id'],
        schema='core',
    )

    # 8. Updates for core.users
    op.add_column(
        'users',
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        schema='core',
    )
    op.alter_column(
        'users',
        'provider',
        type_=sa.Enum('LOCAL', 'GOOGLE', 'FACEBOOK', name='authprovider', schema='core'),
        existing_type=sa.String(),
        postgresql_using="provider::core.authprovider",
        schema='core',
    )

    # 9. Foreign keys for core.agent_logs
    op.create_foreign_key(
        'fk_agent_logs_user_id_users',
        'agent_logs',
        'users',
        ['user_id'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='SET NULL',
    )
    op.create_foreign_key(
        'fk_agent_logs_event_id_events',
        'agent_logs',
        'events',
        ['event_id'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='SET NULL',
    )
    op.create_foreign_key(
        'fk_agent_logs_plan_id_plans',
        'agent_logs',
        'plans',
        ['plan_id'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='SET NULL',
    )

    # 10. Create core.chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('event_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('role', postgresql.ENUM('USER', 'AI', 'SYSTEM', name='chatrole', schema='core', create_type=False), nullable=False, server_default='USER'),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['event_id'], ['core.events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['core.users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        schema='core',
    )
    op.create_index(
        'idx_chat_event_time',
        'chat_messages',
        ['event_id', 'created_at'],
        unique=False,
        schema='core',
    )


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Drop chat_messages
    op.drop_index('idx_chat_event_time', table_name='chat_messages', schema='core')
    op.drop_table('chat_messages', schema='core')

    # 2. Drop foreign keys on agent_logs
    op.drop_constraint('fk_agent_logs_plan_id_plans', 'agent_logs', schema='core', type_='foreignkey')
    op.drop_constraint('fk_agent_logs_event_id_events', 'agent_logs', schema='core', type_='foreignkey')
    op.drop_constraint('fk_agent_logs_user_id_users', 'agent_logs', schema='core', type_='foreignkey')

    # 3. Revert users table changes
    op.alter_column(
        'users',
        'provider',
        type_=sa.String(),
        existing_type=sa.Enum('LOCAL', 'GOOGLE', 'FACEBOOK', name='authprovider', schema='core'),
        schema='core',
    )
    op.drop_column('users', 'updated_at', schema='core')

    # 4. Revert plan_votes changes
    op.drop_constraint('uq_stop_user_vote', 'plan_votes', schema='core', type_='unique')
    op.drop_constraint('fk_plan_votes_stop_id_plan_stops', 'plan_votes', schema='core', type_='foreignkey')
    op.drop_column('plan_votes', 'stop_id', schema='core')

    op.add_column(
        'plan_votes',
        sa.Column('plan_id', sa.String(), nullable=False),
        schema='core',
    )
    op.create_foreign_key(
        'plan_votes_plan_id_fkey',
        'plan_votes',
        'plans',
        ['plan_id'],
        ['id'],
        source_schema='core',
        referent_schema='core',
        ondelete='CASCADE',
    )
    op.create_unique_constraint(
        'uq_plan_user_vote',
        'plan_votes',
        ['plan_id', 'user_id'],
        schema='core',
    )

    # 5. Revert plan_stops changes
    op.drop_column('plan_stops', 'backup_options', schema='core')
    op.drop_column('plan_stops', 'down_votes', schema='core')
    op.drop_column('plan_stops', 'up_votes', schema='core')
    op.alter_column(
        'plan_stops',
        'estimated_cost',
        type_=sa.Numeric(),
        existing_type=sa.Numeric(precision=10, scale=2),
        schema='core',
    )
    op.alter_column(
        'plan_stops',
        'order_index',
        new_column_name='order',
        schema='core',
    )
    op.drop_column('plan_stops', 'time_slot', schema='core')
    op.drop_column('plan_stops', 'day_number', schema='core')

    # 6. Revert plans changes
    op.drop_column('plans', 'macro_roadmap', schema='core')
    op.drop_column('plans', 'status', schema='core')

    # 7. Revert events changes
    op.drop_column('events', 'updated_at', schema='core')
    op.drop_constraint('fk_events_created_by_users', 'events', schema='core', type_='foreignkey')
    op.drop_column('events', 'created_by', schema='core')
    op.drop_column('events', 'final_locked', schema='core')
    op.drop_column('events', 'macro_locked', schema='core')
    op.drop_column('events', 'budget_tier', schema='core')
    op.drop_column('events', 'destination', schema='core')
    op.drop_column('events', 'scope', schema='core')

    # 8. Drop created enum types from core schema
    sa.Enum(name='authprovider', schema='core').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='chatrole', schema='core').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='timeslot', schema='core').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='planstatus', schema='core').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='budgettier', schema='core').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='eventscope', schema='core').drop(op.get_bind(), checkfirst=True)
