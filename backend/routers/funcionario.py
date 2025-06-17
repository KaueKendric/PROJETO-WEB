from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.database import models as model
from backend.schemas import funcionario as schema

router = APIRouter(
    prefix="/api/v1/funcionarios",
    tags=["Funcionarios"],
)


@router.post("/", response_model=schema.FuncionarioResponse, status_code=201)
def criar_funcionario(funcionario: schema.FuncionarioCreate, db: Session = Depends(get_db)):
    db_funcionario = model.Funcionario(**funcionario.dict())
    db.add(db_funcionario)
    db.commit()
    db.refresh(db_funcionario)
    return db_funcionario


@router.get("/", response_model=List[schema.FuncionarioResponse])
def listar_funcionarios(db: Session = Depends(get_db)):
    return db.query(model.Funcionario).all()


@router.get("/{funcionario_id}", response_model=schema.FuncionarioResponse)
def obter_funcionario(funcionario_id: int, db: Session = Depends(get_db)):
    funcionario = db.query(model.Funcionario).filter(model.Funcionario.id == funcionario_id).first()
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionario não encontrado")
    return funcionario


@router.delete("/{funcionario_id}", status_code=204)
def deletar_funcionario(funcionario_id: int, db: Session = Depends(get_db)):
    funcionario = db.query(model.Funcionario).filter(model.Funcionario.id == funcionario_id).first()
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionario não encontrado")
    db.delete(funcionario)
    db.commit()
    return