from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cadastro, agendamento, funcionario, auth # Importe o novo router
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cadastro.router)
app.include_router(agendamento.router)
app.include_router(funcionario.router)
app.include_router(auth.router) 