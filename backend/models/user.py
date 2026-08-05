from core.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    is_owner = Column(Boolean, default=False)
    avatar_s3_key = Column(String, nullable=True)

    company = relationship("Company")