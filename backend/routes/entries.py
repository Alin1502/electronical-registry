from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from core.security import get_current_user
from models.entry import DocumentEntry
from schemas.entry import EntryCreate, EntryResponse
from typing import List
import openpyxl
from openpyxl.styles import Border, Side
from io import BytesIO
from datetime import date
router = APIRouter()

TITLE = [
    "Nume Firma",
    "Nume Registru"
]

COLUMNS = [
    "Nr Inregistrare", "Cod", "Iesire/Intrare", "Nr/Data Emitent",
    "Nr/Data Destinator", "Rezumat", "Repartizare Dpt",
    "Mod Rezolvare", "Nr Pag & Nr Anexe"
]

FIELD_MAP = [
    "nr_inregistrare", "cod", "iesire_intrare", "nr_data_emitent",
    "nr_data_destinator", "rezumat", "repartizare_dpt",
    "mod_rezolvare", "nr_pag_anexe"
]

@router.post("/", response_model=EntryResponse)
def create_entry(
    entry: EntryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_entry = DocumentEntry(**entry.model_dump(), user_id=current_user["id"])
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/{register_type}", response_model=List[EntryResponse])
def get_entries(
    register_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(DocumentEntry).filter(
        DocumentEntry.user_id == current_user["id"],
        DocumentEntry.register_type == register_type
    ).all()

@router.get("/{register_type}/excel")
def download_excel(
    register_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    entries = db.query(DocumentEntry).filter(
        DocumentEntry.user_id == current_user["id"],
        DocumentEntry.register_type == register_type
    ).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = register_type[:31]  # Excel tab name limit

    # Header row
    #ws.append(TITLE)
    ws.append(COLUMNS)

    # Data rows
    for entry in entries:
        ws.append([getattr(entry, field) for field in FIELD_MAP])

    # Auto-width columns
    for col in ws.columns:
        max_len = max(len(str(cell.value or "")) for cell in col)
        ws.column_dimensions[col[0].column_letter].width = max_len + 4

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    filename = f"{register_type.replace('/', '-')}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/next-nr/{register_type}")
def get_next_nr(
    register_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    today = date.today()
    date_prefix = today.strftime("%Y/%m/%d")
    date_compact = today.strftime("%Y%m%d")

    # count how many entries exist for this user + register + today
    count_today = db.query(DocumentEntry).filter(
        DocumentEntry.user_id == current_user["id"],
        DocumentEntry.register_type == register_type,
        func.date(DocumentEntry.created_at) == today
    ).count()

    next_count = count_today + 1
    count_str = str(next_count).zfill(3)  # 001, 002, etc.

    return {
        "nr_inregistrare": f"{date_prefix}/{count_str}",
        "cod": f"{date_compact}{count_str}"
    }