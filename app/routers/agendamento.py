from fastapi import APIRouter, HTTPException
from typing import List

from app.models.agendamento import Agendamento 

Router = APIRouter (
    
    prefix= "/agendamentos",
    tags= ["agendamentos"]   
     
)

agendamentos = []
contador_agendamento_id = 1

@router.post("/", reponse_model=Agendamento, status_code=201)
async def criar_agendamento(agendamento: Agendamento):
    global contador_agendamento_id
    agendamento_com_id = agendamento.model_copy(update={"id": contador_agendamento_id})
    agendamentos.append(agendamento_com_id)
    contador_agendamento_id += 1 
    return agendamento_com_id
 
