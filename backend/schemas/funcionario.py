from pydantic import BaseModel
from typing import Optional

class FuncionarioBase(BaseModel):
    nome: str
    especialidade: Optional[str] = None
    cadastro_id: int

class FuncionarioCreate(FuncionarioBase):
    pass

class FuncionarioResponse(FuncionarioBase):
    id: int

    class Config:
        from_attributes = True
