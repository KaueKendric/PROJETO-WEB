from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.models import cadastro as model
from backend.schemas import cadastro as schema

router = APIRouter(
    prefix="/api/v1/cadastros",
    tags=["Cadastros"],
)


@router.post("/", response_model=schema.CadastroResponse, status_code=201)
def criar_cadastro(cadastro: schema.CadastroCreate, db: Session = Depends(get_db)):
    db_cadastro = model.Cadastro(**cadastro.dict())
    db.add(db_cadastro)
    db.commit()
    db.refresh(db_cadastro)
    return db_cadastro


@router.get("/", response_model=List[schema.CadastroResponse])
def listar_cadastros(db: Session = Depends(get_db)):
    return db.query(model.Cadastro).all()


@router.get("/{cadastro_id}", response_model=schema.CadastroResponse)
def obter_cadastro(cadastro_id: int, db: Session = Depends(get_db)):
    cadastro = db.query(model.Cadastro).filter(model.Cadastro.id == cadastro_id).first()
    if not cadastro:
        raise HTTPException(status_code=404, detail="Cadastro não encontrado")
    return cadastro


@router.delete("/{cadastro_id}", status_code=204)
def deletar_cadastro(cadastro_id: int, db: Session = Depends(get_db)):
    cadastro = db.query(model.Cadastro).filter(model.Cadastro.id == cadastro_id).first()
    if not cadastro:
        raise HTTPException(status_code=404, detail="Cadastro não encontrado")
    db.delete(cadastro)
    db.commit()
    return