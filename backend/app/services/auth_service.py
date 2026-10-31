from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.enums import AuthProvider, SystemRole
from app.schemas.user import UserCreate, LoginRequest
from app.core.security import get_password_hash, verify_password
from app.repositories.user_repository import UserRepository

class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)

    async def register(self, user_in: UserCreate) -> User:
        #1. Kiểm tra email trùng
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã được đăng kí",
            )

        #2. Khởi tạo đối tượng User mới
        new_user = User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            avatar_url=user_in.avatar_url,
            provider=AuthProvider.LOCAL,
            role=SystemRole.USER,
        )

        #3. Lưu qua Repository
        return await self.user_repo.create(new_user)

    
    async def authenticate_user(self, login_data: LoginRequest) -> User:
        """Xác thực login (tìm user theo email , so password thô với hash)"""
        user = await self.user_repo.get_by_email(login_data.email)

        if not user or not user.password_hash or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email hoặc mật khẩu không đúng",
            )
        return user