from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.database import Base


class Cadastro(Base):
    __tablename__ = "cadastros"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    telefone = Column(String, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    endereco = Column(Text, nullable=True)

    agendamentos = relationship("Agendamento", back_populates="cadastro", cascade="all, delete-orphan")
    funcionarios = relationship("Funcionario", back_populates="cadastro", cascade="all, delete-orphan")


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    data_hora = Column(DateTime, nullable=False)
    local = Column(String, nullable=True)
    status = Column(String, default="pendente")
    descricao = Column(Text, nullable=True)
    cadastro_id = Column(Integer, ForeignKey("cadastros.id", ondelete="CASCADE"), nullable=False)

    cadastro = relationship("Cadastro", back_populates="agendamentos")


class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    especialidade = Column(String, nullable=True)
    cadastro_id = Column(Integer, ForeignKey("cadastros.id", ondelete="CASCADE"), nullable=False)

    cadastro = relationship("Cadastro", back_populates="funcionarios")