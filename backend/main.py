from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
from datetime import datetime

from backend.database.database import get_db, engine
from backend.database import models
from backend.utils import auth
from backend.utils.email import enviar_email_background
from backend.routers import agendamento, cadastro, funcionario, login, dashboard

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Agendamentos",
    description="API para gerenciamento de cadastros, agendamentos e dashboard",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://projeto-web-liard.vercel.app",
        "https://projeto-86h5om35i-kaue-kendrics-projects.vercel.app", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(agendamento.router, prefix="/api") 
app.include_router(cadastro.router, prefix="/api")
app.include_router(funcionario.router, prefix="/api")
app.include_router(login.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Sistema de Agendamentos - API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "agendamentos": "/api/agendamentos/",
            "cadastros": "/api/cadastros/",
            "funcionarios": "/api/funcionarios/",
            "login": "/api/auth/login",
            "dashboard": "/api/dashboard/",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/login/", response_model=login.LoginResponse)
async def login_sem_auth(login_data: login.LoginRequest):
    return await login.login(login_data)


@app.get("/funcionarios/")
async def listar_funcionarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        return db.query(models.Funcionario).filter(models.Funcionario.ativo == True).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    print("Sistema de Agendamentos iniciado!")
    print(f"Documentação disponível em: http://localhost:8000/docs")
    print(f"API Agendamentos: http://localhost:8000/api/agendamentos/")

@app.on_event("shutdown")
async def shutdown_event():
    print("Sistema de Agendamentos encerrado")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Erro global: {str(exc)}")
    return HTTPException(status_code=500, detail="Erro interno do servidor")

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True, 
        log_level="info"
    )