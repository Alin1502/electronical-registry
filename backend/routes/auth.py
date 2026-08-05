from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import hash_password, verify_password, create_access_token, get_current_user
from models.user import User
from services.s3 import upload_avatar_to_s3, generate_avatar_url
from models.company import Company
from schemas.user import UserAuth, TokenResponse, UserRegister, UserProfileResponse, ProfileUpdateRequest, PasswordChangeRequest
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


def _profile_response(user: User) -> UserProfileResponse:
    avatar_url = generate_avatar_url(user.avatar_s3_key) if user.avatar_s3_key else None
    return UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=avatar_url,
        is_owner=user.is_owner,
        company_name=user.company.name,
    )


@router.get("/me", response_model=UserProfileResponse)
def get_me(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _profile_response(user)


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email is not None:
        existing = (
            db.query(User)
            .filter(User.email == payload.email, User.id != user.id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = payload.email

    db.commit()
    db.refresh(user)
    return _profile_response(user)


@router.put("/password")
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated"}


@router.post("/avatar", response_model=UserProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Only JPEG or PNG images are allowed")

    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    s3_key = upload_avatar_to_s3(image_bytes, user.id, file.content_type)
    user.avatar_s3_key = s3_key
    db.commit()
    db.refresh(user)
    return _profile_response(user)