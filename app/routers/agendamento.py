from fastapi import APIRouter, HTTPException
from typing import List

from app.models.agendamento import Agendamento 

router = APIRouter (
    
    prefix= "/agendamentos",
    tags= ["agendamentos"]   
     
)

agendamentos = []
contador_agendamento_id = 1

@router.post("/", response_model=Agendamento, status_code=201)
async def criar_agendamento(agendamento: Agendamento):
    global contador_agendamento_id
    agendamento_com_id = agendamento.model_copy(update={"id": contador_agendamento_id})
    agendamentos.append(agendamento_com_id)
    contador_agendamento_id += 1 
    return agendamento_com_id
 
@router.get("/", response_model=List[Agendamento])
async def lista_agendamentos():
    return agendamentos
@router.get("/{agendamento_id}", response_model=Agendamento)
async def obter_agendamento(agendamento_id: int):
    for agendamento in agendamentos:
        if agendamento.id == agendamento_id:
            return agendamento
    raise HTTPException(status_code=404, detail="Agendamento não encontrado")