import os
import uuid
import zipfile
from io import BytesIO
from typing import List

from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.entry import DocumentEntry
from models.file import UploadedFile
from models.history import DocumentHistory
from models.user import User
from schemas.file import DownloadResponse, FileResponse, RemoveResponse
from services.s3 import delete_file_from_s3, download_file_from_s3, generate_download_url, upload_file_to_s3
from core.permissions import require_write_access
router = APIRouter()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    register_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    require_write_access(current_user)
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    safe_folder = register_type.replace("/", "-").replace(" ", "_")
    filename = file.filename or "upload.pdf"
    name, ext = os.path.splitext(filename)
    safe_name = name.replace("/", "_").replace(" ", "_")
    safe_ext = ext or ".pdf"
    s3_key = f"user_{current_user['id']}/{safe_folder}/{safe_name}-{uuid.uuid4().hex[:12]}{safe_ext}"

    try:
        upload_file_to_s3(file.file, s3_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    db_file = UploadedFile(
        filename=filename,
        s3_key=s3_key,
        register_type=register_type,
        user_id=current_user['id']
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)  
    return {
        "status": "success",
        "message": f"{file.filename} uploaded successfully.",
        "file_id": db_file.id  
    }
@router.get("/", response_model=List[FileResponse])
def list_files(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return (
        db.query(UploadedFile)
        .join(User, User.id == UploadedFile.user_id)
        .filter(User.company_id == current_user['company_id'])
        .all()
    )

@router.get("/download/{file_id}", response_model=DownloadResponse)
def download_file(file_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    file_record = (
        db.query(UploadedFile)
        .join(User, User.id == UploadedFile.user_id)
        .filter(
            UploadedFile.id == file_id,
            User.company_id == current_user['company_id']
        )
        .first()
    )
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    try:
        url = generate_download_url(file_record.s3_key)
        return {"download_url": url}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Could not generate link: {str(e)}")
    
@router.delete("/delete/{file_id}", response_model=RemoveResponse)
def delete_file(file_id:int, db: Session=Depends(get_db), current_user: dict=Depends(get_current_user)):
    require_write_access(current_user)
    file_record = (
        db.query(UploadedFile)
        .join(User, User.id == UploadedFile.user_id)
        .filter(
            UploadedFile.id == file_id,
            User.company_id == current_user['company_id']
        )
        .first()
    )
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    try:
        delete_file_from_s3(file_record.s3_key)
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code") if hasattr(e, "response") else None
        if error_code not in {"NoSuchKey", "404"}:
            raise HTTPException(status_code=500, detail=f"Could not delete file {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not delete file {str(e)}")

    entries_to_delete = db.query(DocumentEntry).filter(DocumentEntry.file_id == file_id).all()
    for entry in entries_to_delete:
        db.query(DocumentHistory).filter(DocumentHistory.entry_id == entry.id).delete(synchronize_session=False)
        db.delete(entry)

    db.delete(file_record)
    db.commit()

    return {"status": "success", "message":"File was deleted successfully from the registry"}

@router.get("/download-all/{register_type}")
def download_all_files(register_type: str,db: Session = Depends(get_db),current_user: dict = Depends(get_current_user)):
    files = (
        db.query(UploadedFile)
        .join(User, User.id == UploadedFile.user_id)
        .filter(
            User.company_id == current_user["company_id"],
            UploadedFile.register_type == register_type,
        )
        .all()
    )

    if not files:
        raise HTTPException(status_code=404, detail="No files found for this register")

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file_record in files:
            try:
                file_bytes = download_file_from_s3(file_record.s3_key)
                zip_file.writestr(file_record.filename, file_bytes)
            except Exception:
                continue  # skip files that fail, don't crash the whole zip

    zip_buffer.seek(0)
    safe_name = register_type.replace("/", "-")

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={safe_name}.zip"}
    )