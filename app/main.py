from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uvicorn
import json

# Imports dos routers e configurações
try:
    from app.routers import agendamento
    from app.database.database import engine, SessionLocal, get_db
    from app.database import models
    print("✅ Imports realizados com sucesso")
except Exception as e:
    print(f"❌ Erro nos imports: {e}")

# ==========================================
# CRIAR TABELAS NO BANCO
# ==========================================
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas/verificadas")
except Exception as e:
    print(f"❌ Erro ao criar tabelas: {e}")

# ==========================================
# CONFIGURAR FASTAPI
# ==========================================
app = FastAPI(
    title="Sistema de Agendamentos",
    description="API para gerenciamento de cadastros e agendamentos",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ==========================================
# CONFIGURAR CORS
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ROTAS BÁSICAS
# ==========================================

@app.get("/")
async def root():
    """Rota raiz da API"""
    return {
        "message": "Sistema de Agendamentos - API",
        "version": "1.0.0",
        "status": "online",
        "login": "POST /login/ (aceita qualquer email/senha)"
    }

@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {"status": "healthy", "timestamp": "2025-06-11T10:00:00Z"}

# ==========================================
# ROTA DE LOGIN SUPER SIMPLES
# ==========================================

@app.post("/login/")
async def login(request: Request):
    """
    Login super simples - aceita qualquer dados
    """
    try:
        # Ler dados da requisição como JSON bruto
        body = await request.body()
        print(f"🔐 Dados brutos recebidos: {body}")
        
        # Tentar fazer parse do JSON
        try:
            data = json.loads(body)
            print(f"🔐 JSON parseado: {data}")
        except json.JSONDecodeError:
            print("❌ Erro ao fazer parse do JSON")
            return {
                "success": False,
                "message": "JSON inválido"
            }
        
        # Extrair email e password
        email = data.get('email', '')
        password = data.get('password', '')
        
        print(f"🔐 Email: '{email}', Password: '{password}'")
        
        # Validação super básica
        if not email:
            return {
                "success": False,
                "message": "Email é obrigatório"
            }
        
        if not password:
            return {
                "success": False,
                "message": "Password é obrigatório"
            }
        
        # Sempre retornar sucesso (modo demo)
        print(f"✅ Login aceito para: {email}")
        
        return {
            "success": True,
            "message": "Login realizado com sucesso",
            "user": {
                "id": 1,
                "nome": "Usuário Demo",
                "email": email
            },
            "token": f"demo_token_{email[:5]}"
        }
        
    except Exception as e:
        print(f"❌ Erro no login: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }

# ==========================================
# ROTA DE LOGOUT
# ==========================================

@app.post("/logout/")
async def logout():
    """Logout do usuário"""
    return {
        "success": True,
        "message": "Logout realizado com sucesso"
    }

# ==========================================
# ROTAS DE CADASTROS
# ==========================================

@app.get("/cadastros/")
async def listar_cadastros(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todos os cadastros"""
    try:
        print(f"📋 Buscando cadastros - skip: {skip}, limit: {limit}")
        cadastros = db.query(models.Cadastro).offset(skip).limit(limit).all()
        print(f"✅ Encontrados {len(cadastros)} cadastros")
        return cadastros
    except Exception as e:
        print(f"❌ Erro ao buscar cadastros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar cadastros: {str(e)}")

@app.get("/cadastros/{cadastro_id}")
async def obter_cadastro(cadastro_id: int, db: Session = Depends(get_db)):
    """Obter cadastro por ID"""
    try:
        print(f"🔍 Buscando cadastro ID: {cadastro_id}")
        cadastro = db.query(models.Cadastro).filter(models.Cadastro.id == cadastro_id).first()
        if not cadastro:
            print(f"❌ Cadastro {cadastro_id} não encontrado")
            raise HTTPException(status_code=404, detail="Cadastro não encontrado")
        print(f"✅ Cadastro {cadastro_id} encontrado: {cadastro.nome}")
        return cadastro
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao buscar cadastro {cadastro_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar cadastro: {str(e)}")

# ==========================================
# ROTAS DE FUNCIONÁRIOS
# ==========================================

@app.get("/funcionarios/")
async def listar_funcionarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todos os funcionários ativos"""
    try:
        funcionarios = db.query(models.Funcionario).filter(
            models.Funcionario.ativo == True
        ).offset(skip).limit(limit).all()
        return funcionarios
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar funcionários: {str(e)}")

# ==========================================
# INCLUIR ROUTER DE AGENDAMENTOS
# ==========================================
try:
    app.include_router(
        agendamento.router,
        prefix="/api",
        tags=["agendamentos"]
    )
    print("✅ Router de agendamentos incluído")
except Exception as e:
    print(f"❌ Erro ao incluir router de agendamentos: {e}")

# ==========================================
# EVENTOS DE STARTUP
# ==========================================
@app.on_event("startup")
async def startup_event():
    """Executado quando a aplicação inicia"""
    print("🚀 Sistema de Agendamentos iniciado!")
    print("📚 Documentação: http://localhost:8000/docs")
    print("🔐 Login: http://localhost:8000/login/")
    print("📋 Cadastros: http://localhost:8000/cadastros/")
    print("📅 Agendamentos: http://localhost:8000/api/agendamentos/")
    print("")
    print("🔑 CREDENCIAIS PARA TESTE:")
    print("   Email: admin@teste.com")
    print("   Senha: 123456")
    print("   (ou qualquer email/senha)")

# ==========================================
# EXECUTAR A APLICAÇÃO
# ==========================================
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )