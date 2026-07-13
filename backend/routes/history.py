from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from botocore.exceptions import ClientError
from core.database import get_db
from core.security import get_current_user
from models.file import UploadedFile
from schemas.file import FileResponse, DownloadResponse, RemoveResponse
from services.s3 import upload_file_to_s3, generate_download_url, delete_file_from_s3, download_file_from_s3
from typing import List
from models.entry import DocumentEntry
from models.history import DocumentHistory
from schemas.history import HistoryCreate
import zipfile
from io import BytesIO
from fastapi.responses import StreamingResponse
router = APIRouter()

@router.post("/entries/{entry_id}/history")
def add_history_event(
    entry_id: int,
    payload: HistoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    entry = db.query(DocumentEntry).filter(
        DocumentEntry.id == entry_id,
        DocumentEntry.user_id == current_user["id"]
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    event = DocumentHistory(
        entry_id=entry_id,
        user_id=current_user["id"],
        status=payload.status,
        note=payload.note,
    )
    db.add(event)
    db.commit()
    return {"status": "ok"}

@router.get("/entries/{entry_id}/history")
def get_history(entry_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    entry = db.query(DocumentEntry).filter(
        DocumentEntry.id == entry_id,
        DocumentEntry.user_id == current_user["id"]
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry.history