from pydantic import EmailStr,Field
from beanie import Document
from pymongo import IndexModel
from datetime import datetime,timezone

class User(Document):
    name:str=Field(...,min_length=3,max_length=15)
    email:EmailStr
    password_hash:str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            IndexModel("email", unique=True),
        ]