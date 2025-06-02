from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base

#Config das tabelas do bd
class Cadastro(Base):
    __tablename__ = "cadastros"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    telefone = Column(String, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    endereco = Column(String)

    agendamentos = relationship("Agendamento", back_populates="cadastro")

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("cadastros.id"), nullable=False)
    data_hora = Column(DateTime, nullable=False)
    tipo_sessao = Column(String, nullable=False)
    status = Column(String, nullable=False)
    observacoes = Column(String)
    duracao_em_minutos = Column(Integer)
    local = Column(String)
    profissional_responsavel_id = Column(Integer)
    data_criacao = Column(DateTime, default=func.now())
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now())

    cadastro = relationship("Cadastro", back_populates="agendamentos")