from pydantic import BaseModel

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