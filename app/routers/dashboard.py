from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.database import get_db
from app.database import models

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

# ✅ Resumo geral
@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    try:
        total_cadastros = db.query(models.Cadastro).count()
        total_agendamentos = db.query(models.Agendamento).count()

        return {
            "cadastros": total_cadastros,
            "agendamentos": total_agendamentos
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao buscar dados do dashboard")


# ✅ Estatísticas de atividade
@router.get("/atividade")
def get_atividade(db: Session = Depends(get_db)):
    try:
        hoje = datetime.now().date()
        semana_inicio = hoje - timedelta(days=hoje.weekday())
        mes_inicio = hoje.replace(day=1)

        atividades_hoje = (
            db.query(models.Agendamento).filter(models.Agendamento.data_criacao >= hoje).count() +
            db.query(models.Cadastro).filter(models.Cadastro.data_criacao >= hoje).count()
        )

        atividades_semana = (
            db.query(models.Agendamento).filter(models.Agendamento.data_criacao >= semana_inicio).count() +
            db.query(models.Cadastro).filter(models.Cadastro.data_criacao >= semana_inicio).count()
        )

        usuarios_ativos_mes = (
            db.query(models.Cadastro).filter(models.Cadastro.data_criacao >= mes_inicio).count()
        )

        return {
            "hoje": atividades_hoje,
            "semana": atividades_semana,
            "ativos_mes": usuarios_ativos_mes
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao buscar atividades")
