from pydantic import BaseModel
from typing import Optional

class EntryCreate(BaseModel):
    register_type: str
    nr_inregistrare: str
    cod: str
    iesire_intrare: str
    nr_data_emitent: str
    nr_data_destinator: str
    rezumat: str
    repartizare_dpt: str
    mod_rezolvare: str
    nr_pag_anexe: str
    file_id: Optional[int] = None

class EntryResponse(EntryCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True