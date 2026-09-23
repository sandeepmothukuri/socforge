"""Security tests for Multi-Tenancy and Workspace Isolation."""

import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from socforge.auth.security import create_access_token, hash_password
from socforge.database import AsyncSessionLocal
from socforge.main import app
from socforge.models.investigation import Investigation
from socforge.models.operations import Workspace, WorkspaceMemberRole, WorkspaceMembership
from socforge.models.user import Role, User


@pytest.mark.asyncio
async def test_workspace_isolation_and_cross_tenant_denial():
    """Verify that Tenant A cannot access or discover Tenant B's workspaces or investigations."""
    async with AsyncSessionLocal() as db:
        # Fetch or create roles
        role_res = await db.execute(select(Role).where(Role.name == "SOC Analyst"))
        analyst_role = role_res.scalar_one_or_none()
        if not analyst_role:
            analyst_role = Role(name="SOC Analyst", description="Analyst")
            db.add(analyst_role)
            await db.flush()

        # Create Workspace Alpha (Tenant A)
        ws_a = Workspace(name=f"Tenant Alpha {uuid.uuid4().hex[:6]}", slug=f"alpha-{uuid.uuid4().hex[:6]}", is_active=True)
        # Create Workspace Beta (Tenant B)
        ws_b = Workspace(name=f"Tenant Beta {uuid.uuid4().hex[:6]}", slug=f"beta-{uuid.uuid4().hex[:6]}", is_active=True)
        db.add_all([ws_a, ws_b])
        await db.flush()

        # Create User Alpha (belongs to ws_a)
        user_a = User(
            email=f"alice-{uuid.uuid4().hex[:6]}@alpha.local",
            hashed_password=hash_password("password123"),
            full_name="Alice Alpha",
            role_id=analyst_role.id,
            is_active=True,
            is_superuser=False,
        )
        # Create User Beta (belongs to ws_b)
        user_b = User(
            email=f"bob-{uuid.uuid4().hex[:6]}@beta.local",
            hashed_password=hash_password("password123"),
            full_name="Bob Beta",
            role_id=analyst_role.id,
            is_active=True,
            is_superuser=False,
        )
        db.add_all([user_a, user_b])
        await db.flush()

        # Add memberships
        db.add(WorkspaceMembership(workspace_id=ws_a.id, user_id=user_a.id, role=WorkspaceMemberRole.analyst))
        db.add(WorkspaceMembership(workspace_id=ws_b.id, user_id=user_b.id, role=WorkspaceMemberRole.analyst))

        # Create an investigation inside Workspace Beta
        inv_b = Investigation(
            title="Confidential Tenant B Breach Investigation",
            severity="critical",
            workspace_id=ws_b.id,
            created_by_id=user_b.id,
            assigned_to_id=user_b.id,
        )
        db.add(inv_b)
        await db.commit()

        # Generate tokens
        token_a = create_access_token(str(user_a.id), {"email": user_a.email})
        token_b = create_access_token(str(user_b.id), {"email": user_b.email})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. User Alpha lists workspaces: must see Workspace A, must NOT see Workspace B
        resp = await client.get("/api/v1/workspaces", headers={"Authorization": f"Bearer {token_a}"})
        assert resp.status_code == 200
        workspaces = resp.json()
        ws_ids = [w["id"] for w in workspaces]
        assert str(ws_a.id) in ws_ids
        assert str(ws_b.id) not in ws_ids

        # 2. User Alpha attempts to query investigations specifying Workspace B ID -> HTTP 403 Forbidden
        resp_invs = await client.get(
            f"/api/v1/investigations?workspace_id={ws_b.id}",
            headers={"Authorization": f"Bearer {token_a}"},
        )
        assert resp_invs.status_code == 403
        assert "Access denied" in resp_invs.text

        # 3. User Alpha attempts to directly GET Tenant B's investigation -> HTTP 403 Forbidden
        resp_get = await client.get(
            f"/api/v1/investigations/{inv_b.id}",
            headers={"Authorization": f"Bearer {token_a}"},
        )
        assert resp_get.status_code == 403
        assert "Access denied" in resp_get.text

        # 4. User Beta queries their own investigation -> HTTP 200 OK
        resp_b = await client.get(
            f"/api/v1/investigations/{inv_b.id}",
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert resp_b.status_code == 200
        assert resp_b.json()["title"] == "Confidential Tenant B Breach Investigation"
