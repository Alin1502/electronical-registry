from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from botocore.exceptions import ClientError
from core.database import get_db
from core.security import get_current_user
from models.file import UploadedFile
from schemas.file import FileResponse, DownloadResponse, RemoveResponse
from services.s3 import upload_file_to_s3, generate_download_url, delete_file_from_s3
from typing import List
from models.entry import DocumentEntry
router = APIRouter()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    register_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    safe_folder = register_type.replace("/", "-").replace(" ", "_")
    s3_key = f"user_{current_user['id']}/{safe_folder}/{file.filename}"

    try:
        upload_file_to_s3(file.file, s3_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    db_file = UploadedFile(
        filename=file.filename,
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
    return db.query(UploadedFile).filter(UploadedFile.user_id == current_user['id']).all()

@router.get("/download/{file_id}", response_model=DownloadResponse)
def download_file(file_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    file_record = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.user_id == current_user['id']
    ).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    try:
        url = generate_download_url(file_record.s3_key)
        return {"download_url": url}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Could not generate link: {str(e)}")
    
@router.delete("/delete/{file_id}", response_model=RemoveResponse)
def delete_file(file_id:int, db: Session=Depends(get_db), current_user: dict=Depends(get_current_user)):
    file_record = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.user_id == current_user['id']
    ).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    try:
        delete_file_from_s3(file_record.s3_key)
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Could not delete file {str(e)}")
    db.query(DocumentEntry).filter(DocumentEntry.file_id == file_id).delete()
    db.delete(file_record)
    db.commit()


    return {"status": "success", "message":"File was deleted successfully from the registry"}