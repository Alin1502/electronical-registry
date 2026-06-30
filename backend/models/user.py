from core.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    company_name = Column(String, unique=False, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    files = relationship("UploadedFile", back_populates="owner")