from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database import models

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    try:
        total_cadastros = db.query(models.Cadastro).count()
        total_agendamentos = db.query(models.Agendamento).count()
        total_funcionarios = db.query(models.Funcionario).count()

        return {
            "cadastros": total_cadastros,
            "agendamentos": total_agendamentos,
            "funcionarios": total_funcionarios
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))