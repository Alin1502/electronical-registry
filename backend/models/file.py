from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class UploadedFile(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    s3_key = Column(String, unique=True, nullable=False)
    register_type = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    owner = relationship("User")