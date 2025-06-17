from fastapi import APIRouter, HTTPException, Depends
from typing import List

from sqlalchemy.orm import Session

from backend.database import models
from backend.database.database import get_db
from backend.schemas import funcionario as funcionario_schema

router = APIRouter(
    prefix="/funcionarios",
    tags=["funcionarios"],
)

@router.post("/", response_model=funcionario_schema.Funcionario, status_code=201)
async def criar_funcionario(funcionario: funcionario_schema.Funcionario, db: Session = Depends(get_db)):
    db_funcionario = models.Funcionario(**funcionario.model_dump())
    db.add(db_funcionario)
    db.commit()
    db.refresh(db_funcionario)
    return db_funcionario

@router.get("/", response_model=List[funcionario_schema.Funcionario])
async def listar_funcionarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    funcionarios = db.query(models.Funcionario).offset(skip).limit(limit).all()
    return funcionarios

@router.get("/{funcionario_id}", response_model=funcionario_schema.Funcionario)
async def obter_funcionario(funcionario_id: int, db: Session = Depends(get_db)):
    db_funcionario = db.query(models.Funcionario).filter(models.Funcionario.id == funcionario_id).first()
    if db_funcionario is None:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return db_funcionario

