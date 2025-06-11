from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.database.database import get_db
from app.database import models

# Imports dos schemas - usando import seguro
try:
    from app.schemas import agendamento as agendamento_schema
    print("✅ Schemas importados com sucesso")
except ImportError as e:
    print(f"⚠️ Erro ao importar schemas: {e}")
    # Criar schemas básicos inline se não conseguir importar
    from pydantic import BaseModel
    from typing import Optional
    
    class AgendamentoCreate(BaseModel):
        titulo: str
        data: str
        hora: str
        local: Optional[str] = None
        descricao: Optional[str] = None
        participantes_ids: List[int] = []
        tipo_sessao: Optional[str] = "reuniao"
        duracao_em_minutos: Optional[int] = 60
    
    class ParticipanteResponse(BaseModel):
        id: int
        nome: str
        email: str
        
        class Config:
            from_attributes = True
    
    class AgendamentoResponse(BaseModel):
        id: int
        titulo: str
        data_hora: datetime
        tipo_sessao: str
        status: str
        observacoes: Optional[str] = None
        duracao_em_minutos: Optional[int] = None
        local: Optional[str] = None
        participantes: List[ParticipanteResponse] = []
        
        class Config:
            from_attributes = True
    
    # Criar um mock do módulo schema
    class MockSchema:
        AgendamentoCreate = AgendamentoCreate
        AgendamentoResponse = AgendamentoResponse
        ParticipanteResponse = ParticipanteResponse
    
    agendamento_schema = MockSchema()

router = APIRouter(
    prefix="/agendamentos",
    tags=["agendamentos"],
)

@router.get("/", response_model=List[dict])
async def listar_agendamentos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Listar todos os agendamentos - versão segura
    """
    try:
        print(f"📅 Buscando agendamentos - skip: {skip}, limit: {limit}")
        
        # Query básica primeiro (sem relacionamentos)
        agendamentos = db.query(models.Agendamento).offset(skip).limit(limit).all()
        print(f"✅ Encontrados {len(agendamentos)} agendamentos")
        
        # Converter para dicionário manualmente para evitar problemas de serialização
        resultado = []
        for agendamento in agendamentos:
            try:
                # Buscar participantes separadamente para evitar erro de relacionamento
                participantes = []
                if hasattr(agendamento, 'participantes'):
                    try:
                        participantes = [
                            {
                                "id": p.id,
                                "nome": p.nome,
                                "email": p.email
                            }
                            for p in agendamento.participantes
                        ]
                    except Exception as e:
                        print(f"⚠️ Erro ao buscar participantes do agendamento {agendamento.id}: {e}")
                        participantes = []
                
                agendamento_dict = {
                    "id": agendamento.id,
                    "titulo": agendamento.titulo,
                    "data_hora": agendamento.data_hora.isoformat() if agendamento.data_hora else None,
                    "tipo_sessao": agendamento.tipo_sessao,
                    "status": agendamento.status,
                    "observacoes": agendamento.observacoes,
                    "duracao_em_minutos": agendamento.duracao_em_minutos,
                    "local": agendamento.local,
                    "participantes": participantes,
                    "data_criacao": agendamento.data_criacao.isoformat() if hasattr(agendamento, 'data_criacao') and agendamento.data_criacao else None
                }
                resultado.append(agendamento_dict)
                
            except Exception as e:
                print(f"❌ Erro ao processar agendamento {agendamento.id}: {e}")
                # Incluir agendamento básico mesmo com erro
                resultado.append({
                    "id": agendamento.id,
                    "titulo": getattr(agendamento, 'titulo', 'Título não disponível'),
                    "data_hora": agendamento.data_hora.isoformat() if agendamento.data_hora else None,
                    "tipo_sessao": getattr(agendamento, 'tipo_sessao', 'reuniao'),
                    "status": getattr(agendamento, 'status', 'agendado'),
                    "observacoes": getattr(agendamento, 'observacoes', None),
                    "duracao_em_minutos": getattr(agendamento, 'duracao_em_minutos', 60),
                    "local": getattr(agendamento, 'local', None),
                    "participantes": [],
                    "error": f"Erro ao processar: {str(e)}"
                })
        
        return resultado
        
    except Exception as e:
        print(f"❌ Erro ao buscar agendamentos: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar agendamentos: {str(e)}")

@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_agendamento(agendamento_data: dict, db: Session = Depends(get_db)):
    """
    Criar um novo agendamento - versão segura
    """
    try:
        print(f"📝 Dados recebidos para criação: {agendamento_data}")
        
        # Validação básica manual
        if not agendamento_data.get('titulo'):
            raise HTTPException(status_code=400, detail="Título é obrigatório")
        
        if not agendamento_data.get('data'):
            raise HTTPException(status_code=400, detail="Data é obrigatória")
            
        if not agendamento_data.get('hora'):
            raise HTTPException(status_code=400, detail="Hora é obrigatória")
        
        # Combinar data e hora
        try:
            data_str = agendamento_data['data']
            hora_str = agendamento_data['hora']
            data_hora_str = f"{data_str} {hora_str}:00"
            data_hora = datetime.strptime(data_hora_str, "%Y-%m-%d %H:%M:%S")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Formato de data/hora inválido: {str(e)}")
        
        # Criar agendamento
        db_agendamento = models.Agendamento(
            titulo=agendamento_data['titulo'],
            usuario_id=agendamento_data.get('participantes_ids', [1])[0] if agendamento_data.get('participantes_ids') else 1,
            data_hora=data_hora,
            tipo_sessao=agendamento_data.get('tipo_sessao', 'reuniao'),
            status='agendado',
            observacoes=agendamento_data.get('descricao'),
            duracao_em_minutos=agendamento_data.get('duracao_em_minutos', 60),
            local=agendamento_data.get('local')
        )
        
        db.add(db_agendamento)
        db.flush()  # Para obter o ID
        
        print(f"✅ Agendamento criado com ID: {db_agendamento.id}")
        
        # Adicionar participantes se houver
        participantes_ids = agendamento_data.get('participantes_ids', [])
        if participantes_ids:
            try:
                participantes = db.query(models.Cadastro).filter(
                    models.Cadastro.id.in_(participantes_ids)
                ).all()
                
                print(f"👥 Encontrados {len(participantes)} participantes para adicionar")
                
                for participante in participantes:
                    if hasattr(db_agendamento, 'participantes'):
                        db_agendamento.participantes.append(participante)
                        print(f"✅ Participante {participante.nome} adicionado")
                    else:
                        print("⚠️ Relacionamento participantes não disponível")
                        
            except Exception as e:
                print(f"⚠️ Erro ao adicionar participantes: {e}")
                # Continuar mesmo sem participantes
        
        db.commit()
        db.refresh(db_agendamento)
        
        # Retornar resposta manual
        return {
            "id": db_agendamento.id,
            "titulo": db_agendamento.titulo,
            "data_hora": db_agendamento.data_hora.isoformat(),
            "tipo_sessao": db_agendamento.tipo_sessao,
            "status": db_agendamento.status,
            "message": "Agendamento criado com sucesso"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar agendamento: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar agendamento: {str(e)}")

@router.get("/{agendamento_id}")
async def obter_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    """
    Obter um agendamento específico por ID
    """
    try:
        print(f"🔍 Buscando agendamento ID: {agendamento_id}")
        
        db_agendamento = db.query(models.Agendamento).filter(
            models.Agendamento.id == agendamento_id
        ).first()
        
        if db_agendamento is None:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
        # Retornar como dicionário
        resultado = {
            "id": db_agendamento.id,
            "titulo": db_agendamento.titulo,
            "data_hora": db_agendamento.data_hora.isoformat() if db_agendamento.data_hora else None,
            "tipo_sessao": db_agendamento.tipo_sessao,
            "status": db_agendamento.status,
            "observacoes": db_agendamento.observacoes,
            "duracao_em_minutos": db_agendamento.duracao_em_minutos,
            "local": db_agendamento.local,
            "participantes": []
        }
        
        # Tentar buscar participantes
        try:
            if hasattr(db_agendamento, 'participantes'):
                resultado["participantes"] = [
                    {
                        "id": p.id,
                        "nome": p.nome,
                        "email": p.email
                    }
                    for p in db_agendamento.participantes
                ]
        except Exception as e:
            print(f"⚠️ Erro ao buscar participantes: {e}")
        
        return resultado
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao buscar agendamento: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar agendamento: {str(e)}")

@router.get("/test/database")
async def test_database(db: Session = Depends(get_db)):
    """
    Endpoint de teste para verificar se o banco está funcionando
    """
    try:
        # Teste 1: Contar agendamentos
        count_agendamentos = db.query(models.Agendamento).count()
        
        # Teste 2: Contar cadastros  
        count_cadastros = db.query(models.Cadastro).count()
        
        # Teste 3: Verificar tabelas
        result = db.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall() if "sqlite" in str(db.bind.url) else []
        
        return {
            "database_status": "connected",
            "agendamentos_count": count_agendamentos,
            "cadastros_count": count_cadastros,
            "test_timestamp": datetime.now().isoformat(),
            "tables": [r[0] for r in result] if result else "check_manually"
        }
        
    except Exception as e:
        return {
            "database_status": "error",
            "error": str(e),
            "test_timestamp": datetime.now().isoformat()
        }