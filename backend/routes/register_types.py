from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from core.permissions import require_admin_access
from models.register_type import RegisterType
from models.entry import DocumentEntry
from schemas.register_type import (
    RegisterTypeCreate,
    RegisterTypeUpdateFields,
    RegisterTypeUpdateLabels,
    RegisterTypeResponse,
)

router = APIRouter()

SYSTEM_FIELD_KEYS = {"nr_inregistrare", "cod"}


def _validate_field_config(field_config: list) -> None:
    keys = [field.key for field in field_config]
    if len(keys) != len(set(keys)):
        raise HTTPException(status_code=400, detail="Field keys must be unique")

    if not SYSTEM_FIELD_KEYS.issubset(set(keys)):
        raise HTTPException(status_code=400, detail="Nr Inregistrare and Cod are required system fields")


@router.get("/", response_model=list[RegisterTypeResponse])
def list_register_types(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = db.query(RegisterType).filter(RegisterType.company_id == current_user["company_id"])
    if not include_inactive:
        query = query.filter(RegisterType.is_active.is_(True))
    return query.order_by(RegisterType.created_at).all()


@router.post("/", response_model=RegisterTypeResponse)
def create_register_type(
    payload: RegisterTypeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    require_admin_access(current_user)

    existing = (
        db.query(RegisterType)
        .filter(RegisterType.company_id == current_user["company_id"], RegisterType.key == payload.key)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A register with this key already exists")

    _validate_field_config(payload.field_config)

    register_type = RegisterType(
        company_id=current_user["company_id"],
        key=payload.key,
        display_name=payload.display_name,
        field_config=[f.model_dump() for f in payload.field_config],
        is_locked=False,
        is_active=True,
    )
    db.add(register_type)
    db.commit()
    db.refresh(register_type)
    return register_type


@router.post("/{register_type_id}/lock", response_model=RegisterTypeResponse)
def lock_register_type(
    register_type_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Confirms the field configuration permanently. Fields cannot be added/removed after this."""
    require_admin_access(current_user)

    register_type = (
        db.query(RegisterType)
        .filter(RegisterType.id == register_type_id, RegisterType.company_id == current_user["company_id"])
        .first()
    )
    if not register_type:
        raise HTTPException(status_code=404, detail="Register type not found")
    if register_type.is_locked:
        raise HTTPException(status_code=400, detail="Register type is already locked")

    register_type.is_locked = True
    db.commit()
    db.refresh(register_type)
    return register_type


@router.put("/{register_type_id}/labels", response_model=RegisterTypeResponse)
def update_register_type_labels(
    register_type_id: int,
    payload: RegisterTypeUpdateLabels,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Cosmetic-only: renames the register or individual field labels. Works whether locked or not."""
    require_admin_access(current_user)

    register_type = (
        db.query(RegisterType)
        .filter(RegisterType.id == register_type_id, RegisterType.company_id == current_user["company_id"])
        .first()
    )
    if not register_type:
        raise HTTPException(status_code=404, detail="Register type not found")

    if payload.display_name is not None:
        register_type.display_name = payload.display_name

    if payload.field_labels:
        updated_config = list(register_type.field_config)
        for field in updated_config:
            if field["key"] in payload.field_labels:
                field["label"] = payload.field_labels[field["key"]]
        register_type.field_config = updated_config

    db.commit()
    db.refresh(register_type)
    return register_type


@router.put("/{register_type_id}/fields", response_model=RegisterTypeResponse)
def update_register_type_fields(
    register_type_id: int,
    payload: RegisterTypeUpdateFields,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Draft-only structural update: replaces field_config while register type is unlocked."""
    require_admin_access(current_user)

    register_type = (
        db.query(RegisterType)
        .filter(RegisterType.id == register_type_id, RegisterType.company_id == current_user["company_id"])
        .first()
    )
    if not register_type:
        raise HTTPException(status_code=404, detail="Register type not found")
    if register_type.is_locked:
        raise HTTPException(status_code=400, detail="Register type is locked; fields can no longer be changed")

    _validate_field_config(payload.field_config)
    register_type.field_config = [f.model_dump() for f in payload.field_config]

    db.commit()
    db.refresh(register_type)
    return register_type


@router.delete("/{register_type_id}")
def delete_register_type(
    register_type_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Soft-delete only. Existing entries/files under this register_type are untouched."""
    require_admin_access(current_user)

    register_type = (
        db.query(RegisterType)
        .filter(RegisterType.id == register_type_id, RegisterType.company_id == current_user["company_id"])
        .first()
    )
    if not register_type:
        raise HTTPException(status_code=404, detail="Register type not found")

    register_type.is_active = False
    db.commit()
    return {"detail": "Register type archived"}