from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.notification import Notification
from schemas.notification import NotificationResponse

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def list_notifications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user["id"])
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )

@router.patch("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == current_user["id"],
        Notification.is_read == False,
    ).update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"status": "success"}