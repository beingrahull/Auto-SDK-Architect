from fastapi import HTTPException, Response, APIRouter

from app.models.user import User
from app.schemas.auth import (
    RegisterRequest, RegisterResponse, UserPublic,
    LoginUser, LoginResponse,
)
from app.services.user_service import find_by_email, authentication
from app.utils.security import hash_password, generate_token


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def registeruser(payload: RegisterRequest):
    existing_user = await find_by_email(payload.email)
    if existing_user:
        raise HTTPException(status_code=409, detail="User exists. Try logging in")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    await user.insert()

    return {
        "message": "Account registered",
        "user": UserPublic(
            id=str(user.id),
            name=user.name,
            email=user.email,
        ),
    }


@router.post("/login", response_model=LoginResponse, status_code=201)
async def login(payload: LoginUser, response: Response):
    
    user = await authentication(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = generate_token(str(user.id))
    response.set_cookie(
        key="AccessToken",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 7,
    )

    return {
        "message": "Login Successful",
        "user": UserPublic(
            id=str(user.id),
            name=user.name,
            email=user.email,
        ),
    }


