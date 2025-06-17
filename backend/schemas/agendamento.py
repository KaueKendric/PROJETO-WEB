from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AgendamentoBase(BaseModel):
    titulo: str
    data_hora: datetime
    local: Optional[str] = None
    status: Optional[str] = "pendente"
    descricao: Optional[str] = None
    cadastro_id: int

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoResponse(AgendamentoBase):
    id: int

class Config:
    from_attributes = True
