from fastapi import APIRouter, Depends, HTTPException, status ,Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/auth",tags=["auth"])

@router.post("/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng kí tài khoản người dùng",
)
async def register(user_in: UserCreate, db:AsyncSession = Depends(get_db)):
    service = AuthService(db)
    new_user = await service.register(user_in)
    return new_user

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Đăng nhập tài khoản và nhận JWT token",
)
async def login(
    login_data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    #Login và trả về access_token, tự động set refresh_token vào httpOnly
    service = AuthService(db)
    user = await service.authenticate_user(login_data)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    #Lưu refresh token vào cookie httlpOnly
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post(
    "/refresh-token",
    response_model=TokenResponse,
    summary="Xoay vòng JWT Token qua httpOnly Cookie"
)
async def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Không tìm thấy Refresh Token trong cookie",
        )

    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không phải Refresh Token",
        )

    user_id = payload.get("sub")
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại",
        )

    #Tạo cặp token mới
    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)

    #Cập nhật cookie mới
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )

@router.post("/forgot-password")
async def forgot_password(email: str):
    """
    API endpoint skeleton.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/login/google",response_model=UserResponse)
async def login_google(user: UserCreate):
    """
    API endpoint skeleton.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")

