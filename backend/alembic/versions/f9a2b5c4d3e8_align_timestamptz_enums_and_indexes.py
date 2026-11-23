"""align_timestamptz_enums_and_indexes

Revision ID: f9a2b5c4d3e8
Revises: e8f1a4b3c2d7
Create Date: 2026-11-23 16:47:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f9a2b5c4d3e8'
down_revision: Union[str, Sequence[str], None] = 'e8f1a4b3c2d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_SIMPLE_ENUMS_TO_MOVE = (
    'eventtype',
    'invitationstatus',
    'stopcategory',
    'votevalue',
    'systemrole',
)


def _move_enum_schema(enum_name: str, src_schema: str, dst_schema: str) -> None:
    op.execute(f"""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_type t
                JOIN pg_namespace n ON n.oid = t.typnamespace
                WHERE n.nspname = '{src_schema}' AND t.typname = '{enum_name}'
            ) AND NOT EXISTS (
                SELECT 1
                FROM pg_type t
                JOIN pg_namespace n ON n.oid = t.typnamespace
                WHERE n.nspname = '{dst_schema}' AND t.typname = '{enum_name}'
            ) THEN
                ALTER TYPE {src_schema}.{enum_name} SET SCHEMA {dst_schema};
            END IF;
        END $$;
    """)


def upgrade() -> None:
    """Align legacy TIMESTAMPTZ columns, enum schemas, index naming, and plan status default."""
    # 1. Convert legacy naive TIMESTAMP columns to TIMESTAMPTZ (matching SQLAlchemy models)
    op.alter_column(
        'events',
        'start_date',
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        postgresql_using="start_date AT TIME ZONE 'UTC'",
        schema='core',
    )
    op.alter_column(
        'events',
        'end_date',
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        postgresql_using="end_date AT TIME ZONE 'UTC'",
        schema='core',
    )
    op.alter_column(
        'plan_stops',
        'start_time',
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
        postgresql_using="start_time AT TIME ZONE 'UTC'",
        schema='core',
    )

    # 2. Move 5 legacy enum types from public -> core schema
    for enum_name in _SIMPLE_ENUMS_TO_MOVE:
        _move_enum_schema(enum_name, 'public', 'core')

    # 3. Migrate eventrole from public ('OWNER','MEMBER','VIEWER','HOST') -> core ('HOST','MEMBER','VIEWER')
    op.execute("UPDATE core.event_members SET role = 'HOST' WHERE role::text = 'OWNER'")
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_type t
                JOIN pg_namespace n ON n.oid = t.typnamespace
                WHERE n.nspname = 'core' AND t.typname = 'eventrole'
            ) THEN
                CREATE TYPE core.eventrole AS ENUM ('HOST', 'MEMBER', 'VIEWER');
            END IF;
        END $$;
    """)
    op.execute(
        "ALTER TABLE core.event_members "
        "ALTER COLUMN role TYPE core.eventrole USING role::text::core.eventrole"
    )
    op.execute("DROP TYPE IF EXISTS public.eventrole")

    # 4. Drop leftover deprecated expense enums from public schema
    op.execute("DROP TYPE IF EXISTS public.expensetype CASCADE")
    op.execute("DROP TYPE IF EXISTS public.splittype CASCADE")

    # 5. Align users.email index name with SQLAlchemy core schema metadata
    op.execute("ALTER INDEX IF EXISTS core.ix_users_email RENAME TO ix_core_users_email")

    # 6. Align plans.status server_default with PlanStatus.INITIAL
    op.alter_column(
        'plans',
        'status',
        server_default='INITIAL',
        schema='core',
    )


def downgrade() -> None:
    """Revert TIMESTAMPTZ, enum schema, index name, and plan status default changes."""
    op.alter_column(
        'plans',
        'status',
        server_default='DRAFT',
        schema='core',
    )

    op.execute("ALTER INDEX IF EXISTS core.ix_core_users_email RENAME TO ix_users_email")

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_type t
                JOIN pg_namespace n ON n.oid = t.typnamespace
                WHERE n.nspname = 'public' AND t.typname = 'eventrole'
            ) THEN
                CREATE TYPE public.eventrole AS ENUM ('OWNER', 'MEMBER', 'VIEWER', 'HOST');
            END IF;
        END $$;
    """)
    op.execute(
        "ALTER TABLE core.event_members "
        "ALTER COLUMN role TYPE public.eventrole USING role::text::public.eventrole"
    )
    op.execute("DROP TYPE IF EXISTS core.eventrole")

    for enum_name in reversed(_SIMPLE_ENUMS_TO_MOVE):
        _move_enum_schema(enum_name, 'core', 'public')

    op.alter_column(
        'plan_stops',
        'start_time',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=True,
        postgresql_using="start_time AT TIME ZONE 'UTC'",
        schema='core',
    )
    op.alter_column(
        'events',
        'end_date',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=False,
        postgresql_using="end_date AT TIME ZONE 'UTC'",
        schema='core',
    )
    op.alter_column(
        'events',
        'start_date',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=False,
        postgresql_using="start_date AT TIME ZONE 'UTC'",
        schema='core',
    )
