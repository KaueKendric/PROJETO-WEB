from pydantic import BaseModel, Field
from datetime import datetime, date, time
from typing import Optional, List

# Schema para receber dados do frontend
class AgendamentoCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=255, description="Título do agendamento")
    data: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Data no formato YYYY-MM-DD")
    hora: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="Hora no formato HH:MM")
    local: Optional[str] = Field(None, max_length=255, description="Local do agendamento")
    descricao: Optional[str] = Field(None, description="Descrição/observações do agendamento")
    participantes_ids: List[int] = Field(default=[], description="Lista de IDs dos participantes")
    tipo_sessao: Optional[str] = Field(default="reuniao", description="Tipo da sessão")
    duracao_em_minutos: Optional[int] = Field(default=60, ge=1, le=1440, description="Duração em minutos")

# Schema para participante (usado na resposta)
class ParticipanteResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: Optional[str] = None
    
    class Config:
        from_attributes = True

# Schema de resposta completo
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

# Schema para listar (mais simples)
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

# Schema para atualização
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