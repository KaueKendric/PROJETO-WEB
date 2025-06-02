from fastapi import APIRouter, HTTPException, Depends
from typing import List

from sqlalchemy.orm import Session

from app.database import models
from app.database.database import get_db
from app.schemas import agendamento as agendamento_schema

router = APIRouter(
    prefix="/agendamentos",
    tags=["agendamentos"],
)

@router.post("/", response_model=agendamento_schema.Agendamento, status_code=201)
async def criar_agendamento(agendamento: agendamento_schema.Agendamento, db: Session = Depends(get_db)):
    db_agendamento = models.Agendamento(**agendamento.model_dump())
    db.add(db_agendamento)
    db.commit()
    db.refresh(db_agendamento)
    return db_agendamento

@router.get("/", response_model=List[agendamento_schema.Agendamento])
async def listar_agendamentos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    agendamentos = db.query(models.Agendamento).offset(skip).limit(limit).all()
    return agendamentos

@router.get("/{agendamento_id}", response_model=agendamento_schema.Agendamento)
async def obter_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    db_agendamento = db.query(models.Agendamento).filter(models.Agendamento.id == agendamento_id).first()
    if db_agendamento is None:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return db_agendamento