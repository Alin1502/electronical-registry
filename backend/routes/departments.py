import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
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

def extract_boxes_with_text(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Otsu picks the threshold automatically instead of a guessed fixed value
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # RETR_CCOMP gives hierarchy: outer borders/lines are one level,
    # box interiors are "holes" nested one level inside them
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)

    img_h, img_w = gray.shape
    img_area = img_w * img_h
    min_area = img_area * 0.003
    max_area = img_area * 0.35

    boxes = []
    if hierarchy is not None:
        for i, cnt in enumerate(contours):
            parent = hierarchy[0][i][3]
            if parent == -1:
                continue  # skip top-level shapes (borders/lines), we want holes only

            x, y, w, h = cv2.boundingRect(cnt)
            area = w * h
            if area < min_area or area > max_area:
                continue
            aspect = w / h
            if aspect < 0.5 or aspect > 6:
                continue
            boxes.append((x, y, w, h))

    print(f"[extract] total contours: {len(contours)}, valid box candidates: {len(boxes)}")

    boxes.sort(key=lambda b: (round(b[1] / 60), b[0]))

    results = []
    for (x, y, w, h) in boxes:
        pad = 6
        y1, y2 = max(0, y - pad), min(img.shape[0], y + h + pad)
        x1, x2 = max(0, x - pad), min(img.shape[1], x + w + pad)
        crop = img[y1:y2, x1:x2]
        if crop.size == 0:
            continue
        crop_gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        _, crop_thresh = cv2.threshold(crop_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        pil_img = Image.fromarray(crop_thresh)
        text = pytesseract.image_to_string(pil_img, config="--psm 6").strip()
        text = " ".join(text.split())
        if text and len(text) > 1:
            results.append(text)

    seen = set()
    unique = []
    for t in results:
        if t.lower() not in seen:
            seen.add(t.lower())
            unique.append(t)
    return unique


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