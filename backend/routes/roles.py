from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.role import Role
from schemas.role import RoleCreate, RoleResponse
from core.permissions import require_admin_access
router = APIRouter()

@router.post("/", response_model=RoleResponse)
def create_role(role: RoleCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    db_role = Role(name=role.name, company_id=current_user["company_id"])
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.get("/", response_model=List[RoleResponse])
def list_roles(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    return db.query(Role).filter(Role.company_id == current_user["company_id"]).all()

@router.put("/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, role: RoleCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    db_role = db.query(Role).filter(Role.id == role_id, Role.company_id == current_user["company_id"]).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    db_role.name = role.name
    db.commit()
    db.refresh(db_role)
    return db_role

@router.delete("/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    db_role = db.query(Role).filter(Role.id == role_id, Role.company_id == current_user["company_id"]).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(db_role)
    db.commit()
    return {"status": "success", "message": "Role deleted"}