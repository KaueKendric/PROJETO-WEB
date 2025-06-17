from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from backend.database.database import get_db, engine
from backend.database import models

from backend.routers import agendamento, cadastro, funcionario, login, dashboard

# ✅ Carregar variáveis de ambiente
load_dotenv()

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
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Prefixo base da API
API_PREFIX = "/api/v1"

# ✅ Inclusão dos routers organizados
app.include_router(agendamento.router, prefix=API_PREFIX + "/agendamentos")
app.include_router(cadastro.router, prefix=API_PREFIX + "/cadastro")
app.include_router(funcionario.router, prefix=API_PREFIX + "/funcionario")
app.include_router(login.router, prefix=API_PREFIX + "/auth")
app.include_router(dashboard.router, prefix=API_PREFIX + "/dashboard")

# ✅ Rota principal
@app.get("/")
async def root():
    return {
        "message": "Sistema de Agendamentos - API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "api_base": API_PREFIX
        }
    }

# ✅ Healthcheck
@app.get("/health")
async def health_check():
    return {"status": "ok"}