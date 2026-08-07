from typing import List, Optional
from pydantic import BaseModel


class FieldConfigItem(BaseModel):
    key: str
    label: str
    source: str  # "column" | "custom"
    system: bool = False


class RegisterTypeCreate(BaseModel):
    key: str
    display_name: str
    field_config: List[FieldConfigItem]


class RegisterTypeUpdateLabels(BaseModel):
    display_name: Optional[str] = None
    field_labels: Optional[dict[str, str]] = None  # {field_key: new_label}


class RegisterTypeUpdateFields(BaseModel):
    field_config: List[FieldConfigItem]


class RegisterTypeResponse(BaseModel):
    id: int
    key: str
    display_name: str
    field_config: List[FieldConfigItem]
    is_locked: bool
    is_active: bool

    class Config:
        from_attributes = True