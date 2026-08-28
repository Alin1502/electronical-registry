from datetime import datetime
from pydantic import BaseModel

class FileResponse(BaseModel):
    id: int
    filename: str
    register_type: str
    size_bytes: int
    uploaded_at: datetime
    entry_id: int | None = None

    class Config:
        from_attributes = True

class DownloadResponse(BaseModel):
    download_url: str

class RemoveResponse(BaseModel):
    status:str
    message:str