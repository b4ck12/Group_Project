from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserProfileUpdate

class UserService:
    def __init__(self, db:AsyncSession):
        self.user_repo = UserRepository(db)

    async def update_profile(
        self,
        current_user: User,
        profile_in: UserProfileUpdate,
    ) -> User:
        """Cập nhật họ tên, avatar URL hoặc sở thích ăn uống của user hiện tại."""
        updates = profile_in.model_dump(exclude_unset=True)
        if not updates:
            return current_user

        if "full_name" in updates:
            cleaned_name = (updates["full_name"] or "").strip()
            if not cleaned_name:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="Không để trống họ tên."
                )
            updates["full_name"] = cleaned_name
        return await self.user_repo.update(current_user, updates)