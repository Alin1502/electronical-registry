from sqlalchemy import Column, Integer, String, ForeignKey
from core.database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    permission_level = Column(String, nullable=False, default="read")  # "full_access" | "read_write" | "read"