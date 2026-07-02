from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from core.security import get_current_user
from models.file import UploadedFile
from models.entry import DocumentEntry

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_files = db.query(UploadedFile).filter(UploadedFile.user_id == current_user["id"])

    total_documents = user_files.count()

    recent_entries = db.query(DocumentEntry).filter(
        DocumentEntry.user_id == current_user["id"]
    ).order_by(DocumentEntry.created_at.desc()).limit(10).all()

    recent_activity = [
        {
            "register_type": e.register_type,
            "nr_inregistrare": e.nr_inregistrare,
            "rezumat": e.rezumat,
            "timestamp": e.created_at.isoformat()
        }
        for e in recent_entries
    ]

    return {
        "total_documents": total_documents,
        "recent_activity": recent_activity
    }