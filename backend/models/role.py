from core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name= Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)