from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uvicorn
import json
from datetime import datetime

# IMPORTAÇÕES DO SISTEMA
from app.database.database import get_db, engine
from app.database import models
from app.utils.email import enviar_email_background

# CRIAR TABELAS NO BANCO
models.Base.metadata.create_all(bind=engine)

# INSTÂNCIA DA APLICAÇÃO
app = FastAPI(
    title="Sistema de Agendamentos",
    description="API para gerenciamento de cadastros e agendamentos",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CONFIGURAR CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROTA PRINCIPAL
@app.get("/")
async def root():
    return {
        "message": "Sistema de Agendamentos - API",
        "version": "1.0.0",
        "status": "online",
        "login": "POST /login/ (aceita qualquer email/senha)"
    }

# ROTA DE LOGIN SUPER SIMPLES
@app.post("/login/")
async def login(request: Request):
    try:
        body = await request.body()
        data = json.loads(body)
        email = data.get('email', '')
        password = data.get('password', '')

        if not email or not password:
            return {"success": False, "message": "Email e senha são obrigatórios"}

        return {
            "success": True,
            "message": "Login realizado com sucesso",
            "user": {"id": 1, "nome": "Usuário Demo", "email": email},
            "token": f"demo_token_{email[:5]}"
        }
    except Exception:
        return {"success": False, "message": "Erro interno"}

# LISTAR CADASTROS
@app.get("/cadastros/")
async def listar_cadastros(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return db.query(models.Cadastro).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cadastros/{cadastro_id}")
async def obter_cadastro(cadastro_id: int, db: Session = Depends(get_db)):
    try:
        cadastro = db.query(models.Cadastro).filter(models.Cadastro.id == cadastro_id).first()
        if not cadastro:
            raise HTTPException(status_code=404, detail="Cadastro não encontrado")
        return cadastro
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LISTAR FUNCIONÁRIOS
@app.get("/funcionarios/")
async def listar_funcionarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return db.query(models.Funcionario).filter(models.Funcionario.ativo == True).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CRIAR AGENDAMENTO
@app.post("/api/agendamentos/")
def criar_agendamento(agendamento: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        data_hora = datetime.strptime(f"{agendamento['data']} {agendamento['hora']}", "%Y-%m-%d %H:%M")

        novo_agendamento = models.Agendamento(
            titulo=agendamento["titulo"],
            data_hora=data_hora,
            local=agendamento.get("local", ""),
            duracao_em_minutos=agendamento.get("duracao_em_minutos", 60),
            usuario_id=1,
            profissional_responsavel_id=None,
            observacoes=agendamento.get("descricao", "")
        )

        participantes = db.query(models.Cadastro).filter(
            models.Cadastro.id.in_(agendamento["participantes_ids"])
        ).all()

        novo_agendamento.participantes = participantes

        db.add(novo_agendamento)
        db.commit()
        db.refresh(novo_agendamento)

        for participante in participantes:
            email_destino = (participante.email or "").strip()
            if not email_destino:
                continue

            context = {
                "nome": participante.nome,
                "titulo": novo_agendamento.titulo,
                "data_hora": data_hora.strftime("%d/%m/%Y %H:%M"),
                "local": novo_agendamento.local,
                "descricao": novo_agendamento.observacoes
            }


            enviar_email_background(
                background_tasks,
                destinatario=email_destino,
                assunto="Novo Agendamento",
                template_name="agendamento.html",
                context=context
            )

        return {"msg": "Agendamento criado e e-mails enviados"}

    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao criar agendamento")
    
@app.get("/api/agendamentos/") 
def listar_agendamentos(db: Session = Depends(get_db)):
    try:
        agendamentos = db.query(models.Agendamento).all()
        return agendamentos
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao listar agendamentos")


# STARTUP
@app.on_event("startup")
async def startup_event():
    print("🚀 Sistema de Agendamentos iniciado!")

# EXECUTAR
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
