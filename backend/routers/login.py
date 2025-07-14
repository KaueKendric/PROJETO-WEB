from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import secrets

security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/auth", tags=["Autenticação"])
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None

def generate_token() -> str:
    return secrets.token_urlsafe(32)

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):

    if login_data.email == "admin" and login_data.password == "123456":
        return LoginResponse(
            success=True,
            message="Login realizado com sucesso",
            user={"id": 1, "nome": "Admin", "email": "admin"},
            token=generate_token(),
        )
    else:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")


@router.post("/logout")
async def logout():

    return {"success": True, "message": "Logout realizado com sucesso"}


@router.get("/me")
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    if not credentials:
        raise HTTPException(status_code=401, detail="Token de autenticação necessário")

    return {"id": 1, "nome": "Admin", "email": "admin", "authenticated": True}


@router.get("/check")
async def check_auth():

    return {
        "status": "online",
        "message": "Sistema de autenticação funcionando corretamente",
        "endpoints": {
            "login": "POST /auth/login",
            "logout": "POST /auth/logout",
            "me": "GET /auth/me",
            "check": "GET /auth/check",
        },
    }

@router.post("/login/", response_model=LoginResponse)
async def login_with_slash(login_data: LoginRequest):
    return await login(login_data)

@router.post("/seed/admin")
def seed_admin(db: Session = Depends(get_db)):
    from backend.utils.auth import hash_senha
    from backend.database import models

    ja_existe = db.query(models.Funcionario).filter_by(usuario="admin").first()
    if ja_existe:
        return {"message": "Usuário admin já existe."}

    admin = models.Funcionario(
        nome="Administrador",
        usuario="admin",
        senha=hash_senha("123456"),
        email="admin@admin.com",
        tipo="admin",
        ativo=True
    )
    db.add(admin)
    db.commit()
    return {"message": "Usuário admin criado com sucesso."}
