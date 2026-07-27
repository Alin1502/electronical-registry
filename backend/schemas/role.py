from pydantic import BaseModel
from typing import Literal

PermissionLevel = Literal["full_access", "read_write", "read"]


class RoleCreate(BaseModel):
    name: str
    permission_level: PermissionLevel = "read"

class RoleResponse(BaseModel):
    id: int
    name: str
    permission_level: PermissionLevel

    class Config:
        from_attributes = True