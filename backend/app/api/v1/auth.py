from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth",tags=["auth"])

@router.post("/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng kí tài khoản người dùng",
)
async def register(user_in: UserCreate, db:AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user = await service.register(user)
    return user

@router.post("/login/google",response_model=UserResponse)
async def login_google(user: UserCreate):
    """
    API endpoint skeleton.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")
@router.post("/refresh-token")
async def refresh_token():
    """
    API endpoint skeleton.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")
@router.post("/forgot-password")
async def forgot_password(email: str):
    """
    API endpoint skeleton.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")
