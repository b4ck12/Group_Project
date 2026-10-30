from passlib.context import CryptContext

#Thiết lập bcrypt với rounds/cost = 12 theo Security Guidelines
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Xác thực mật khẩu người dùng đối chiếu với chuỗi băm."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Tạo hash bcrypt bảo mật từ mật khẩu."""
    return pwd_context.hash(password)

