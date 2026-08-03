from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.permissions import require_admin_access, require_write_access
from core.database import get_db
from core.security import get_current_user
from models.entry import DocumentEntry
from models.history import DocumentHistory
from models.user import User
from schemas.entry import EntryCreate, EntryResponse, StatusUpdate, PendingNotificationResponse
from typing import List
import openpyxl
from openpyxl.styles import Border, Side, Font, Alignment
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

@router.get("/pending", response_model=List[PendingNotificationResponse])
def get_pending_validations(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    require_admin_access(current_user)
    
    # Perform a join to grab the document AND the user who uploaded it
    pending_docs = db.query(DocumentEntry, User).join(
        User, DocumentEntry.user_id == User.id
    ).filter(
        DocumentEntry.status == "pending"
    ).all()
    
    # Format it for the frontend
    results = []
    for doc, user in pending_docs:
        results.append({
            "id": doc.id,
            "entry_id": doc.id,
            "username": user.username,
            "register_type": doc.register_type,
            "created_at": doc.created_at,
            "nr_inregistrare": doc.nr_inregistrare
        })
        
    return results

@router.post("/", response_model=EntryResponse)
def create_entry(
    entry: EntryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    require_write_access(current_user)
    
    # Determine status based on role
    # Assuming current_user dictionary holds 'permission_level'
    initial_status = "validated" if current_user.get("permission_level") == "full_access" else "pending"
    
    #Inject the status into the database model
    db_entry = DocumentEntry(**entry.model_dump(), user_id=current_user["id"], status=initial_status)
    db.add(db_entry)
    db.flush()  # assigns db_entry.id without ending the transaction

    #Log the correct initial status in the history
    history_event = DocumentHistory(
        entry_id=db_entry.id,
        user_id=current_user["id"],
        status=initial_status,
    )
    db.add(history_event)

    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.patch("/{entry_id}/status", response_model=EntryResponse)
def update_entry_status(
    entry_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Enforce that ONLY admins can change statuses
    from core.permissions import require_admin_access
    require_admin_access(current_user)

    db_entry = db.query(DocumentEntry).filter(DocumentEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    # Prevent unnecessary database hits if status isn't changing
    if db_entry.status == payload.status:
        return db_entry

    # Update the document's state
    db_entry.status = payload.status

    # Add the validation action to the audit history
    history_event = DocumentHistory(
        entry_id=db_entry.id,
        user_id=current_user["id"],
        status=payload.status,
    )
    db.add(history_event)

    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.get("/next-nr/{register_type:path}")
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

def sanitize_sheet_title(value: str) -> str:
    invalid_chars = r'\/*?:[]'
    cleaned = "".join(c for c in value if c not in invalid_chars)
    return cleaned[:31] or "Sheet1"

@router.get("/{register_type:path}/excel")
def download_excel(
    register_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    entries = (
        db.query(DocumentEntry)
        .join(User, User.id == DocumentEntry.user_id)
        .filter(
            User.company_id == current_user["company_id"],
            DocumentEntry.register_type == register_type,
        )
        .all()
    )

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sanitize_sheet_title(register_type)
    num_cols = len(COLUMNS)
    mid = num_cols // 2

    thin = Side(style="thin", color="000000")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=mid)
    ws.merge_cells(start_row=1, start_column=mid + 1, end_row=1, end_column=num_cols)


    company_cell = ws.cell(row=1, column=1, value=current_user["company_name"])
    company_cell.font = Font(size=16, bold=True)
    company_cell.alignment = Alignment(horizontal="center", vertical="center")

    register_cell = ws.cell(row=1, column=mid + 1, value=register_type)
    register_cell.font = Font(size=16, bold=True)
    register_cell.alignment = Alignment(horizontal="center", vertical="center")

    ws.row_dimensions[1].height = 30
    ws.row_dimensions[2].height = 8

    #row 3 - headers
    for col_idx, header in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=3, column=col_idx, value=header)
        cell.font = Font(bold=True)
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border

    #row 4 and below, data
    for row_offset, entry in enumerate(entries, start=4):
        for col_idx, field in enumerate(FIELD_MAP, start=1):
            cell = ws.cell(row=row_offset, column=col_idx, value=getattr(entry, field))
            cell.border = border

    # auto-width columns, based on headers + data only (skip title row)
    for col_idx in range(1, num_cols + 1):
        col_letter = ws.cell(row=3, column=col_idx).column_letter
        max_len = max(
            (len(str(ws.cell(row=r, column=col_idx).value or "")) for r in range(3, ws.max_row + 1)),
            default=10,
        )
        ws.column_dimensions[col_letter].width = max_len + 4

    buffer = BytesIO()
    wb.save(buffer)
    excel_bytes = buffer.getvalue()

    filename = f"{register_type.replace('/', '-')}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/{register_type:path}", response_model=List[EntryResponse])
def get_entries(
    register_type: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return (
        db.query(DocumentEntry)
        .join(User, User.id == DocumentEntry.user_id)
        .filter(
            User.company_id == current_user["company_id"],
            DocumentEntry.register_type == register_type,
        )
        .all()
    )
