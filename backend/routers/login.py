from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import secrets

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Auth"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    if request.username == "admin" and request.password == "123456":
        token = secrets.token_hex(16)
        return LoginResponse(
            success=True,
            message="Login bem-sucedido",
            user={"username": "admin"},
            token=token
        )
    else:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")