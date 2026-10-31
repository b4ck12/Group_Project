"""Unit tests for Phase 3: Alembic migrations, core schema configuration, and revision history."""
import importlib
import importlib.util
from pathlib import Path
import pytest
from sqlalchemy import MetaData, Numeric


def test_migration_chain_integrity():
    """Verify all migration revisions form an unbroken chain to head."""
    versions_dir = Path(__file__).resolve().parent.parent / "alembic" / "versions"
    assert versions_dir.exists(), f"Versions dir not found: {versions_dir}"

    migration_files = list(versions_dir.glob("*.py"))
    assert len(migration_files) >= 3, f"Expected at least 3 migration files, found {len(migration_files)}"

    revisions = {}
    for mf in migration_files:
        spec = importlib.util.spec_from_file_location(mf.stem, mf)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        assert hasattr(mod, "revision"), f"{mf.name} missing revision"
        assert hasattr(mod, "down_revision"), f"{mf.name} missing down_revision"
        revisions[mod.revision] = {
            "down_revision": mod.down_revision,
            "doc": mod.__doc__,
            "module": mod,
            "file": mf.name,
        }

    # Verify initial revision
    assert "f68311ebd9d7" in revisions
    assert revisions["f68311ebd9d7"]["down_revision"] is None

    # Verify check constraints revision (Task 3.3: rename message)
    assert "e1ed950842d0" in revisions
    assert revisions["e1ed950842d0"]["down_revision"] == "f68311ebd9d7"
    assert "add_check_constraints" in (revisions["e1ed950842d0"]["doc"] or "")

    # Verify latest revision (align_models_with_design_docs)
    assert "b3a7c1e8d9f4" in revisions
    assert revisions["b3a7c1e8d9f4"]["down_revision"] == "e1ed950842d0"
    latest_mod = revisions["b3a7c1e8d9f4"]["module"]
    assert hasattr(latest_mod, "upgrade") and callable(latest_mod.upgrade)
    assert hasattr(latest_mod, "downgrade") and callable(latest_mod.downgrade)


def test_alembic_env_configuration():
    """Verify env.py configuration includes core schema and DIRECT_URL handling."""
    env_file = Path(__file__).resolve().parent.parent / "alembic" / "env.py"
    assert env_file.exists()

    content = env_file.read_text(encoding="utf-8")
    assert 'version_table_schema="core"' in content
    assert 'include_schemas=True' in content
    assert 'DIRECT_URL' in content
    assert 'CREATE SCHEMA IF NOT EXISTS core' in content
    assert 'include_object' in content


def test_plan_stops_numeric_precision():
    """Verify plan_stops.estimated_cost model and migration precision."""
    from app.models.plan import PlanStop

    estimated_cost_col = PlanStop.__table__.columns["estimated_cost"]
    assert isinstance(estimated_cost_col.type, Numeric)
    assert estimated_cost_col.type.precision == 10
    assert estimated_cost_col.type.scale == 2


def test_core_schema_isolation_on_models():
    """Verify all models belong to 'core' schema."""
    from app.models.base import Base
    import app.models  # ensures all models are registered

    assert Base.metadata.schema == "core"

    expected_tables = {
        "core.users",
        "core.events",
        "core.event_members",
        "core.invitations",
        "core.plans",
        "core.plan_stops",
        "core.plan_votes",
        "core.expenses",
        "core.expense_splits",
        "core.settlements",
        "core.agent_logs",
        "core.chat_messages",
    }

    registered_tables = {table.key for table in Base.metadata.tables.values()}
    for expected in expected_tables:
        assert expected in registered_tables, f"Missing table {expected} in Base.metadata"
