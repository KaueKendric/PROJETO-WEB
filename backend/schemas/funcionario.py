from pydantic import BaseModel
from typing import Optional

class Funcionario(BaseModel):
    id: Optional[int] = None
    nome: str
    especialidade: Optional[str] = None
    cadastro_id: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "nome": "Nome do Funcionário",
                "especialidade": "Especialidade do Funcionário (opcional)",
                "cadastro_id": 1
            }
        }