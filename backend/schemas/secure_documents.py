from pydantic import BaseModel, Field


class SecureDocumentUploadResponse(BaseModel):
    file_id: int
    filename: str
    access_code: str = Field(..., description="Share this code with users who need access")


class SecureDocumentAccessRequest(BaseModel):
    code: str