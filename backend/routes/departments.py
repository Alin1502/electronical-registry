from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.department import Department
from schemas.department import DepartmentCreate, DepartmentResponse

router = APIRouter()

@router.post("/", response_model=DepartmentResponse)
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_dept = Department(name=dept.name, user_id=current_user["id"])
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.get("/", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(Department).filter(Department.user_id == current_user["id"]).all()

@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(dept_id: int, dept: DepartmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_dept = db.query(Department).filter(Department.id == dept_id, Department.user_id == current_user["id"]).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db_dept.name = dept.name
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.delete("/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_dept = db.query(Department).filter(Department.id == dept_id, Department.user_id == current_user["id"]).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_dept)
    db.commit()
    return {"status": "success", "message": "Department deleted"}