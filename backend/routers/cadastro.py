import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from backend.database import models
from backend.database.database import get_db
from backend.schemas import cadastro as cadastro_schema

router = APIRouter(
    prefix="/cadastros",
    tags=["cadastros"],
)

from pydantic import BaseModel

class CadastroPaginado(BaseModel):
    cadastros: List[Dict[str, Any]]
    total: int
    pagina: int
    totalPaginas: int
    limit: int
    skip: int
    filtro: str
    temProxima: bool
    temAnterior: bool

@router.get("/", response_model=CadastroPaginado)
async def listar_cadastros(
    limit: int = Query(6, ge=1, le=50, description="Número de itens por página"),
    skip: int = Query(0, ge=0, description="Número de itens para pular"),
    filtro: str = Query("", description="Filtro de busca por nome, email ou telefone"),
    db: Session = Depends(get_db)
):
    """
    Listar cadastros com paginação e filtros
    """
    try:
        pagina = (skip // limit) + 1
        print(f"Buscando cadastros - Página: {pagina}, Limit: {limit}, Skip: {skip}, Filtro: '{filtro}'")
        
        # Query base
        query = db.query(models.Cadastro)
        count_query = db.query(func.count(models.Cadastro.id))
        
        # Aplicar filtro se fornecido
        if filtro and filtro.strip():
            filtro = filtro.strip()
            filtro_condicao = or_(
                models.Cadastro.nome.ilike(f"%{filtro}%"),
                models.Cadastro.email.ilike(f"%{filtro}%"),
                models.Cadastro.telefone.ilike(f"%{filtro}%")
            )
            query = query.filter(filtro_condicao)
            count_query = count_query.filter(filtro_condicao)
        
        # Contar total
        total = count_query.scalar()
        
        # Buscar cadastros com paginação
        cadastros = (
            query
            .order_by(models.Cadastro.data_criacao.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Processar cadastros para JSON
        cadastros_processados = []
        for cadastro in cadastros:
            try:
                cadastro_dict = {
                    "id": cadastro.id,
                    "nome": cadastro.nome,
                    "email": cadastro.email,
                    "telefone": cadastro.telefone,
                    "data_nascimento": cadastro.data_nascimento.isoformat() if cadastro.data_nascimento else None,
                    "endereco": getattr(cadastro, 'endereco', None),
                    "data_criacao": cadastro.data_criacao.isoformat() if hasattr(cadastro, 'data_criacao') and cadastro.data_criacao else None,
                    "data_atualizacao": getattr(cadastro, 'data_atualizacao', None)
                }
                if cadastro_dict["data_atualizacao"]:
                    cadastro_dict["data_atualizacao"] = cadastro_dict["data_atualizacao"].isoformat()
                
                cadastros_processados.append(cadastro_dict)
                
            except Exception as e:
                print(f"Erro ao processar cadastro {cadastro.id}: {e}")
                # Fallback com dados mínimos
                cadastros_processados.append({
                    "id": cadastro.id,
                    "nome": getattr(cadastro, 'nome', 'Nome não disponível'),
                    "email": getattr(cadastro, 'email', ''),
                    "telefone": getattr(cadastro, 'telefone', ''),
                    "data_nascimento": None,
                    "endereco": None,
                    "data_criacao": None,
                    "data_atualizacao": None,
                    "error": f"Erro ao processar: {str(e)}"
                })
        
        total_paginas = (total + limit - 1) // limit if total > 0 else 1
        
        print(f"Retornando {len(cadastros_processados)} cadastros de {total} total")
        
        return CadastroPaginado(
            cadastros=cadastros_processados,
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
        print(f"Erro ao buscar cadastros: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar cadastros: {str(e)}")

# Manter o endpoint antigo para compatibilidade (opcional)
@router.get("/simples")
async def listar_cadastros_simples(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Endpoint simples para compatibilidade"""
    try:
        return db.query(models.Cadastro).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{cadastro_id}")
async def obter_cadastro(cadastro_id: int, db: Session = Depends(get_db)):
    try:
        cadastro = (
            db.query(models.Cadastro).filter(models.Cadastro.id == cadastro_id).first()
        )
        if not cadastro:
            raise HTTPException(status_code=404, detail="Cadastro não encontrado")
        return cadastro
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=cadastro_schema.Cadastro, status_code=201)
async def criar_cadastro(
    cadastro: cadastro_schema.Cadastro, db: Session = Depends(get_db)
):
    try:
        print(f"Criando cadastro: {cadastro.nome}")

        db_cadastro = models.Cadastro(**cadastro.model_dump())
        db.add(db_cadastro)
        db.commit()
        db.refresh(db_cadastro)

        print(f"Cadastro criado com ID: {db_cadastro.id}")
        return db_cadastro

    except Exception as e:
        db.rollback()
        print(f"Erro ao criar cadastro: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar cadastro: {str(e)}")

@router.put("/{cadastro_id}", response_model=cadastro_schema.Cadastro)
async def atualizar_cadastro(
    cadastro_id: int,
    cadastro_data: cadastro_schema.CadastroUpdate,
    db: Session = Depends(get_db),
):
    try:
        db_cadastro = (
            db.query(models.Cadastro).filter(models.Cadastro.id == cadastro_id).first()
        )

        if not db_cadastro:
            raise HTTPException(status_code=404, detail="Cadastro não encontrado")

        # Atualizar campos
        dados_atualizacao = cadastro_data.model_dump(exclude_unset=True)

        for campo, valor in dados_atualizacao.items():
            if hasattr(db_cadastro, campo) and campo != "id":
                setattr(db_cadastro, campo, valor)

        db.commit()
        db.refresh(db_cadastro)

        print(f"Cadastro {cadastro_id} atualizado com sucesso")
        return db_cadastro

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Erro ao atualizar cadastro {cadastro_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Erro ao atualizar cadastro: {str(e)}"
        )

@router.delete("/{cadastro_id}")
async def excluir_cadastro(cadastro_id: int, db: Session = Depends(get_db)):
    try:
        db_cadastro = (
            db.query(models.Cadastro).filter(models.Cadastro.id == cadastro_id).first()
        )

        if not db_cadastro:
            raise HTTPException(status_code=404, detail="Cadastro não encontrado")

        nome = db_cadastro.nome
        db.delete(db_cadastro)
        db.commit()

        print(f"Cadastro '{nome}' excluído com sucesso")
        return {"message": "Cadastro excluído com sucesso", "id": cadastro_id}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Erro ao excluir cadastro {cadastro_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Erro ao excluir cadastro: {str(e)}"
        )

@router.get("/stats/resumo")
async def obter_estatisticas_cadastros(db: Session = Depends(get_db)):
    try:
        from datetime import datetime, timedelta

        hoje = datetime.now().date()
        inicio_mes = datetime(hoje.year, hoje.month, 1).date()
        mes_passado = (inicio_mes - timedelta(days=1)).replace(day=1)

        total = db.query(func.count(models.Cadastro.id)).scalar()

        try:
            este_mes = (
                db.query(func.count(models.Cadastro.id))
                .filter(func.date(models.Cadastro.data_criacao) >= inicio_mes)
                .scalar()
            )

            mes_anterior = (
                db.query(func.count(models.Cadastro.id))
                .filter(
                    func.date(models.Cadastro.data_criacao) >= mes_passado,
                    func.date(models.Cadastro.data_criacao) < inicio_mes,
                )
                .scalar()
            )
        except:
            este_mes = 0
            mes_anterior = 0

        return {
            "total": total,
            "este_mes": este_mes,
            "mes_anterior": mes_anterior,
            "crescimento": (
                ((este_mes - mes_anterior) / mes_anterior * 100)
                if mes_anterior > 0
                else 0
            ),
        }

    except Exception as e:
        print(f"Erro ao buscar estatísticas: {e}")
        raise HTTPException(
            status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}"
        )

@router.get("/buscar/avancada")
async def buscar_cadastros_avancada(
    nome: Optional[str] = None,
    email: Optional[str] = None,
    telefone: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    try:
        query = db.query(models.Cadastro)

        if nome:
            query = query.filter(models.Cadastro.nome.ilike(f"%{nome}%"))
        if email:
            query = query.filter(models.Cadastro.email.ilike(f"%{email}%"))
        if telefone:
            query = query.filter(models.Cadastro.telefone.ilike(f"%{telefone}%"))

        cadastros = query.offset(skip).limit(limit).all()
        total = query.count()

        return {
            "cadastros": [cadastro_schema.Cadastro.from_orm(c) for c in cadastros],
            "total": total,
            "skip": skip,
            "limit": limit,
        }

    except Exception as e:
        print(f"Erro na busca avançada: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na busca: {str(e)}")

# Endpoint de teste
@router.get("/test/database")
async def test_database_cadastros(db: Session = Depends(get_db)):
    try:
        # Teste básico
        count_cadastros = db.query(models.Cadastro).count()

        # Buscar um cadastro aleatório
        cadastro_exemplo = db.query(models.Cadastro).first()

        return {
            "database_status": "connected",
            "cadastros_count": count_cadastros,
            "exemplo_cadastro": (
                {
                    "id": cadastro_exemplo.id if cadastro_exemplo else None,
                    "nome": cadastro_exemplo.nome if cadastro_exemplo else None,
                }
                if cadastro_exemplo
                else None
            ),
            "test_timestamp": datetime.datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "database_status": "error",
            "error": str(e),
            "test_timestamp": datetime.datetime.now().isoformat(),
        }