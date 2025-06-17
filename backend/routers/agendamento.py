from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.database.database import get_db
from backend.models import agendamento as model
from backend.schemas import agendamento as schema

router = APIRouter(
    prefix="/api/v1/agendamentos",
    tags=["Agendamentos"],
)


@router.post("/", response_model=schema.AgendamentoResponse, status_code=201)
def criar_agendamento(agendamento: schema.AgendamentoCreate, db: Session = Depends(get_db)):
    db_agendamento = model.Agendamento(**agendamento.dict())
    db.add(db_agendamento)
    db.commit()
    db.refresh(db_agendamento)
    return db_agendamento


@router.get("/", response_model=List[schema.AgendamentoResponse])
def listar_agendamentos(db: Session = Depends(get_db)):
    return db.query(model.Agendamento).all()


@router.get("/{agendamento_id}", response_model=schema.AgendamentoResponse)
def obter_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    agendamento = db.query(model.Agendamento).filter(model.Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return agendamento


@router.delete("/{agendamento_id}", status_code=204)
def deletar_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    agendamento = db.query(model.Agendamento).filter(model.Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    db.delete(agendamento)
    db.commit()
    return