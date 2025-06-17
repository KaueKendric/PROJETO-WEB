from pydantic import BaseModel
from datetime import date
from typing import Optional

class CadastroBase(BaseModel):
    nome: str
    email: str
    telefone: str
    data_nascimento: date
    endereco: Optional[str] = None

class CadastroCreate(CadastroBase):
    pass

class CadastroResponse(CadastroBase):
    id: int

class Config:
    from_attributes = True
