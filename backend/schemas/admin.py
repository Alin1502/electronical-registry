from datetime import datetime

from pydantic import BaseModel


class RecentActivityItem(BaseModel):
    register_type: str
    nr_inregistrare: str
    rezumat: str
    timestamp: str


class AdminStatsResponse(BaseModel):
    total_entries: int
    recent_entries_last_7_days: int
    pending_validation: int
    registry_count: int
    operator_count: int
    department_count: int
    total_storage_bytes: int
    recent_activity: list[RecentActivityItem]