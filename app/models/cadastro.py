from pydantic import BaseModel
from typing import Optional

nome: str
email: str
telefone: str
data_nascimento: str
endereco: Optional[str] = None
