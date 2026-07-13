from enum import Enum
from pydantic import BaseModel

class DocumentStatus(str, Enum):
    registered = "registered"
    assigned = "assigned"
    reviewed = "reviewed"
    returned = "returned"
    resubmitted = "resubmitted"
    closed = "closed"

class HistoryCreate(BaseModel):
    status: DocumentStatus
    note: str | None = None