from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

from models.role import Role
from core.database import get_db
from core.security import get_current_user, hash_password, create_access_token
from models.invite import Invite
from models.user import User
from models.company import Company
from services.email import send_invite_email
from core.permissions import require_admin_access
router = APIRouter()

class InviteCreate(BaseModel):
    email: EmailStr
    role_id: int | None = None

class InviteAccept(BaseModel):
    token: str
    username: str
    password: str


@router.post("/")
def create_invite(
    payload: InviteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    require_admin_access(current_user)
    if not current_user["is_owner"]:
        raise HTTPException(status_code=403, detail="Only the company owner can send invites")

    company = db.query(Company).filter(Company.id == current_user["company_id"]).first()

    token = secrets.token_urlsafe(32)
    invite = Invite(
        email=payload.email,
        company_id=current_user["company_id"],
        role_id=payload.role_id,
        invited_by_user_id=current_user["id"],
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=48),
    )
    db.add(invite)
    db.commit()

    send_invite_email(payload.email, company.name, token)
    return {"status": "invite sent"}


@router.post("/accept")
def accept_invite(payload: InviteAccept, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.token == payload.token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invite")
    if invite.accepted:
        raise HTTPException(status_code=400, detail="Invite already used")
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invite expired")

    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    company = db.query(Company).filter(Company.id == invite.company_id).first()

    user = User(
        username=payload.username,
        email=invite.email,
        hashed_password=hash_password(payload.password),
        company_id=invite.company_id,
        role_id=invite.role_id,
        is_owner=False,
    )
    db.add(user)
    invite.accepted = True
    db.commit()
    db.refresh(user)

    permission_level = "read"
    if invite.role_id:
        role = db.query(Role).filter(Role.id == invite.role_id).first()
        if role:
            permission_level = role.permission_level

    token = create_access_token(data={
        "sub": user.username,
        "id": user.id,
        "company_id": user.company_id,
        "company_name": company.name,
        "is_owner": user.is_owner,
        "permission_level": permission_level,
    })
    return {"access_token": token, "token_type": "bearer"}