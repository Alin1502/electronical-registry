import boto3
import os
from services.s3 import upload_chart_to_s3
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.department import Department
from schemas.department import DepartmentCreate, DepartmentResponse
from services.s3 import upload_chart_to_s3, BUCKET_NAME
import easyocr
import numpy as np
import cv2
import re
import unicodedata
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

textract_client = boto3.client(
    "textract",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=os.getenv("AWS_REGION"),
)
"""
def extract_text_via_textract(s3_key: str, bucket_name: str) -> list[str]:
    response = textract_client.detect_document_text(
        Document={"S3Object": {"Bucket": bucket_name, "Name": s3_key}}
    )

    lines = [
        block["Text"].strip()
        for block in response["Blocks"]
        if block["BlockType"] == "LINE" and block.get("Text")
    ]

    # de-duplicate, preserve order
    seen = set()
    unique = []
    for line in lines:
        if line.lower() not in seen:
            seen.add(line.lower())
            unique.append(line)
    return unique
"""
"""
@router.post("/extract-chart")
async def extract_chart(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    contents = await file.read()

    try:
        s3_key = upload_chart_to_s3(contents, current_user["id"])
        candidates = extract_text_via_textract(s3_key, BUCKET_NAME)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process chart: {str(e)}")

    return {"candidates": candidates}
"""
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
    created = []
    for name in payload.names:
        name = name.strip()
        if not name:
            continue
        existing = db.query(Department).filter(
            Department.user_id == current_user["id"],
            Department.name == name
        ).first()
        if existing:
            continue  # skip duplicates
        dept = Department(name=name, user_id=current_user["id"])
        db.add(dept)
        created.append(dept)

    db.commit()
    for d in created:
        db.refresh(d)
    return created