from fastapi import FastAPI
from app.routers import cadastro, agendamento
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.include_router(cadastro.router)
app.include_router(agendamento.router)

@app.get("/")
async def root():
    return {"message": "API para Controle de Cadastro e Agendamento"}