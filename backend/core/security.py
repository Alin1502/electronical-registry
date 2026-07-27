import os
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=2)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, os.getenv("JWT_SECRET"), algorithm="HS256")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        username = payload.get("sub")
        user_id = payload.get("id")
        company_id = payload.get("company_id")
        company_name = payload.get("company_name")
        is_owner = payload.get("is_owner", False)
        permission_level = payload.get("permission_level", "read")
        if username is None or user_id is None or company_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "username": username,
            "id": user_id,
            "company_id": company_id,
            "company_name": company_name,
            "is_owner": is_owner,
            "permission_level": permission_level,
        }
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

