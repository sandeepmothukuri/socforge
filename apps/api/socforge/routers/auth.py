"""Auth router — login, logout, token refresh, current user."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from socforge.auth.dependencies import CurrentUser
from socforge.auth.security import (
    create_access_token,
    create_refresh_token,
    hash_token,
    verify_password,
)
from socforge.config import get_settings
from socforge.database import get_db
from socforge.models.operations import AuditAction
from socforge.models.user import User, UserSession
from socforge.services.audit import record_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds


class UserRead(BaseModel):
    id: str
    email: str
    full_name: str
    role_id: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    last_login_at: datetime | None

    model_config = {"from_attributes": True}


@router.post("/login", response_model=TokenResponse, summary="Login and obtain access token")
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Authenticate with email + password. Returns a JWT access token and refresh token."""
    # Look up user
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        await record_audit_event(
            db,
            action=AuditAction.login,
            actor_email=form_data.username,
            success=False,
            ip_address=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled"
        )

    access_token = create_access_token(str(user.id), {"email": user.email})
    refresh_token = create_refresh_token(str(user.id))

    settings = get_settings()

    # Record session
    session = UserSession(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(session)

    # Update last login
    user.last_login_at = datetime.now(UTC)

    await record_audit_event(
        db,
        action=AuditAction.login,
        actor_id=str(user.id),
        actor_email=user.email,
        success=True,
        ip_address=request.client.host if request.client else None,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/logout", summary="Revoke current refresh token")
async def logout(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Logout the current user (revoke active sessions)."""
    # Mark all user sessions as revoked
    result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.revoked.is_(False),
        )
    )
    for session in result.scalars():
        session.revoked = True

    await record_audit_event(
        db,
        action=AuditAction.logout,
        actor_id=str(current_user.id),
        actor_email=current_user.email,
        success=True,
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserRead, summary="Get current user profile")
async def get_current_user_profile(current_user: CurrentUser) -> User:
    return current_user
