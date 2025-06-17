from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
from datetime import datetime

# IMPORTAÇÕES DO SISTEMA
from backend.database.database import get_db, engine
from backend.database import models
from backend.utils import auth
from backend.utils.email import enviar_email_background
from backend.routers import agendamento, cadastro, funcionario, login, dashboard

# ✅ Criação das tabelas no banco
models.Base.metadata.create_all(bind=engine)

# ✅ Instância da aplicação FastAPI
app = FastAPI(
    title="Sistema de Agendamentos",
    description="API para gerenciamento de cadastros, agendamentos e dashboard",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ✅ Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Inclusão dos routers (organizado e sem duplicação)
app.include_router(agendamento.router, prefix="/api")  # Para usar /api/agendamentos/
app.include_router(cadastro.router)
app.include_router(funcionario.router)
app.include_router(login.router)
app.include_router(dashboard.router)

# ✅ Rota principal
@app.get("/")
async def root():
    return {
        "message": "Sistema de Agendamentos - API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "agendamentos": "/api/agendamentos/",
            "cadastros": "/cadastros/",
            "funcionarios": "/funcionarios/",
            "login": "/auth/login",
            "dashboard": "/dashboard/",
            "docs": "/docs"
        }
    }

# ✅ Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# ✅ Nova rota para /login/ que chama a função de login do router /auth
@app.post("/login/", response_model=login.LoginResponse)
async def login_sem_auth(login_data: login.LoginRequest):
    return await login.login(login_data)

# ✅ Listagem de cadastros (mantido para compatibilidade)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Listagem de funcionários (mantido para compatibilidade)
@app.get("/funcionarios/")
async def listar_funcionarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return db.query(models.Funcionario).filter(models.Funcionario.ativo == True).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ⚠️ REMOVIDO: Rotas duplicadas de agendamento
# As rotas de agendamento agora estão todas centralizadas no router /api/agendamentos/
# Removidas as rotas duplicadas que estavam causando conflito

# ✅ Eventos de startup e shutdown
@app.on_event("startup")
async def startup_event():
    print("🚀 Sistema de Agendamentos iniciado!")
    print(f"📖 Documentação disponível em: http://localhost:8000/docs")
    print(f"🔗 API Agendamentos: http://localhost:8000/api/agendamentos/")

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Sistema de Agendamentos encerrado")

# ✅ Handler global para erros
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"❌ Erro global: {str(exc)}")
    return HTTPException(status_code=500, detail="Erro interno do servidor")

# ✅ Execução da aplicação
if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True, 
        log_level="info"
    )