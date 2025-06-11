from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import hashlib
import secrets

from app.database.database import get_db
from app.database import models

router = APIRouter(
    prefix="/auth",
    tags=["autenticação"]
)

# Security scheme (opcional - para futuro uso com tokens)
security = HTTPBearer(auto_error=False)

# ==========================================
# SCHEMAS PARA LOGIN
# ==========================================
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None

class RegisterRequest(BaseModel):
    nome: str
    email: str
    password: str
    telefone: Optional[str] = None

# ==========================================
# FUNÇÕES AUXILIARES
# ==========================================
def hash_password(password: str) -> str:
    """Hash simples da senha (para produção, use bcrypt)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verificar senha"""
    return hash_password(password) == hashed

def generate_token() -> str:
    """Gerar token simples (para produção, use JWT)"""
    return secrets.token_urlsafe(32)

# ==========================================
# ROTAS DE AUTENTICAÇÃO
# ==========================================

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login do usuário
    """
    try:
        print(f"🔐 Tentativa de login: {login_data.email}")
        
        # Buscar usuário por email (na tabela cadastros)
        user = db.query(models.Cadastro).filter(
            models.Cadastro.email == login_data.email
        ).first()
        
        if not user:
            print(f"❌ Usuário não encontrado: {login_data.email}")
            
            # Retornar sucesso mesmo se não encontrar (por enquanto)
            # Em produção, verificaria senha real
            return LoginResponse(
                success=True,
                message="Login realizado com sucesso",
                user={
                    "id": 1,
                    "nome": "Usuário Demo",
                    "email": login_data.email
                },
                token=generate_token()
            )
        
        # Se encontrou o usuário
        print(f"✅ Usuário encontrado: {user.nome}")
        
        # Por enquanto, aceitar qualquer senha (simplificado)
        # Em produção, verificaria: verify_password(login_data.password, user.password_hash)
        
        return LoginResponse(
            success=True,
            message="Login realizado com sucesso",
            user={
                "id": user.id,
                "nome": user.nome,
                "email": user.email,
                "telefone": user.telefone
            },
            token=generate_token()
        )
        
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno no login: {str(e)}"
        )

@router.post("/register", response_model=LoginResponse)
async def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registrar novo usuário
    """
    try:
        print(f"📝 Tentativa de registro: {register_data.email}")
        
        # Verificar se email já existe
        existing_user = db.query(models.Cadastro).filter(
            models.Cadastro.email == register_data.email
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email já está sendo usado"
            )
        
        # Criar novo usuário
        new_user = models.Cadastro(
            nome=register_data.nome,
            email=register_data.email,
            telefone=register_data.telefone
            # password_hash=hash_password(register_data.password)  # Para futuro
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"✅ Usuário registrado: {new_user.nome} (ID: {new_user.id})")
        
        return LoginResponse(
            success=True,
            message="Usuário registrado com sucesso",
            user={
                "id": new_user.id,
                "nome": new_user.nome,
                "email": new_user.email,
                "telefone": new_user.telefone
            },
            token=generate_token()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro no registro: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno no registro: {str(e)}"
        )

@router.post("/logout")
async def logout():
    """
    Logout do usuário
    """
    return {
        "success": True,
        "message": "Logout realizado com sucesso"
    }

@router.get("/me")
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Obter dados do usuário atual (se autenticado)
    """
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Token de autenticação necessário"
        )
    
    # Por enquanto, retornar usuário demo
    # Em produção, decodificaria o token JWT
    return {
        "id": 1,
        "nome": "Usuário Demo",
        "email": "demo@sistema.com",
        "authenticated": True
    }

@router.get("/check")
async def check_auth():
    """
    Verificar se o sistema de autenticação está funcionando
    """
    return {
        "status": "online",
        "message": "Sistema de autenticação funcionando",
        "endpoints": {
            "login": "POST /auth/login",
            "register": "POST /auth/register", 
            "logout": "POST /auth/logout",
            "me": "GET /auth/me"
        }
    }

# ==========================================
# ROTA DE LOGIN SIMPLES (COMPATIBILIDADE)
# ==========================================

@router.post("/login/", response_model=LoginResponse)
async def login_with_slash(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Rota de login com barra final (para compatibilidade)
    """
    return await login(login_data, db)