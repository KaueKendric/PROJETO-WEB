from fastapi import APIRouter, HTTPException
from typing import List

from app.models.cadastro import Cadastro

router = APIRouter(
    
    prefix="/cadastros",
    tags=["cadastros"]
)

cadastros = []
contador_cadastro_id = 1

@router.post("/", response_model=Cadastro, status_code=201)
async def criar_cadastro(cadastro: Cadastro):
    global contador_cadastro_id
    cadastro_com_id = cadastro.model_copy(update={"id": contador_cadastro_id})
    cadastros.append(cadastro_com_id)
    contador_cadastro_id+= 1
    return cadastro_com_id
@router.get("/", response_model=List[Cadastro])
async def listar_cadastros():
    return cadastros

@router.get("/{cadastro_id}", response_model=Cadastro)
async def obter_cadastro(cadastro_id: int):
    for cadastro in cadastros:
        if cadastro.id == cadastro_id:
            return cadastro
    raise HTTPException(status_code=404, detail="Cadastro não encontrado")