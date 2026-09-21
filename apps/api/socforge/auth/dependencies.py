"""FastAPI dependencies for authentication and RBAC.

Usage in routers:
    @router.get("/protected")
    async def endpoint(current_user: CurrentUser):
        ...

    @router.get("/admin-only")
    async def admin_endpoint(current_user: CurrentAdminUser):
        ...
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.security import decode_token, hash_token
from socforge.database import get_db
from socforge.models.user import APIKey, Role, User, UserSession

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
bearer_scheme = HTTPBearer(auto_error=False)

ROLE_HIERARCHY = {
    "Viewer": 0,
    "SOC Analyst": 1,
    "Detection Engineer": 2,
    "Incident Commander": 3,
    "Administrator": 4,
}


async def _get_user_from_token(
    token: str, db: AsyncSession
) -> User | None:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id: str | None = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    result = await db.execute(
        select(User).where(User.id == user_id, User.is_active.is_(True))
    )
    return result.scalar_one_or_none()


async def _get_user_from_api_key(api_key: str, db: AsyncSession) -> User | None:
    key_hash = hash_token(api_key)
    from datetime import datetime, timezone

    result = await db.execute(
        select(APIKey).where(
            APIKey.key_hash == key_hash,
            APIKey.revoked.is_(False),
        )
    )
    api_key_obj = result.scalar_one_or_none()
    if api_key_obj is None:
        return None

    # Check expiry
    if api_key_obj.expires_at and api_key_obj.expires_at < datetime.now(timezone.utc):
        return None

    user_result = await db.execute(
        select(User).where(User.id == api_key_obj.user_id, User.is_active.is_(True))
    )
    return user_result.scalar_one_or_none()


async def get_current_user(
    request: Request,
    token: Annotated[str | None, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Resolve the current user from either a Bearer JWT or an API key.

    The API key is passed as an Authorization: Bearer sf_... header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token is None:
        raise credentials_exception

    # Try JWT first
    user = await _get_user_from_token(token, db)
    if user is not None:
        return user

    # Try API key (keys start with "sf_")
    if token.startswith("sf_"):
        user = await _get_user_from_api_key(token, db)
        if user is not None:
            return user

    raise credentials_exception


async def get_optional_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    """Returns the current user or None (for optional auth endpoints)."""
    if token is None:
        return None
    user = await _get_user_from_token(token, db)
    if user is None and token.startswith("sf_"):
        user = await _get_user_from_api_key(token, db)
    return user


def require_role(minimum_role: str):
    """Dependency factory that enforces a minimum role level."""

    async def _check(
        current_user: Annotated[User, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> User:
        result = await db.execute(select(Role).where(Role.id == current_user.role_id))
        role = result.scalar_one_or_none()
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Role not found"
            )
        user_level = ROLE_HIERARCHY.get(role.name, -1)
        required_level = ROLE_HIERARCHY.get(minimum_role, 999)
        if user_level < required_level and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {minimum_role}",
            )
        return current_user

    return _check


# Convenience typed dependencies
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentAnalyst = Annotated[User, Depends(require_role("SOC Analyst"))]
CurrentDetectionEngineer = Annotated[User, Depends(require_role("Detection Engineer"))]
CurrentIncidentCommander = Annotated[User, Depends(require_role("Incident Commander"))]
CurrentAdminUser = Annotated[User, Depends(require_role("Administrator"))]
