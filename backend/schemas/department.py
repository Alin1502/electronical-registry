from pydantic import BaseModel

class DepartmentCreate(BaseModel):
    name: str

class DepartmentResponse(DepartmentCreate):
    id: int

    class Config:
        from_attributes = True