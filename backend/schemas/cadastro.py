from pydantic import BaseModel, validator, Field
from typing import Optional, List, Dict, Any
from datetime import date
import datetime

# Schema principal (mantido do seu código)
class Cadastro(BaseModel):
    id: Optional[int] = None  
    nome: str
    email: str
    telefone: str
    data_nascimento: date
    endereco: Optional[str] = None

    @validator('data_nascimento', pre=True)
    def parse_data_nascimento(cls, value):
        if isinstance(value, str):
            try:
                return datetime.datetime.strptime(value, '%d/%m/%Y').date()
            except ValueError:
                raise ValueError("O formato da data de nascimento deve ser DD/MM/AAAA")
        return value

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "nome": "Seu Nome",
                "email": "seu_email@exemplo.com",
                "telefone": "99999999",
                "data_nascimento": "16/12/2003",
                "endereco": "Seu Endereço"
            }
        }

# ✅ NOVO: Schema para resposta paginada
class CadastroPaginado(BaseModel):
    """Schema para resposta paginada de cadastros"""
    cadastros: List[Dict[str, Any]] = Field(..., description="Lista de cadastros")
    total: int = Field(..., description="Total de registros")
    pagina: int = Field(..., description="Página atual")
    totalPaginas: int = Field(..., description="Total de páginas")
    limit: int = Field(..., description="Itens por página")
    skip: int = Field(..., description="Itens pulados")
    filtro: str = Field(..., description="Filtro aplicado")
    temProxima: bool = Field(..., description="Tem próxima página")
    temAnterior: bool = Field(..., description="Tem página anterior")
    
    class Config:
        json_schema_extra = {
            "example": {
                "cadastros": [
                    {
                        "id": 1,
                        "nome": "João Silva",
                        "email": "joao@email.com",
                        "telefone": "11999999999",
                        "data_nascimento": "1990-01-15",
                        "endereco": "Rua das Flores, 123",
                        "data_criacao": "2024-01-10T10:30:00"
                    }
                ],
                "total": 25,
                "pagina": 1,
                "totalPaginas": 5,
                "limit": 6,
                "skip": 0,
                "filtro": "João",
                "temProxima": True,
                "temAnterior": False
            }
        }

# ✅ NOVO: Schema para criação de cadastro
class CadastroCreate(BaseModel):
    """Schema para criação de cadastro"""
    nome: str = Field(..., min_length=1, max_length=255, description="Nome completo")
    email: str = Field(..., description="Email válido")
    telefone: str = Field(..., min_length=8, max_length=20, description="Telefone")
    data_nascimento: date = Field(..., description="Data de nascimento")
    endereco: Optional[str] = Field(None, max_length=500, description="Endereço completo")
    
    @validator('data_nascimento', pre=True)
    def parse_data_nascimento(cls, value):
        if isinstance(value, str):
            try:
                return datetime.datetime.strptime(value, '%d/%m/%Y').date()
            except ValueError:
                try:
                    return datetime.datetime.strptime(value, '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError("O formato da data deve ser DD/MM/AAAA ou AAAA-MM-DD")
        return value
    
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Email deve conter @')
        return v.lower()
    
    class Config:
        json_schema_extra = {
            "example": {
                "nome": "Maria Silva",
                "email": "maria@email.com",
                "telefone": "11987654321",
                "data_nascimento": "15/08/1985",
                "endereco": "Av. Paulista, 1000"
            }
        }

# ✅ NOVO: Schema para atualização de cadastro
class CadastroUpdate(BaseModel):
    """Schema para atualização de cadastro"""
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = None
    telefone: Optional[str] = Field(None, min_length=8, max_length=20)
    data_nascimento: Optional[date] = None
    endereco: Optional[str] = Field(None, max_length=500)
    
    @validator('data_nascimento', pre=True)
    def parse_data_nascimento(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            try:
                return datetime.datetime.strptime(value, '%d/%m/%Y').date()
            except ValueError:
                try:
                    return datetime.datetime.strptime(value, '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError("O formato da data deve ser DD/MM/AAAA ou AAAA-MM-DD")
        return value
    
    @validator('email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Email deve conter @')
        return v.lower() if v else v

# ✅ NOVO: Schema para resposta de cadastro
class CadastroResponse(BaseModel):
    """Schema para resposta de cadastro"""
    id: int
    nome: str
    email: str
    telefone: str
    data_nascimento: date
    endereco: Optional[str] = None
    data_criacao: Optional[datetime.datetime] = None
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "nome": "João Silva",
                "email": "joao@email.com",
                "telefone": "11999999999",
                "data_nascimento": "1990-01-15",
                "endereco": "Rua das Flores, 123",
                "data_criacao": "2024-01-10T10:30:00"
            }
        }

# ✅ NOVO: Schema para estatísticas de cadastros
class CadastroStats(BaseModel):
    """Schema para estatísticas de cadastros"""
    total: int = Field(..., description="Total de cadastros")
    este_mes: int = Field(..., description="Cadastros este mês")
    mes_anterior: int = Field(..., description="Cadastros mês anterior")
    crescimento: float = Field(..., description="Percentual de crescimento")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 150,
                "este_mes": 23,
                "mes_anterior": 18,
                "crescimento": 27.8
            }
        }

# ✅ NOVO: Schema para busca avançada
class CadastroBusca(BaseModel):
    """Schema para parâmetros de busca"""
    nome: Optional[str] = Field(None, description="Buscar por nome")
    email: Optional[str] = Field(None, description="Buscar por email")
    telefone: Optional[str] = Field(None, description="Buscar por telefone")
    skip: int = Field(0, ge=0, description="Registros para pular")
    limit: int = Field(100, ge=1, le=1000, description="Limite de registros")

# ✅ NOVO: Schema para resposta de operações
class OperacaoResponse(BaseModel):
    """Schema para respostas de operações simples"""
    message: str
    id: Optional[int] = None
    success: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Cadastro criado com sucesso",
                "id": 123,
                "success": True
            }
        }