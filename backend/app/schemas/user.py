from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from typing import Any, Dict, Optional
from datetime import datetime
from app.models.enums import SystemRole, AuthProvider

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    dietary_preferences: Optional[Dict[str, Any]] = None
    role: SystemRole = SystemRole.USER

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Password must be 8-128 characters")
    full_name: str = Field(...,min_length=1, max_length=255)
    avatar_url: Optional[str] = None
    dietary_preferences: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra="forbid")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(extra="forbid")

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str = ""
    token_type: str = "bearer"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    model_config = ConfigDict(extra="forbid")

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128, description="New password must be 8-128 characters")

    model_config = ConfigDict(extra="forbid")

class GoogleLoginRequest(BaseModel):
    code: Optional[str] = None
    id_token: Optional[str] = None

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def validate_credential_present(self) -> "GoogleLoginRequest":
        has_code = bool(self.code and self.code.strip())
        has_id_token = bool(self.id_token and self.id_token.strip())
        if not has_code and not has_id_token:
            raise ValueError("Provide either 'code' or 'id_token' for google login.")
        return self

class FacebookLoginRequest(BaseModel):
    access_token: str = Field(...,min_length=1)

    model_config = ConfigDict(extra="forbid")    

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    dietary_preferences: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra="forbid")

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    dietary_preferences: Optional[Dict[str, Any]] = None
    role: SystemRole
    provider: AuthProvider = AuthProvider.LOCAL
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
