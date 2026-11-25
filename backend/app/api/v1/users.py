from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserProfileUpdate, UserResponse
from app.services.user_service import UserService


router = APIRouter(prefix="/users", tags=["users"])

#Trả về thông tin chi tiết của user đã xác thực qua Bearer JWT.
@router.get("/me", response_model=UserResponse, summary="Lấy hồ sơ người dùng hiện tại")
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

#Cập nhật họ tên, avatar_url và dietary_preferences cho user hiện tại.
@router.patch("/me", response_model=UserResponse, summary="Cập nhật hồ sơ cá nhân")
async def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await UserService(db).update_profile(current_user, profile_in)
