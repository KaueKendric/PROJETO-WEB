from pydantic import BaseModel
from typing import Optional
from datetime import datetime

usuario_id: int
data_hora: datetime
tipo_sessao: str
status: str
observacoes: Optional[str] = None
duracao_em_minutos: Optional[int] = None
local: Optional[str] = None
profissional_responsavel_id: Optional[int] = None
data_criacao: Optional[datetime] = None
data_atualizacao: Optional[datetime] = None
