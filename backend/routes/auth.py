from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from models.user import User
from models.company import Company
from schemas.user import UserAuth, TokenResponse, UserRegister
from models.role import Role
router = APIRouter()

@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    company = Company(name=user_data.company_name)
    db.add(company)
    db.flush()  # get company.id without ending the transaction

    new_user = User(
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        company_id=company.id,
        is_owner=True,
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login(user_data: UserAuth, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    permission_level = "full_access" if user.is_owner else "read"
    if user.role_id:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if role:
            permission_level = role.permission_level

    token = create_access_token(data={
        "sub": user.username,
        "id": user.id,
        "company_id": user.company_id,
        "company_name": user.company.name,
        "is_owner": user.is_owner,
        "permission_level": permission_level,
    })
    return {"access_token": token, "token_type": "bearer"}