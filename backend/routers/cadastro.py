from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

from sqlalchemy.orm import Session

from backend.database import models
from backend.database.database import get_db
from backend.schemas import cadastro as cadastro_schema

router = APIRouter(
    prefix="/cadastros",
    tags=["cadastros"],
)

@router.post("/", response_model=cadastro_schema.Cadastro, status_code=201)
async def criar_cadastro(cadastro: cadastro_schema.Cadastro, db: Session = Depends(get_db)):
    db_cadastro = models.Cadastro(**cadastro.model_dump())
    db.add(db_cadastro)
    db.commit()
    db.refresh(db_cadastro)
    return db_cadastro

@router.get("/", response_model=List[cadastro_schema.Cadastro])
async def listar_cadastros(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    nome: Optional[str] = None,
    email: Optional[str] = None,
    telefone: Optional[str] = None,
):
    query = db.query(models.Cadastro)
    if nome:
        query = query.filter(models.Cadastro.nome.contains(nome))
    if email:
        query = query.filter(models.Cadastro.email.contains(email))
    if telefone:
        query = query.filter(models.Cadastro.telefone.contains(telefone))
    cadastros = query.offset(skip).limit(limit).all()
    return cadastros

@router.get("/{cadastro_id}", response_model=cadastro_schema.Cadastro)
async def obter_cadastro(cadastro_id: int, db: Session = Depends(get_db)):
    db_cadastro = db.query(models.Cadastro).filter(models.Cadastro.id == cadastro_id).first()
    if db_cadastro is None:
        raise HTTPException(status_code=404, detail="Cadastro não encontrado")
    return db_cadastro