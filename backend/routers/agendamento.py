from fastapi import APIRouter, HTTPException, Depends, status, Query, BackgroundTasks
from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, and_, or_
from backend.utils.email import enviar_email_background

from backend.database.database import get_db
from backend.database import models
from backend.schemas import agendamento as agendamento_schema

router = APIRouter(
    prefix="/agendamentos",
    tags=["agendamentos"],
)

from pydantic import BaseModel

class AgendamentoPaginado(BaseModel):
    agendamentos: List[Dict[str, Any]]
    total: int
    pagina: int
    totalPaginas: int
    limit: int
    skip: int
    filtro: str
    temProxima: bool
    temAnterior: bool

@router.get("/", response_model=AgendamentoPaginado)
async def listar_agendamentos(
    limit: int = Query(6, ge=1, le=50, description="Número de itens por página"),
    skip: int = Query(0, ge=0, description="Número de itens para pular"),
    filtro: str = Query("todos", description="Filtro a aplicar"),
    db: Session = Depends(get_db)
):
    """
    Listar agendamentos com paginação e filtros - Versão adaptada
    """
    try:
        pagina = (skip // limit) + 1
        print(f"📅 Buscando agendamentos - Página: {pagina}, Limit: {limit}, Skip: {skip}, Filtro: {filtro}")
        
        query = db.query(models.Agendamento).options(joinedload(models.Agendamento.participantes))
        count_query = db.query(func.count(models.Agendamento.id))
        
        filtros_aplicados = aplicar_filtros_agendamento(query, count_query, filtro)
        query = filtros_aplicados["query"]
        count_query = filtros_aplicados["count_query"]
        
        total = count_query.scalar()
        
        agendamentos = (
            query
            .order_by(models.Agendamento.data_hora.desc(), models.Agendamento.data_criacao.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        agendamentos_processados = []
        for agendamento in agendamentos:
            try:
                participantes = []
                try:
                    participantes = [
                        {
                            "id": p.id,
                            "nome": p.nome,
                            "email": p.email,
                            "telefone": getattr(p, 'telefone', None)
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
                    "data_criacao": agendamento.data_criacao.isoformat() if agendamento.data_criacao else None,
                    "data_atualizacao": agendamento.data_atualizacao.isoformat() if agendamento.data_atualizacao else None,
                    "participantes_count": len(participantes),
                    "duracao_formatada": agendamento.duracao_formatada,
                    "status_cor": agendamento.status_cor
                }
                agendamentos_processados.append(agendamento_dict)
                
            except Exception as e:
                print(f"❌ Erro ao processar agendamento {agendamento.id}: {e}")
                agendamentos_processados.append({
                    "id": agendamento.id,
                    "titulo": getattr(agendamento, 'titulo', 'Título não disponível'),
                    "data_hora": agendamento.data_hora.isoformat() if agendamento.data_hora else None,
                    "tipo_sessao": getattr(agendamento, 'tipo_sessao', 'reuniao'),
                    "status": getattr(agendamento, 'status', 'agendado'),
                    "observacoes": getattr(agendamento, 'observacoes', None),
                    "duracao_em_minutos": getattr(agendamento, 'duracao_em_minutos', 60),
                    "local": getattr(agendamento, 'local', None),
                    "participantes": [],
                    "participantes_count": 0,
                    "error": f"Erro ao processar: {str(e)}"
                })
        
        total_paginas = (total + limit - 1) // limit 
        
        print(f"✅ Retornando {len(agendamentos_processados)} agendamentos de {total} total")
        
        return AgendamentoPaginado(
            agendamentos=agendamentos_processados,
            total=total,
            pagina=pagina,
            totalPaginas=total_paginas,
            limit=limit,
            skip=skip,
            filtro=filtro,
            temProxima=pagina < total_paginas,
            temAnterior=pagina > 1
        )
        
    except Exception as e:
        print(f"❌ Erro ao buscar agendamentos: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar agendamentos: {str(e)}")

def aplicar_filtros_agendamento(query, count_query, filtro: str):
    """
    Aplicar filtros nas queries baseado no tipo de filtro - Adaptado para seu modelo
    """
    hoje = datetime.now().date()
    inicio_hoje = datetime.combine(hoje, datetime.min.time())
    fim_hoje = datetime.combine(hoje + timedelta(days=1), datetime.min.time())
    
    dias_desde_domingo = hoje.weekday() + 1 if hoje.weekday() != 6 else 0
    inicio_semana = datetime.combine(hoje - timedelta(days=dias_desde_domingo), datetime.min.time())
    
    inicio_mes = datetime.combine(hoje.replace(day=1), datetime.min.time())
    
    if filtro == "hoje":
        filtro_condicao = and_(
            models.Agendamento.data_hora >= inicio_hoje,
            models.Agendamento.data_hora < fim_hoje
        )
    elif filtro == "semana":
        filtro_condicao = models.Agendamento.data_hora >= inicio_semana
    elif filtro == "mes":
        filtro_condicao = models.Agendamento.data_hora >= inicio_mes
    elif filtro in ["reuniao", "consulta", "evento"]:
        filtro_condicao = models.Agendamento.tipo_sessao == filtro
    elif filtro == "agendado":
        filtro_condicao = models.Agendamento.status == "agendado"
    elif filtro == "confirmado":
        filtro_condicao = models.Agendamento.status == "confirmado"
    elif filtro == "realizado":
        filtro_condicao = models.Agendamento.status == "realizado"
    elif filtro == "cancelado":
        filtro_condicao = models.Agendamento.status == "cancelado"
    else: 
        filtro_condicao = None
    
    if filtro_condicao is not None:
        query = query.filter(filtro_condicao)
        count_query = count_query.filter(filtro_condicao)
    
    return {"query": query, "count_query": count_query}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_agendamento(agendamento_data: agendamento_schema.AgendamentoCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    
    try:
        print(f"📝 Dados recebidos para criação: {agendamento_data.dict()}")
        
       
        try:
            data_hora_str = f"{agendamento_data.data} {agendamento_data.hora}:00"
            data_hora = datetime.strptime(data_hora_str, "%Y-%m-%d %H:%M:%S")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Formato de data/hora inválido: {str(e)}")
        
       
        db_agendamento = models.Agendamento(
            titulo=agendamento_data.titulo,
            usuario_id=agendamento_data.participantes_ids[0] if agendamento_data.participantes_ids else 1,
            data_hora=data_hora,
            tipo_sessao=agendamento_data.tipo_sessao,
            status='agendado',
            observacoes=agendamento_data.descricao,
            duracao_em_minutos=agendamento_data.duracao_em_minutos,
            local=agendamento_data.local
        )
        
        db.add(db_agendamento)
        db.flush()  
        
        print(f"✅ Agendamento criado com ID: {db_agendamento.id}")
        
       
        if agendamento_data.participantes_ids:
            try:
                participantes = db.query(models.Cadastro).filter(
                    models.Cadastro.id.in_(agendamento_data.participantes_ids)
                ).all()
                
                print(f"👥 Encontrados {len(participantes)} participantes para adicionar")
                
                for participante in participantes:
                    db_agendamento.participantes.append(participante)
                    print(f"✅ Participante {participante.nome} adicionado")
                        
            except Exception as e:
                print(f"⚠️ Erro ao adicionar participantes: {e}")
        
        db.commit()
        db.refresh(db_agendamento)
        for participante in participantes:
            email_destino = (participante.email or "").strip()
            if not email_destino:
                continue
            context = {
                "nome": participante.nome,
                "titulo": db_agendamento.titulo,
                "data_hora": data_hora.strftime("%d/%m/%Y %H:%M"),
                "local": db_agendamento.local,
                "descricao": db_agendamento.observacoes              
            }
            enviar_email_background(
                background_tasks,
                destinatario=email_destino,
                assunto="Novo Agendamento",
                template_name="agendamento.html",
                context=context
                
            )
        return {"msg": "Agendamento criado e e-mails enviados"}
        return agendamento_schema.AgendamentoResponse.from_orm(db_agendamento)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar agendamento: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar agendamento: {str(e)}")

@router.get("/{agendamento_id}", response_model=agendamento_schema.AgendamentoResponse)
async def obter_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    """
    Obter um agendamento específico por ID - Mantendo sua lógica
    """
    try:
        print(f"🔍 Buscando agendamento ID: {agendamento_id}")
        
        db_agendamento = db.query(models.Agendamento).options(
            joinedload(models.Agendamento.participantes)
        ).filter(
            models.Agendamento.id == agendamento_id
        ).first()
        
        if db_agendamento is None:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
        return agendamento_schema.AgendamentoResponse.from_orm(db_agendamento)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro ao buscar agendamento: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar agendamento: {str(e)}")

@router.put("/{agendamento_id}", response_model=agendamento_schema.AgendamentoResponse)
async def atualizar_agendamento(
    agendamento_id: int, 
    agendamento_data: agendamento_schema.AgendamentoUpdate, 
    db: Session = Depends(get_db)
):
   
    try:
        db_agendamento = db.query(models.Agendamento).filter(
            models.Agendamento.id == agendamento_id
        ).first()
        
        if not db_agendamento:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
        dados_atualizacao = agendamento_data.dict(exclude_unset=True)
        
        if 'data' in dados_atualizacao and 'hora' in dados_atualizacao:
            try:
                data_hora_str = f"{dados_atualizacao['data']} {dados_atualizacao['hora']}:00"
                dados_atualizacao['data_hora'] = datetime.strptime(data_hora_str, "%Y-%m-%d %H:%M:%S")
                del dados_atualizacao['data']
                del dados_atualizacao['hora']
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Formato de data/hora inválido: {str(e)}")
               
        if 'descricao' in dados_atualizacao:
            dados_atualizacao['observacoes'] = dados_atualizacao.pop('descricao')
        
        if 'participantes_ids' in dados_atualizacao:
            participantes_ids = dados_atualizacao.pop('participantes_ids')
            if participantes_ids:
                participantes = db.query(models.Cadastro).filter(
                    models.Cadastro.id.in_(participantes_ids)
                ).all()
                db_agendamento.participantes = participantes
        
        for campo, valor in dados_atualizacao.items():
            if hasattr(db_agendamento, campo):
                setattr(db_agendamento, campo, valor)
        
        db_agendamento.data_atualizacao = datetime.now()
        
        db.commit()
        db.refresh(db_agendamento)
        
        print(f"✅ Agendamento {agendamento_id} atualizado com sucesso")
        return agendamento_schema.AgendamentoResponse.from_orm(db_agendamento)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao atualizar agendamento {agendamento_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar agendamento: {str(e)}")

@router.delete("/{agendamento_id}")
async def excluir_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    """
    Excluir agendamento
    """
    try:
        db_agendamento = db.query(models.Agendamento).filter(
            models.Agendamento.id == agendamento_id
        ).first()
        
        if not db_agendamento:
            raise HTTPException(status_code=404, detail="Agendamento não encontrado")
        
        titulo = db_agendamento.titulo
        db.delete(db_agendamento)
        db.commit()
        
        print(f"✅ Agendamento '{titulo}' excluído com sucesso")
        return {"message": "Agendamento excluído com sucesso", "id": agendamento_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao excluir agendamento {agendamento_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao excluir agendamento: {str(e)}")

@router.get("/stats/resumo")
async def obter_estatisticas_agendamentos(db: Session = Depends(get_db)):
    """
    Obter estatísticas dos agendamentos para dashboard
    """
    try:
        hoje = datetime.now().date()
        inicio_hoje = datetime.combine(hoje, datetime.min.time())
        fim_hoje = datetime.combine(hoje + timedelta(days=1), datetime.min.time())
        
        dias_desde_domingo = hoje.weekday() + 1 if hoje.weekday() != 6 else 0
        inicio_semana = datetime.combine(hoje - timedelta(days=dias_desde_domingo), datetime.min.time())
        
        inicio_mes = datetime.combine(hoje.replace(day=1), datetime.min.time())
        
        # Contar estatísticas usando seu modelo
        total = db.query(func.count(models.Agendamento.id)).scalar()
        
        hoje_count = db.query(func.count(models.Agendamento.id)).filter(
            and_(models.Agendamento.data_hora >= inicio_hoje, models.Agendamento.data_hora < fim_hoje)
        ).scalar()
        
        semana_count = db.query(func.count(models.Agendamento.id)).filter(
            models.Agendamento.data_hora >= inicio_semana
        ).scalar()
        
        mes_count = db.query(func.count(models.Agendamento.id)).filter(
            models.Agendamento.data_hora >= inicio_mes
        ).scalar()
        
        # Por tipo de sessão
        reunioes_count = db.query(func.count(models.Agendamento.id)).filter(
            models.Agendamento.tipo_sessao == "reuniao"
        ).scalar()
        
        consultas_count = db.query(func.count(models.Agendamento.id)).filter(
            models.Agendamento.tipo_sessao == "consulta"
        ).scalar()
        
        eventos_count = db.query(func.count(models.Agendamento.id)).filter(
            models.Agendamento.tipo_sessao == "evento"
        ).scalar()
        
        # Por status
        agendados_count = db.query(func.count(models.Agendamento.id)).filter(
            models.Agendamento.status == "agendado"
        ).scalar()
        
        confirmados_count = db.query(func.count(models.Agendamento.id)).filter(
            models.Agendamento.status == "confirmado"
        ).scalar()
        
        return {
            "total": total,
            "hoje": hoje_count,
            "esta_semana": semana_count,
            "este_mes": mes_count,
            "reunioes": reunioes_count,
            "consultas": consultas_count,
            "eventos": eventos_count,
            "agendados": agendados_count,
            "confirmados": confirmados_count
        }
        
    except Exception as e:
        print(f"❌ Erro ao buscar estatísticas: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}")

@router.get("/test/database")
async def test_database(db: Session = Depends(get_db)):
    """
    Endpoint de teste para verificar se o banco está funcionando
    """
    try:
        count_agendamentos = db.query(models.Agendamento).count()
        
        count_cadastros = db.query(models.Cadastro).count()
        
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