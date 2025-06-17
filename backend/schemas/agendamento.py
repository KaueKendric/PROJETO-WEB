from pydantic import BaseModel, Field
from datetime import datetime, date, time
from typing import Optional, List, Dict, Any

# Schema para receber dados do frontend (mantido do seu código)
class AgendamentoCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=255, description="Título do agendamento")
    data: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Data no formato YYYY-MM-DD")
    hora: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="Hora no formato HH:MM")
    local: Optional[str] = Field(None, max_length=255, description="Local do agendamento")
    descricao: Optional[str] = Field(None, description="Descrição/observações do agendamento")
    participantes_ids: List[int] = Field(default=[], description="Lista de IDs dos participantes")
    tipo_sessao: Optional[str] = Field(default="reuniao", description="Tipo da sessão")
    duracao_em_minutos: Optional[int] = Field(default=60, ge=1, le=1440, description="Duração em minutos")

# Schema para participante (usado na resposta) - mantido do seu código
class ParticipanteResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: Optional[str] = None
    
    class Config:
        from_attributes = True

# Schema de resposta completo (mantido do seu código)
class AgendamentoResponse(BaseModel):
    id: int
    titulo: str
    data_hora: datetime
    tipo_sessao: str
    status: str
    observacoes: Optional[str] = None
    duracao_em_minutos: Optional[int] = None
    local: Optional[str] = None
    profissional_responsavel_id: Optional[int] = None
    data_criacao: datetime
    data_atualizacao: datetime
    participantes: List[ParticipanteResponse] = []
    
    class Config:
        from_attributes = True

# Schema para listar (mais simples) - mantido do seu código
class AgendamentoList(BaseModel):
    id: int
    titulo: str
    data_hora: datetime
    tipo_sessao: str
    status: str
    local: Optional[str] = None
    participantes_count: int = 0
    
    class Config:
        from_attributes = True

# Schema para atualização (mantido do seu código)
class AgendamentoUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=255)
    data: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    hora: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    local: Optional[str] = Field(None, max_length=255)
    descricao: Optional[str] = None
    participantes_ids: Optional[List[int]] = None
    tipo_sessao: Optional[str] = None
    duracao_em_minutos: Optional[int] = Field(None, ge=1, le=1440)
    status: Optional[str] = None

# ✅ NOVO: Schema para resposta paginada
class AgendamentoPaginado(BaseModel):
    """Schema para resposta paginada de agendamentos"""
    agendamentos: List[Dict[str, Any]] = Field(..., description="Lista de agendamentos")
    total: int = Field(..., description="Total de registros")
    pagina: int = Field(..., description="Página atual")
    totalPaginas: int = Field(..., description="Total de páginas")
    limit: int = Field(..., description="Itens por página")
    skip: int = Field(..., description="Itens pulados")
    filtro: str = Field(..., description="Filtro aplicado")
    temProxima: bool = Field(..., description="Tem próxima página")
    temAnterior: bool = Field(..., description="Tem página anterior")
    
    class Config:
        schema_extra = {
            "example": {
                "agendamentos": [
                    {
                        "id": 1,
                        "titulo": "Reunião de Planejamento",
                        "data_hora": "2024-01-15T14:00:00",
                        "tipo_sessao": "reuniao",
                        "status": "agendado",
                        "local": "Sala de Conferências A",
                        "participantes": [
                            {"id": 1, "nome": "João Silva", "email": "joao@email.com"}
                        ],
                        "participantes_count": 1,
                        "duracao_em_minutos": 60,
                        "observacoes": "Importante reunião",
                        "data_criacao": "2024-01-10T10:30:00",
                        "data_atualizacao": "2024-01-10T10:30:00"
                    }
                ],
                "total": 25,
                "pagina": 1,
                "totalPaginas": 5,
                "limit": 6,
                "skip": 0,
                "filtro": "todos",
                "temProxima": True,
                "temAnterior": False
            }
        }

# ✅ NOVO: Schema para estatísticas de agendamentos
class AgendamentoStats(BaseModel):
    """Schema para estatísticas de agendamentos"""
    total: int = Field(..., description="Total de agendamentos")
    hoje: int = Field(..., description="Agendamentos hoje")
    esta_semana: int = Field(..., description="Agendamentos esta semana")
    este_mes: int = Field(..., description="Agendamentos este mês")
    reunioes: int = Field(..., description="Total de reuniões")
    consultas: int = Field(..., description="Total de consultas")
    eventos: int = Field(..., description="Total de eventos")
    agendados: int = Field(..., description="Status: agendado")
    confirmados: int = Field(..., description="Status: confirmado")
    
    class Config:
        schema_extra = {
            "example": {
                "total": 150,
                "hoje": 5,
                "esta_semana": 23,
                "este_mes": 67,
                "reunioes": 45,
                "consultas": 78,
                "eventos": 27,
                "agendados": 89,
                "confirmados": 45
            }
        }

# ✅ NOVO: Enum para tipos de filtro
from enum import Enum

class FiltroAgendamento(str, Enum):
    """Enum para tipos de filtro de agendamentos"""
    TODOS = "todos"
    HOJE = "hoje"
    SEMANA = "semana"
    MES = "mes"
    REUNIAO = "reuniao"
    CONSULTA = "consulta"
    EVENTO = "evento"
    AGENDADO = "agendado"
    CONFIRMADO = "confirmado"
    REALIZADO = "realizado"
    CANCELADO = "cancelado"

# ✅ NOVO: Schema para resposta de operações simples
class OperacaoResponse(BaseModel):
    """Schema para respostas de operações simples"""
    message: str
    id: Optional[int] = None
    success: bool = True
    
    class Config:
        schema_extra = {
            "example": {
                "message": "Operação realizada com sucesso",
                "id": 123,
                "success": True
            }
        }