from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

import os
import sys
import asyncio

# Thêm thư mục /backend vào sys.path để import được app.*
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load .env từ thư mục gốc project hoặc thư mục backend
from dotenv import load_dotenv
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
root_dir = os.path.abspath(os.path.join(backend_dir, '..'))
load_dotenv(os.path.join(root_dir, '.env'))
load_dotenv(os.path.join(backend_dir, '.env'))

# Import toàn bộ models — BẮT BUỘC để autogenerate hoạt động
import app.models  # __init__.py đã import hết User, Event, Plan...
from app.models.base import Base
from sqlalchemy.ext.asyncio import create_async_engine
import sqlalchemy as sa

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# Use DIRECT_URL (direct port 5432) for DDL migrations instead of transaction pooler (port 6543)
database_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
if database_url:
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    config.set_main_option("sqlalchemy.url", database_url)

def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table":
        # Only diff tables belonging to the 'core' schema
        return getattr(object, "schema", None) == "core"
    return True

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        version_table_schema="core",
        include_object=include_object,
    )

    with context.begin_transaction():
        context.execute("CREATE SCHEMA IF NOT EXISTS core;")
        context.run_migrations()

def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        version_table_schema="core",
        include_object=include_object,
    )
    with context.begin_transaction():
        context.execute("CREATE SCHEMA IF NOT EXISTS core;")
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode (async engine)."""
    url = config.get_main_option("sqlalchemy.url")
    connectable = create_async_engine(url, poolclass=pool.NullPool)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
        await connection.commit()

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
