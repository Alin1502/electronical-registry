from fastapi import HTTPException

def require_admin_access(current_user: dict):
    if current_user["is_owner"]:
        return
    if current_user["permission_level"] != "full_access":
        raise HTTPException(status_code=403, detail="Admin access required")

def require_write_access(current_user: dict):
    if current_user["is_owner"]:
        return
    if current_user["permission_level"] not in ("full_access", "read_write"):
        raise HTTPException(status_code=403, detail="Read-only access — write not permitted")