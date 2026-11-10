from beanie import PydanticObjectId
from pydantic import Field,BaseModel,EmailStr

class UserPublic(BaseModel):
    id: str
    name: str
    email: str

class RegisterRequest(BaseModel):
    name:str=Field(...,min_length=3,max_length=15)
    email:EmailStr
    password:str = Field(..., min_length=8, max_length=128)

class RegisterResponse(BaseModel):
    message: str
    user: UserPublic

class LoginUser(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    message:str
    user:UserPublic
