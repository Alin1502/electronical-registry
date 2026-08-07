from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from core.database import Base


class RegisterType(Base):
    __tablename__ = "register_types"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    key = Column(String, nullable=False)              # e.g. "contracte" — matches DocumentEntry.register_type
    display_name = Column(String, nullable=False)      # e.g. "Contracte" — renamable anytime
    field_config = Column(JSON, nullable=False)         # ordered list of field definitions, locked after creation
    is_locked = Column(Boolean, default=False)          # True once first confirmed — fields become immutable
    is_active = Column(Boolean, default=True)           # soft delete
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")