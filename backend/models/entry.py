from core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from datetime import datetime


class DocumentEntry(Base):
    __tablename__ = "document_entries"
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    register_type = Column(String, nullable=False)

    #nume_firma = Column(String)
    #nume_registru = Column(String)

    nr_inregistrare = Column(String)
    cod = Column(String)
    iesire_intrare = Column(String)
    nr_data_emitent = Column(String)
    nr_data_destinator = Column(String)
    rezumat = Column(String)
    repartizare_dpt = Column(String)
    mod_rezolvare = Column(String)
    nr_pag_anexe = Column(String)

    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    history = relationship("DocumentHistory", back_populates="entry", order_by="DocumentHistory.created_at",cascade="all, delete-orphan",
)
