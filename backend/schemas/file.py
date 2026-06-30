from pydantic import BaseModel

class FileResponse(BaseModel):
    id: int
    filename: str
    register_type: str

    class Config:
        from_attributes = True

class DownloadResponse(BaseModel):
    download_url: str

class RemoveResponse(BaseModel):
    status:str
    message:str