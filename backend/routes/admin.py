from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from core.security import get_current_user
from models.department import Department
from models.file import UploadedFile
from models.entry import DocumentEntry
from models.user import User
from models.role import Role
from core.permissions import require_admin_access
from schemas.admin import AdminStatsResponse, RecentActivityItem
from services.s3 import get_file_size_from_s3
router = APIRouter()

@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)

    company_filter = User.company_id == current_user["company_id"]
    recent_cutoff = datetime.utcnow() - timedelta(days=7)

    total_entries = (
        db.query(func.count(DocumentEntry.id))
        .join(User, User.id == DocumentEntry.user_id)
        .filter(company_filter)
        .scalar()
        or 0
    )

    recent_entries_last_7_days = (
        db.query(func.count(DocumentEntry.id))
        .join(User, User.id == DocumentEntry.user_id)
        .filter(company_filter, DocumentEntry.created_at >= recent_cutoff)
        .scalar()
        or 0
    )

    pending_validation = (
        db.query(func.count(DocumentEntry.id))
        .join(User, User.id == DocumentEntry.user_id)
        .filter(
            company_filter,
            func.coalesce(func.trim(DocumentEntry.mod_rezolvare), "") == "",
        )
        .scalar()
        or 0
    )

    registry_count = (
        db.query(func.count(func.distinct(DocumentEntry.register_type)))
        .join(User, User.id == DocumentEntry.user_id)
        .filter(company_filter)
        .scalar()
        or 0
    )

    operator_count = db.query(func.count(User.id)).filter(company_filter).scalar() or 0

    department_count = db.query(func.count(Department.id)).filter(Department.company_id == current_user["company_id"]).scalar() or 0

    storage_bytes = 0
    files = (
        db.query(UploadedFile)
        .join(User, User.id == UploadedFile.user_id)
        .filter(company_filter)
        .all()
    )
    storage_needs_save = False
    for file_record in files:
        file_size = file_record.size_bytes or 0
        if file_size <= 0:
            try:
                file_size = get_file_size_from_s3(file_record.s3_key)
            except Exception:
                file_size = 0
            if file_size > 0:
                file_record.size_bytes = file_size
                storage_needs_save = True
        storage_bytes += file_size

    if storage_needs_save:
        db.commit()

    recent_entries = (
        db.query(DocumentEntry)
        .join(User, User.id == DocumentEntry.user_id)
        .filter(company_filter)
        .order_by(DocumentEntry.created_at.desc())
        .limit(10)
        .all()
    )

    recent_activity = [
        RecentActivityItem(
            register_type=e.register_type,
            nr_inregistrare=e.nr_inregistrare,
            rezumat=e.rezumat,
            timestamp=e.created_at.isoformat(),
        )
        for e in recent_entries
    ]

    return AdminStatsResponse(
        total_entries=total_entries,
        recent_entries_last_7_days=recent_entries_last_7_days,
        pending_validation=pending_validation,
        registry_count=registry_count,
        operator_count=operator_count,
        department_count=department_count,
        total_storage_bytes=storage_bytes,
        recent_activity=recent_activity,
    )

@router.get("/users")
def get_company_users(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    users = db.query(User).filter(User.company_id == current_user["company_id"]).all()
    
    result = []
    for user in users:
        role_name = None
        permission_level = "read"
        if user.is_owner:
            permission_level = "full_access"
            role_name = "Owner"
        elif user.role_id:
            role = db.query(Role).filter(Role.id == user.role_id).first()
            if role:
                role_name = role.name
                permission_level = role.permission_level
        
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_owner": user.is_owner,
            "role": role_name,
            "permission_level": permission_level,
        })
    
    return result