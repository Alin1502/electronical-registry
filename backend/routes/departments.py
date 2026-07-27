import boto3
import os
from services.s3 import upload_chart_to_s3, BUCKET_NAME
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.department import Department
from schemas.department import DepartmentCreate, DepartmentResponse
import easyocr
import numpy as np
import cv2
import re
import unicodedata
from core.permissions import require_admin_access

router = APIRouter()

@router.post("/", response_model=DepartmentResponse)
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    db_dept = Department(name=dept.name, company_id=current_user["company_id"])
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.get("/", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(Department).filter(Department.company_id == current_user["company_id"]).all()

@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(dept_id: int, dept: DepartmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    db_dept = db.query(Department).filter(Department.id == dept_id, Department.company_id == current_user["company_id"]).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db_dept.name = dept.name
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.delete("/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_admin_access(current_user)
    db_dept = db.query(Department).filter(Department.id == dept_id, Department.company_id == current_user["company_id"]).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_dept)
    db.commit()
    return {"status": "success", "message": "Department deleted"}

reader = easyocr.Reader(['ro', 'en'])

def remove_diacritics(text):
    return unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')

def extract_boxes_with_text(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    raw_text_list = reader.readtext(img, detail=0, paragraph=True)

    unique_roles = []
    seen = set()
    for text in raw_text_list:
        clean_text = " ".join(text.split()).strip()
        no_accents = remove_diacritics(clean_text)
        normalized_text = re.sub(r'[^\w\s]', '', no_accents).lower()
        if len(normalized_text) > 2 and normalized_text not in seen:
            seen.add(normalized_text)
            unique_roles.append(clean_text)

    return unique_roles


@router.post("/extract-chart")
async def extract_chart(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    require_admin_access(current_user)
    contents = await file.read()
    candidates = extract_boxes_with_text(contents)
    return {"candidates": candidates}

class BulkDepartmentCreate(BaseModel):
    names: List[str]

@router.post("/bulk", response_model=List[DepartmentResponse])
def create_departments_bulk(
    payload: BulkDepartmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    require_admin_access(current_user)
    created = []
    for name in payload.names:
        name = name.strip()
        if not name:
            continue
        existing = db.query(Department).filter(
            Department.company_id == current_user["company_id"],
            Department.name == name
        ).first()
        if existing:
            continue
        dept = Department(name=name, company_id=current_user["company_id"])
        db.add(dept)
        created.append(dept)

    db.commit()
    for d in created:
        db.refresh(d)
    return created