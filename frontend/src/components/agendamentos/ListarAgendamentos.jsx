import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, FileText, AlertCircle, Edit2, Trash2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import fetchApi from '../../utils/fetchApi';

function ListaAgendamento() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [carregandoPagina, setCarregandoPagina] = useState(false);
  const limitePorPagina = 6;

  // Adicionar estilos CSS para line-clamp e padronização
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .agendamento-card {
        height: 420px;
        display: flex;
        flex-direction: column;
      }
      .agendamento-header {
        min-height: 80px;
        max-height: 80px;
      }
      .agendamento-content {
        flex: 1;
        min-height: 200px;
        display: flex;
        flex-direction: column;
      }
      .agendamento-footer {
        margin-top: auto;
        min-height: 60px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const tiposFiltro = [
    { value: 'todos', label: 'Todos' },
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mês' },
    { value: 'reuniao', label: 'Reuniões' },
    { value: 'consulta', label: 'Consultas' },
    { value: 'evento', label: 'Eventos' }
  ];

  const getTipoLabel = (tipo) => {
    const tipos = {
      'reuniao': 'Reunião',
      'consulta': 'Consulta',
      'evento': 'Evento',
      'compromisso': 'Compromisso Pessoal',
      'outros': 'Outros'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoColor = (tipo) => {
    const cores = {
      'reuniao': '#3b82f6',
      'consulta': '#10b981',
      'evento': '#8b5cf6',
      'compromisso': '#f59e0b',
      'outros': '#6b7280'
    };
    return cores[tipo] || '#6b7280';
  };

  const formatarData = (dataHora) => {
    try {
      const data = new Date(dataHora);
      return data.toLocaleDateString('pt-BR');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatarHora = (dataHora) => {
    try {
      const data = new Date(dataHora);
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return 'Hora inválida';
    }
  };

  const formatarParticipantes = (participantes) => {
    if (!participantes || participantes.length === 0) {
      return 'Nenhum participante';
    }
    
    if (participantes.length === 1) {
      return participantes[0].nome;
    } else if (participantes.length <= 3) {
      return participantes.map(p => p.nome).join(', ');
    } else {
      return `${participantes.slice(0, 2).map(p => p.nome).join(', ')} e mais ${participantes.length - 2}`;
    }
  };

  const fetchAgendamentos = async (pagina = 1, filtroAtual = filtro) => {
    try {
      console.log(`📅 Buscando agendamentos - Página ${pagina}, Filtro: ${filtroAtual}`);
      setCarregandoPagina(true);
      setErro('');
      
      const skip = (pagina - 1) * limitePorPagina;
      let url = `/api/agendamentos/?limit=${limitePorPagina}&skip=${skip}`;
      
      if (filtroAtual !== 'todos') {
        url += `&filtro=${filtroAtual}`;
      }
      
      const response = await fetchApi(url);
      
      if (!response) {
        throw new Error('Erro ao buscar agendamentos');
      }
      
      const data = response;
      console.log('✅ Agendamentos recebidos:', data);
      
      if (data.agendamentos && typeof data.total === 'number') {
        setAgendamentos(data.agendamentos);
        setTotalAgendamentos(data.total);
      } else if (Array.isArray(data)) {
        setAgendamentos(data);
        setTotalAgendamentos(data.length);
      } else {
        setAgendamentos([]);
        setTotalAgendamentos(0);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos:', error);
      setErro(`Erro ao buscar agendamentos: ${error.message}`);
    } finally {
      setCarregando(false);
      setCarregandoPagina(false);
    }
  };

  useEffect(() => {
    setCarregando(true);
    fetchAgendamentos(1, filtro);
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
    fetchAgendamentos(1, filtro);
  }, [filtro]);

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
      fetchAgendamentos(novaPagina, filtro);
    }
  };

  const totalPaginas = Math.ceil(totalAgendamentos / limitePorPagina);

  const obterNumerosPaginas = () => {
    const numeros = [];
    const maxVisivel = 5;
    
    if (totalPaginas <= maxVisivel) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      let inicio = Math.max(1, paginaAtual - 2);
      let fim = Math.min(totalPaginas, inicio + maxVisivel - 1);
      
      if (fim - inicio < maxVisivel - 1) {
        inicio = Math.max(1, fim - maxVisivel + 1);
      }
      
      for (let i = inicio; i <= fim; i++) {
        numeros.push(i);
      }
    }
    
    return numeros;
  };

  if (erro) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
          <Calendar className="text-green-400" /> Lista de Agendamentos
        </h2>
        
        <div className="text-center text-red-500 p-8 bg-red-900/20 rounded-lg border border-red-800">
          <AlertCircle className="inline mr-2" size={24} />
          <p className="text-lg mb-4">{erro}</p>
          <button 
            onClick={() => {
              setErro('');
              setCarregando(true);
              fetchAgendamentos(1, filtro);
            }} 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <Calendar className="text-green-400" /> Lista de Agendamentos
      </h2>

      {/* Filtros */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-slate-300">
          Filtrar por:
        </label>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          disabled={carregandoPagina}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50"
        >
          {tiposFiltro.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>
      
      {carregando ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto border-green-500"></div>
          <p className="mt-3 text-slate-400">Carregando agendamentos...</p>
        </div>
      ) : agendamentos.length > 0 ? (
        <>
          {/* Informações da paginação */}
          <div className="mb-4 flex items-center justify-between text-slate-400">
            <p>
              Mostrando {((paginaAtual - 1) * limitePorPagina) + 1} a {Math.min(paginaAtual * limitePorPagina, totalAgendamentos)} de {totalAgendamentos} agendamento(s)
            </p>
            {carregandoPagina && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span className="text-sm">Carregando...</span>
              </div>
            )}
          </div>
          
          {/* Grid de agendamentos - Padronizado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="agendamento-card bg-slate-900 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg"
              >
                {/* Header com altura fixa */}
                <div className="agendamento-header flex items-start justify-between mb-4">
                  <div className="flex-1 pr-3">
                    <h3 className="font-bold text-lg text-white mb-2 leading-tight line-clamp-2" title={agendamento.titulo}>
                      {agendamento.titulo}
                    </h3>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getTipoColor(agendamento.tipo_sessao) }}
                    >
                      {getTipoLabel(agendamento.tipo_sessao)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    ID: {agendamento.id}
                  </span>
                </div>
                
                {/* Conteúdo com altura flexível */}
                <div className="agendamento-content space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar size={16} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm">
                      {formatarData(agendamento.data_hora)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm">
                      {formatarHora(agendamento.data_hora)}
                      {agendamento.duracao_em_minutos && (
                        <span className="text-slate-500 ml-1">
                          ({agendamento.duracao_em_minutos}min)
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={16} className="text-red-400 flex-shrink-0" />
                    <span className="text-sm truncate" title={agendamento.local || 'Local não informado'}>
                      {agendamento.local || 'Local não informado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users size={16} className="text-purple-400 flex-shrink-0" />
                    <span className="text-sm truncate" title={formatarParticipantes(agendamento.participantes)}>
                      {formatarParticipantes(agendamento.participantes)}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-slate-300">
                    <FileText size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm line-clamp-2 leading-tight" title={agendamento.observacoes || 'Sem observações'}>
                      {agendamento.observacoes || 'Sem observações'}
                    </span>
                  </div>
                </div>

                {/* Footer com altura fixa */}
                <div className="agendamento-footer flex gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setAgendamentoSelecionado(agendamento)}
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Ver Detalhes
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 py-6">
              {/* Botão página anterior */}
              <button
                onClick={() => mudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1 || carregandoPagina}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              {/* Números das páginas */}
              <div className="flex gap-1">
                {obterNumerosPaginas().map((numero) => (
                  <button
                    key={numero}
                    onClick={() => mudarPagina(numero)}
                    disabled={carregandoPagina}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors disabled:cursor-not-allowed ${
                      numero === paginaAtual
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {numero}
                  </button>
                ))}
              </div>

              {/* Botão próxima página */}
              <button
                onClick={() => mudarPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas || carregandoPagina}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-slate-500">
          <Calendar size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-lg">Nenhum agendamento encontrado.</p>
          <p className="text-sm mt-2">
            {filtro === 'todos' 
              ? 'Comece criando o primeiro agendamento na aba "Novo Agendamento".'
              : 'Tente alterar o filtro ou criar novos agendamentos.'
            }
          </p>
        </div>
      )}

      {/* Modal de detalhes - Corrigido para viewport */}
      {agendamentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Detalhes do Agendamento</h3>
              <button
                onClick={() => setAgendamentoSelecionado(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Conteúdo do modal - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white text-lg mb-2">{agendamentoSelecionado.titulo}</h4>
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: getTipoColor(agendamentoSelecionado.tipo_sessao) }}
                  >
                    {getTipoLabel(agendamentoSelecionado.tipo_sessao)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg">
                    <Calendar size={20} className="text-blue-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Data</p>
                      <p className="text-white font-medium">{formatarData(agendamentoSelecionado.data_hora)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg">
                    <Clock size={20} className="text-green-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Horário</p>
                      <p className="text-white font-medium">
                        {formatarHora(agendamentoSelecionado.data_hora)}
                        {agendamentoSelecionado.duracao_em_minutos && (
                          <span className="text-slate-400 ml-1">
                            ({agendamentoSelecionado.duracao_em_minutos}min)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {agendamentoSelecionado.local && (
                    <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg md:col-span-2">
                      <MapPin size={20} className="text-red-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Local</p>
                        <p className="text-white font-medium">{agendamentoSelecionado.local}</p>
                      </div>
                    </div>
                  )}
                  
                  {agendamentoSelecionado.participantes && agendamentoSelecionado.participantes.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-slate-900 rounded-lg md:col-span-2">
                      <Users size={20} className="text-purple-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-slate-400 text-sm mb-2">Participantes ({agendamentoSelecionado.participantes.length})</p>
                        <div className="space-y-1">
                          {agendamentoSelecionado.participantes.map((participante, index) => (
                            <p key={index} className="text-white font-medium text-sm">
                              • {participante.nome} {participante.email && `(${participante.email})`}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {agendamentoSelecionado.observacoes && (
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FileText size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Observações</p>
                        <p className="text-white leading-relaxed">{agendamentoSelecionado.observacoes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer do modal */}
            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => setAgendamentoSelecionado(null)}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Fechar
              </button>
              <button
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} />
                Editar
              </button>
              <button
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaAgendamento;