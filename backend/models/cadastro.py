from pydantic import BaseModel
from typing import Optional

class Cadastro(BaseModel):
    nome: str
    email: str
    telefone: str
    data_nascimento: str
    endereco: Optional[str] = None