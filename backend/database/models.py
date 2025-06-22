from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Boolean, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.database import Base

agendamento_participantes = Table(
    'agendamento_participantes',
    Base.metadata,
    Column('agendamento_id', Integer, ForeignKey('agendamentos.id'), primary_key=True),
    Column('participante_id', Integer, ForeignKey('cadastros.id'), primary_key=True)
)
class Cadastro(Base):
    __tablename__ = "cadastros"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    telefone = Column(String(20))
    data_nascimento = Column(Date)
    endereco = Column(String(500))
    data_criacao = Column(DateTime, default=func.now())

    agendamentos = relationship("Agendamento", back_populates="cadastro")
    
    agendamentos_participando = relationship(
        "Agendamento",
        secondary=agendamento_participantes,
        back_populates="participantes"
    )
class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    telefone = Column(String(20))
    cargo = Column(String(100))
    departamento = Column(String(100))
    especialidade = Column(String(100))
    ativo = Column(Boolean, default=True)
    data_admissao = Column(Date)
    data_criacao = Column(DateTime, default=func.now())
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now())

    agendamentos = relationship("Agendamento", back_populates="funcionario")

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    usuario_id = Column(Integer, ForeignKey("cadastros.id"), nullable=False)
    data_hora = Column(DateTime, nullable=False)
    tipo_sessao = Column(String(50), nullable=False, default="reuniao")
    status = Column(String(30), nullable=False, default="agendado")
    observacoes = Column(Text)
    duracao_em_minutos = Column(Integer, default=60)
    local = Column(String(255))
    profissional_responsavel_id = Column(Integer, ForeignKey("funcionarios.id"))
    data_criacao = Column(DateTime, default=func.now())
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now())

    cadastro = relationship("Cadastro", back_populates="agendamentos")
    funcionario = relationship("Funcionario", back_populates="agendamentos")
    
    participantes = relationship(
        "Cadastro", 
        secondary=agendamento_participantes,
        back_populates="agendamentos_participando"
    )

    def __repr__(self):
        return f"<Agendamento(id={self.id}, titulo='{self.titulo}', data_hora='{self.data_hora}')>"

    @property
    def participantes_nomes(self):
        """Retorna lista com nomes dos participantes"""
        return [p.nome for p in self.participantes]
    
    @property
    def participantes_count(self):
        """Retorna quantidade de participantes"""
        return len(self.participantes)
    
    @property
    def duracao_formatada(self):
        """Retorna duração formatada (ex: 1h 30min)"""
        if not self.duracao_em_minutos:
            return "Não definida"
        
        horas = self.duracao_em_minutos // 60
        minutos = self.duracao_em_minutos % 60
        
        if horas > 0 and minutos > 0:
            return f"{horas}h {minutos}min"
        elif horas > 0:
            return f"{horas}h"
        else:
            return f"{minutos}min"
    
    @property
    def status_cor(self):
        """Retorna cor baseada no status"""
        cores = {
            'agendado': '#3B82F6',     
            'confirmado': '#10B981',   
            'cancelado': '#EF4444',     
            'realizado': '#8B5CF6',     
            'adiado': '#F59E0B'         
        }
        return cores.get(self.status, '#6B7280') 