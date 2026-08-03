from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class UploadedFile(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    s3_key = Column(String, unique=True, nullable=False)
    register_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False, default=0)
    is_secure_document = Column(Boolean, nullable=False, default=False)
    access_code_hash = Column(String(64), index=True, nullable=True)
    encryption_salt = Column(String(64), nullable=True)
    encryption_nonce = Column(String(64), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    owner = relationship("User")