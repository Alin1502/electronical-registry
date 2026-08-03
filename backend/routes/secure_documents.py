import os
import uuid
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.permissions import require_admin_access
from core.security import get_current_user
from models.file import UploadedFile
from models.user import User
from schemas.secure_documents import SecureDocumentAccessRequest, SecureDocumentUploadResponse
from services.s3 import download_file_from_s3, upload_file_to_s3
from services.secure_documents import (
    decrypt_document,
    encrypt_document,
    generate_access_code,
    hash_access_code,
    normalize_access_code,
)

router = APIRouter()


def _find_secure_file(db: Session, company_id: int, access_code_hash: str):
    return (
        db.query(UploadedFile)
        .join(User, User.id == UploadedFile.user_id)
        .filter(
            User.company_id == company_id,
            UploadedFile.is_secure_document.is_(True),
            UploadedFile.access_code_hash == access_code_hash,
        )
        .first()
    )


@router.post("/upload", response_model=SecureDocumentUploadResponse)
async def upload_secure_document(
    file: UploadFile = File(...),
    register_type: str = Form("secure-documents"),
    code: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    require_admin_access(current_user)

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    plaintext = await file.read()
    if not plaintext:
        raise HTTPException(status_code=400, detail="File is empty")

    access_code = code.strip() if code else generate_access_code()
    normalized_code = normalize_access_code(access_code)
    if len(normalized_code) < 12:
        raise HTTPException(status_code=400, detail="Access code must be at least 12 alphanumeric characters")

    access_code_hash = hash_access_code(access_code, current_user["company_id"])
    existing_file = _find_secure_file(db, current_user["company_id"], access_code_hash)
    if existing_file is not None:
        raise HTTPException(status_code=409, detail="Access code already exists for this company")

    ciphertext, salt, nonce = encrypt_document(plaintext, access_code)

    safe_name = os.path.splitext(file.filename)[0].replace("/", "_").replace(" ", "_") or "secure-document"
    s3_key = f"secure/{current_user['company_id']}/{uuid.uuid4().hex}-{safe_name}.enc"

    try:
        upload_file_to_s3(BytesIO(ciphertext), s3_key)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}")

    db_file = UploadedFile(
        filename=file.filename,
        s3_key=s3_key,
        register_type=register_type,
        size_bytes=len(plaintext),
        user_id=current_user["id"],
        is_secure_document=True,
        access_code_hash=access_code_hash,
        encryption_salt=salt.hex(),
        encryption_nonce=nonce.hex(),
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {
        "file_id": db_file.id,
        "filename": db_file.filename,
        "access_code": access_code,
    }


@router.post("/access")
def access_secure_document(
    payload: SecureDocumentAccessRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    normalized_code = normalize_access_code(payload.code)
    if len(normalized_code) < 12:
        raise HTTPException(status_code=400, detail="Invalid access code")

    access_code_hash = hash_access_code(payload.code, current_user["company_id"])
    file_record = _find_secure_file(db, current_user["company_id"], access_code_hash)
    if file_record is None:
        raise HTTPException(status_code=404, detail="File not found")

    if not file_record.encryption_salt or not file_record.encryption_nonce:
        raise HTTPException(status_code=500, detail="Secure file metadata is incomplete")

    try:
        encrypted_bytes = download_file_from_s3(file_record.s3_key)
        plaintext = decrypt_document(
            encrypted_bytes,
            payload.code,
            file_record.encryption_salt,
            file_record.encryption_nonce,
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid access code")

    download_name = file_record.filename or "secure-document.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{download_name}"'}
    return StreamingResponse(BytesIO(plaintext), media_type="application/pdf", headers=headers)