from fastapi import APIRouter, HTTPException
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_profile():
    """
    API endpoint skeleton for current user profile.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.patch("/me", response_model=UserResponse)
async def update_profile():
    """
    API endpoint skeleton for updating current user profile.
    """
    raise HTTPException(status_code=501, detail="Not Implemented")
