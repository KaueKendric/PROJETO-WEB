from pydantic import BaseModel
from typing import Optional
from datetime import date  

class Cadastro(BaseModel):
    nome: str
    email: str
    telefone: str
    data_nascimento: date  
    endereco: Optional[str] = None

    class Config:
        from_attributes = True