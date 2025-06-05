from pydantic import BaseModel, validator
from typing import Optional
from datetime import date
import datetime

class Cadastro(BaseModel):
    id: Optional[int] = None  # Certifique-se de que esta linha está presente
    nome: str
    email: str
    telefone: str
    data_nascimento: date
    endereco: Optional[str] = None

    @validator('data_nascimento', pre=True)
    def parse_data_nascimento(cls, value):
        if isinstance(value, str):
            try:
                return datetime.datetime.strptime(value, '%d-%m-%Y').date()
            except ValueError:
                raise ValueError("O formato da data de nascimento deve ser DD-MM-AAAA")
        return value

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "nome": "Seu Nome",
                "email": "seu_email@exemplo.com",
                "telefone": "99999999",
                "data_nascimento": "16-12-2003",
                "endereco": "Seu Endereço"
            }
        }