from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.enums import AuthProvider, SystemRole
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, user_in: UserCreate) -> User:
        #1. Kiểm tra email trùng
        stmt = select(User).where(User.email == user_in.email)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none() is not None:
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

        #3. Ghi vào database
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)

        return new_user