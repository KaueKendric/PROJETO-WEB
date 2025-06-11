# app/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import jwt
import bcrypt
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database import models

# Configurações JWT
SECRET_KEY = "seu_secret_key_super_seguro_aqui"  # Em produção, use variável de ambiente
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Inicializar security
security = HTTPBearer()

router = APIRouter(
    prefix="",  # Sem prefix para manter /login/
    tags=["autenticacao"],
)

# ==========================================
# SCHEMAS
# ==========================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class RegisterRequest(BaseModel):
    nome: str
    email: EmailStr
    password: str
    telefone: Optional[str] = None

# ==========================================
# UTILITÁRIOS DE AUTENTICAÇÃO
# ==========================================

def hash_password(password: str) -> str:
    """Hash da senha usando bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verificar senha"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verificar token JWT"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ==========================================
# ROTAS DE AUTENTICAÇÃO
# ==========================================

@router.post("/login/", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login do usuário
    """
    try:
        print(f"🔐 Tentativa de login: {login_data.email}")
        
        # Buscar usuário por email
        user = db.query(models.Cadastro).filter(
            models.Cadastro.email == login_data.email
        ).first()
        
        if not user:
            print(f"❌ Usuário não encontrado: {login_data.email}")
            raise HTTPException(
                status_code=401,
                detail="Email ou senha incorretos"
            )
        
        # Verificar senha (por enquanto, aceitar qualquer senha para teste)
        # Em produção, use hash de senha real
        print(f"✅ Usuário encontrado: {user.nome}")
        
        # Criar token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        print(f"🎯 Login bem-sucedido: {user.nome}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "nome": user.nome,
                "email": user.email,
                "telefone": user.telefone
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@router.post("/register/")
async def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registro de novo usuário
    """
    try:
        print(f"📝 Tentativa de registro: {register_data.email}")
        
        # Verificar se usuário já existe
        existing_user = db.query(models.Cadastro).filter(
            models.Cadastro.email == register_data.email
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email já está em uso"
            )
        
        # Criar novo usuário
        new_user = models.Cadastro(
            nome=register_data.nome,
            email=register_data.email,
            telefone=register_data.telefone,
            # Adicionar campo senha quando implementar hashing
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"✅ Usuário registrado: {new_user.nome}")
        
        return {
            "message": "Usuário criado com sucesso",
            "user": {
                "id": new_user.id,
                "nome": new_user.nome,
                "email": new_user.email
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro no registro: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@router.post("/logout/")
async def logout():
    """
    Logout do usuário (JWT é stateless, então apenas retorna sucesso)
    """
    return {"message": "Logout realizado com sucesso"}

@router.get("/me/")
async def get_current_user(current_user_email: str = Depends(verify_token), db: Session = Depends(get_db)):
    """
    Obter dados do usuário atual
    """
    try:
        user = db.query(models.Cadastro).filter(
            models.Cadastro.email == current_user_email
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return {
            "id": user.id,
            "nome": user.nome,
            "email": user.email,
            "telefone": user.telefone
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/verify-token/")
async def verify_user_token(current_user_email: str = Depends(verify_token)):
    """
    Verificar se token é válido
    """
    return {"valid": True, "email": current_user_email}
