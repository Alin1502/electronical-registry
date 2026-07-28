from datetime import datetime
from pydantic import BaseModel

class FileResponse(BaseModel):
    id: int
    filename: str
    register_type: str
    size_bytes: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DownloadResponse(BaseModel):
    download_url: str

class RemoveResponse(BaseModel):
    status:str
    message:str