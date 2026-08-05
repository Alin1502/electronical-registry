from pydantic import BaseModel, EmailStr

class UserAuth(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username:str
    company_name:str
    password: str
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str | None
    avatar_url: str | None
    is_owner: bool
    company_name: str


class ProfileUpdateRequest(BaseModel):
    email: EmailStr | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str