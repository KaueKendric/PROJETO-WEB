from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(
    prefix="/login",
    tags=["auth"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/")
async def login(request: LoginRequest):
    
    admin_username = "admin"
    admin_password = "123456"

    if request.username == admin_username and request.password == admin_password:
        return {"message": "Login bem-sucedido"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
        )