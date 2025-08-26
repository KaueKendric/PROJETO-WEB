import { useEffect, useState, useCallback } from "react";
import { Calendar, Clock, MapPin, Users, FileText, List, X, ChevronLeft, ChevronRight, DollarSign, Edit, Trash2, Check, MoreVertical, AlertCircle, Filter, ChevronDown, Save } from 'lucide-react';
import fetchApi from "../../utils/fetchApi";

function ListarAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [pagina, setPagina] = useState(0);
  const [total, setTotal] = useState(0);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  
  // Estados para modal de confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState(null);
  const [processando, setProcessando] = useState(false);
  
  // Estado para dropdown de ações
  const [menuAberto, setMenuAberto] = useState(null);
  
  // Estados para modal de edição
  const [modalEdicao, setModalEdicao] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});
  
  // Estados para filtros
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [filtroDropdownAberto, setFiltroDropdownAberto] = useState(false);

  // Estado para participantes disponíveis (nome corrigido)
  const [participantesDisponiveis, setParticipantesDisponiveis] = useState([]);

  const limit = 6;

  // Filtros disponíveis
  const filtrosDisponiveis = [
    { value: 'todos', label: 'Todos os Agendamentos', icon: '📋' },
    { value: 'pendente', label: 'Pendentes', icon: '⏳' },
    { value: 'concluido', label: 'Concluídos', icon: '✅' },
    { value: 'reuniao', label: 'Reuniões', icon: '👥' },
    { value: 'consulta', label: 'Consultas', icon: '🏥' },
    { value: 'evento', label: 'Eventos', icon: '🎉' },
    { value: 'compromisso', label: 'Compromissos', icon: '📅' },
    { value: 'outros', label: 'Outros', icon: '📝' },
    { value: 'hoje', label: 'Hoje', icon: '📅' },
    { value: 'semana', label: 'Esta Semana', icon: '🗓️' },
    { value: 'mes', label: 'Este Mês', icon: '🗓️' }
  ];

  // Função para buscar participantes (usando a mesma API que funcionava)
  const buscarParticipantes = useCallback(async () => {
    try {
      console.log('🔍 Buscando participantes...');
      
      // Tentar primeiro o endpoint de participantes
      let response;
      try {
        response = await fetchApi('/api/participantes/?limit=50&skip=0');
        console.log("📡 Participantes carregados:", response);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Se falhar, tentar o endpoint de cadastros como fallback
        console.log('⚠️ Endpoint participantes falhou, tentando cadastros...');
        response = await fetchApi('/api/cadastros/?limit=50&skip=0');
        console.log("📡 Cadastros carregados:", response);
      }
      
      let participantes = [];
      if (response.participantes && Array.isArray(response.participantes)) {
        participantes = response.participantes;
      } else if (response.cadastros && Array.isArray(response.cadastros)) {
        participantes = response.cadastros;
      } else if (Array.isArray(response)) {
        participantes = response;
      }
      
      setParticipantesDisponiveis(participantes);
    } catch (err) {
      console.error("❌ Erro ao buscar participantes:", err);
      setParticipantesDisponiveis([]);
    }
  }, []);

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
    } catch {
      return 'Data inválida';
    }
  };

  const formatarHora = (dataHora) => {
    try {
      const data = new Date(dataHora);
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
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

  // Função principal para buscar agendamentos - usando paginação no backend
  const fetchAgendamentos = useCallback(async (paginaAtual = 0, filtro = 'todos') => {
    try {
      setCarregando(true);
      setErro(null);
      
      const skip = paginaAtual * limit;
      
      // Construir URL com parâmetros corretos - usando paginação adequada
      let url = `/api/agendamentos/?limit=${limit}&skip=${skip}`;
      
      // Adicionar filtro apenas se não for 'todos'
      if (filtro !== 'todos') {
        url += `&filtro=${filtro}`;
      }
      
      console.log("📡 Buscando agendamentos:", url);

      const response = await fetchApi(url);
      console.log("📡 Resposta da API:", response);

      let lista = [];
      let totalCount = 0;

      // Processar resposta da API
      if (response.agendamentos && Array.isArray(response.agendamentos)) {
        lista = response.agendamentos;
        totalCount = response.total || response.agendamentos.length;
      } else if (Array.isArray(response)) {
        lista = response;
        totalCount = response.length;
      } else {
        console.error("❌ Formato inesperado da resposta:", response);
        throw new Error("Formato de resposta inesperado da API");
      }

      setAgendamentos(lista);
      setTotal(totalCount);
      
      console.log(`✅ Agendamentos carregados: ${lista.length}/${totalCount} (página ${paginaAtual + 1})`);
      
    } catch (err) {
      console.error("❌ Erro ao buscar agendamentos:", err);
      setErro(err.message || "Erro ao carregar agendamentos.");
    } finally {
      setCarregando(false);
    }
  }, [limit]);

  // Função para alternar status de concluído
  const alternarConcluido = async (agendamento) => {
    try {
      setProcessando(true);
      const novoStatus = !agendamento.concluido;
      
      const response = await fetchApi(`/api/agendamentos/${agendamento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concluido: novoStatus
        }),
      });

      if (response.id) {
        // Atualizar o agendamento na lista local
        setAgendamentos(agendamentos.map(ag => 
          ag.id === agendamento.id 
            ? { ...ag, concluido: novoStatus }
            : ag
        ));
        
        // Se o modal estiver aberto para este agendamento, atualizar também
        if (agendamentoSelecionado && agendamentoSelecionado.id === agendamento.id) {
          setAgendamentoSelecionado({ ...agendamentoSelecionado, concluido: novoStatus });
        }

        // Se filtro atual é de status, recarregar para manter consistência
        if (filtroAtivo === 'pendente' || filtroAtivo === 'concluido') {
          setTimeout(() => {
            fetchAgendamentos(pagina, filtroAtivo);
          }, 100);
        }

        setErro(null);
      }
    } catch (err) {
      console.error("❌ Erro ao alterar status:", err);
      setErro("Erro ao alterar status do agendamento");
    } finally {
      setProcessando(false);
      setMenuAberto(null);
    }
  };

  // Função para excluir agendamento
  const excluirAgendamento = async (agendamentoId) => {
    try {
      setProcessando(true);
      
      await fetchApi(`/api/agendamentos/${agendamentoId}`, {
        method: 'DELETE',
      });

      // Remover da lista local
      setAgendamentos(agendamentos.filter(ag => ag.id !== agendamentoId));
      setTotal(prev => prev - 1);
      
      // Fechar modal se estiver aberto para este agendamento
      if (agendamentoSelecionado && agendamentoSelecionado.id === agendamentoId) {
        setAgendamentoSelecionado(null);
      }

      // Recarregar lista para ajustar paginação se necessário
      setTimeout(() => {
        fetchAgendamentos(pagina, filtroAtivo);
      }, 100);

      setErro(null);
    } catch (err) {
      console.error("❌ Erro ao excluir agendamento:", err);
      setErro("Erro ao excluir agendamento");
    } finally {
      setProcessando(false);
      setModalConfirmacao(null);
      setMenuAberto(null);
    }
  };

  // Função para editar agendamento
  const editarAgendamento = (agendamento) => {
    // Converter data_hora para formato de input
    const dataHora = new Date(agendamento.data_hora);
    const data = dataHora.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = dataHora.toTimeString().slice(0, 5); // HH:MM
    
    setDadosEdicao({
      id: agendamento.id,
      titulo: agendamento.titulo || '',
      data: data,
      hora: hora,
      tipo_sessao: agendamento.tipo_sessao || 'reuniao',
      local: agendamento.local || '',
      observacoes: agendamento.observacoes || '',
      duracao_em_minutos: agendamento.duracao_em_minutos || 60,
      valor: agendamento.valor || '',
      concluido: agendamento.concluido || false,
      participantes_ids: agendamento.participantes ? agendamento.participantes.map(p => p.id) : []
    });
    
    setModalEdicao(agendamento);
    setMenuAberto(null);
    
    // Buscar participantes disponíveis
    buscarParticipantes();
  };

  // Função para salvar edição
  const salvarEdicao = async () => {
    try {
      setProcessando(true);
      
      // Preparar dados para envio
      const dadosEnvio = {
        titulo: dadosEdicao.titulo,
        data: dadosEdicao.data,
        hora: dadosEdicao.hora,
        tipo_sessao: dadosEdicao.tipo_sessao,
        local: dadosEdicao.local,
        descricao: dadosEdicao.observacoes, 
        duracao_em_minutos: parseInt(dadosEdicao.duracao_em_minutos),
        valor: dadosEdicao.valor ? parseFloat(dadosEdicao.valor) : null,
        concluido: dadosEdicao.concluido,
        participantes_ids: dadosEdicao.participantes_ids || []
      };

      const response = await fetchApi(`/api/agendamentos/${dadosEdicao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosEnvio),
      });

      if (response.id) {
        // Recarregar a lista
        await fetchAgendamentos(pagina, filtroAtivo);
        
        // Fechar modal
        setModalEdicao(null);
        setDadosEdicao({});
        
        setErro(null);
      }
    } catch (err) {
      console.error("❌ Erro ao salvar edição:", err);
      setErro("Erro ao salvar alterações do agendamento");
    } finally {
      setProcessando(false);
    }
  };

  // Função para aplicar filtro
  const aplicarFiltro = (novoFiltro) => {
    console.log(`🔍 Aplicando filtro: ${novoFiltro}`);
    setFiltroAtivo(novoFiltro);
    setPagina(0); 
    setFiltroDropdownAberto(false);
    fetchAgendamentos(0, novoFiltro);
  };

  const selecionarAgendamento = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuAberto(null);
      setFiltroDropdownAberto(false);
    };
    
    if (menuAberto || filtroDropdownAberto) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuAberto, filtroDropdownAberto]);

  // Carregar agendamentos quando a página ou filtro mudarem
  useEffect(() => {
    fetchAgendamentos(pagina, filtroAtivo);
  }, [pagina, fetchAgendamentos, filtroAtivo]);

  // Buscar participantes ao carregar o componente
  useEffect(() => {
    buscarParticipantes();
  }, [buscarParticipantes]);

  const totalPaginas = Math.ceil(total / limit);

  if (carregando) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
          <List className="text-green-400" size={28} />
          Lista de Agendamentos
        </h2>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-green-400"></div>
          <p className="text-white/70 ml-4">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
          <List className="text-green-400" size={28} />
          Lista de Agendamentos
        </h2>
        <div className="mb-8 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-300 flex items-start gap-3 backdrop-blur-sm">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar</p>
            <p className="text-sm text-red-200/80 mt-1">{erro}</p>
            <button 
              onClick={() => fetchAgendamentos(pagina, filtroAtivo)}
              className="mt-2 px-3 py-1 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-sm transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
          <List className="text-green-400" size={28} />
          Lista de Agendamentos
        </h2>
        
        {/* Filtros */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFiltroDropdownAberto(!filtroDropdownAberto);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all duration-300 border border-white/20"
          >
            <Filter size={16} />
            {filtrosDisponiveis.find(f => f.value === filtroAtivo)?.label || 'Filtrar'}
            <ChevronDown size={16} className={`transition-transform ${filtroDropdownAberto ? 'rotate-180' : ''}`} />
          </button>

          {filtroDropdownAberto && (
            <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl z-20 min-w-64 max-h-80 overflow-y-auto">
              <div className="py-2">
                {filtrosDisponiveis.map((filtro) => (
                  <button
                    key={filtro.value}
                    onClick={() => aplicarFiltro(filtro.value)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-3 ${
                      filtroAtivo === filtro.value 
                        ? 'bg-green-500/20 text-green-300 border-r-2 border-green-400' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{filtro.icon}</span>
                    {filtro.label}
                    {filtroAtivo === filtro.value && <Check size={14} className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {agendamentos.length === 0 ? (
        <div className="text-center py-16">
          <List size={64} className="mx-auto mb-6 text-white/20" />
          <h3 className="text-2xl font-bold text-white mb-3">Nenhum agendamento encontrado</h3>
          <p className="text-white/60 max-w-md mx-auto">
            {filtroAtivo === 'todos' 
              ? 'Não há agendamentos cadastrados no momento.' 
              : `Não há agendamentos com o filtro "${filtrosDisponiveis.find(f => f.value === filtroAtivo)?.label}" no momento.`
            }
          </p>
        </div>
      ) : (
        <>
          {/* Informações da paginação */}
          <div className="mb-6">
            <p className="text-white/70 text-sm">
              Mostrando {agendamentos.length} de {total} agendamentos • Página {pagina + 1} de {totalPaginas || 1}
              {filtroAtivo !== 'todos' && (
                <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                  Filtro: {filtrosDisponiveis.find(f => f.value === filtroAtivo)?.label}
                </span>
              )}
            </p>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105 relative"
              >
                {/* Botão de ações no canto superior direito */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAberto(menuAberto === agendamento.id ? null : agendamento.id);
                    }}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                    disabled={processando}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown de ações */}
                  {menuAberto === agendamento.id && (
                    <div className="absolute right-0 top-8 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl z-10 min-w-48">
                      <div className="py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alternarConcluido(agendamento);
                          }}
                          disabled={processando}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
                        >
                          <Check size={16} className={agendamento.concluido ? "text-yellow-400" : "text-green-400"} />
                          {agendamento.concluido ? 'Marcar como Pendente' : 'Marcar como Concluído'}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editarAgendamento(agendamento);
                          }}
                          disabled={processando}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
                        >
                          <Edit size={16} className="text-blue-400" />
                          Editar Agendamento
                        </button>
                        
                        <hr className="my-1 border-slate-600/50" />
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalConfirmacao({
                              tipo: 'excluir',
                              agendamento: agendamento,
                              mensagem: `Tem certeza que deseja excluir o agendamento "${agendamento.titulo}"?`
                            });
                          }}
                          disabled={processando}
                          className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-3 disabled:opacity-50"
                        >
                          <Trash2 size={16} className="text-red-400" />
                          Excluir Agendamento
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conteúdo do card (clicável) */}
                <div 
                  onClick={() => selecionarAgendamento(agendamento)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3 pr-8">
                    <h4 className="font-bold text-white truncate group-hover:text-green-200 transition-colors">
                      {agendamento.titulo}
                    </h4>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-lg text-xs border border-green-400/30">
                      ID: {agendamento.id}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getTipoColor(agendamento.tipo_sessao) }}
                      ></div>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white border"
                        style={{
                          backgroundColor: getTipoColor(agendamento.tipo_sessao) + '20',
                          borderColor: getTipoColor(agendamento.tipo_sessao) + '30'
                        }}
                      >
                        {getTipoLabel(agendamento.tipo_sessao)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        agendamento.concluido 
                          ? 'bg-green-500/20 text-green-300 border-green-400/30'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                      }`}>
                        {agendamento.concluido ? '✅ Concluído' : '⏳ Pendente'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar size={14} className="text-blue-400" />
                      <span className="text-sm">{formatarData(agendamento.data_hora)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock size={14} className="text-green-400" />
                      <span className="text-sm">{formatarHora(agendamento.data_hora)}</span>
                    </div>
                    {agendamento.local && (
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin size={14} className="text-red-400" />
                        <span className="text-sm truncate">{agendamento.local}</span>
                      </div>
                    )}
                    {agendamento.participantes && agendamento.participantes.length > 0 && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Users size={14} className="text-purple-400" />
                        <span className="text-sm truncate">{formatarParticipantes(agendamento.participantes)}</span>
                      </div>
                    )}
                    {agendamento.valor && (
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="text-green-400 text-sm">💰</span>
                        <span className="text-sm font-medium text-green-300">
                          {typeof agendamento.valor === 'number' 
                            ? `R$ ${agendamento.valor.toFixed(2).replace('.', ',')}` 
                            : agendamento.valor
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-green-400 text-xs font-medium group-hover:text-green-300 transition-colors">
                      Clique para ver detalhes completos
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-center gap-4">
            <button
              disabled={pagina === 0}
              onClick={() => setPagina((p) => p - 1)}
              className="flex items-center gap-2 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:hover:bg-white/10"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPaginas || 1) }, (_, i) => {
                let pageNum;
                if (totalPaginas <= 5) {
                  pageNum = i;
                } else if (pagina < 2) {
                  pageNum = i;
                } else if (pagina >= totalPaginas - 2) {
                  pageNum = totalPaginas - 5 + i;
                } else {
                  pageNum = pagina - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagina(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                      pagina === pageNum
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              disabled={(pagina + 1) * limit >= total}
              onClick={() => setPagina((p) => p + 1)}
              className="flex items-center gap-2 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:hover:bg-white/10"
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* Modal de Confirmação */}
      {modalConfirmacao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-red-400" />
              <h3 className="text-xl font-bold text-white">Confirmar Ação</h3>
            </div>
            
            <p className="text-white/80 mb-6">
              {modalConfirmacao.mensagem}
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalConfirmacao(null)}
                disabled={processando}
                className="px-4 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-600/80 text-white font-medium transition-all duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalConfirmacao.tipo === 'excluir') {
                    excluirAgendamento(modalConfirmacao.agendamento.id);
                  }
                }}
                disabled={processando}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {processando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Excluindo...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {agendamentoSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalhes do Agendamento</h3>
              <div className="flex items-center gap-3">
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
                  ID: {agendamentoSelecionado.id}
                </span>
                <button
                  onClick={() => setAgendamentoSelecionado(null)}
                  className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-600/80 text-white transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-white text-2xl mb-3">{agendamentoSelecionado.titulo}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTipoColor(agendamentoSelecionado.tipo_sessao) }}
                ></div>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white border"
                  style={{
                    backgroundColor: getTipoColor(agendamentoSelecionado.tipo_sessao) + '20',
                    borderColor: getTipoColor(agendamentoSelecionado.tipo_sessao) + '30'
                  }}
                >
                  {getTipoLabel(agendamentoSelecionado.tipo_sessao)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  agendamentoSelecionado.concluido 
                    ? 'bg-green-500/20 text-green-300 border-green-400/30'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                }`}>
                  {agendamentoSelecionado.concluido ? '✅ Concluído' : '⏳ Pendente'}
                </span>
                {agendamentoSelecionado.status && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white border bg-blue-500/20 border-blue-400/30">
                    {agendamentoSelecionado.status}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={20} className="text-blue-400" />
                  <span className="text-white/60 text-sm font-medium">Data</span>
                </div>
                <p className="text-white font-semibold text-lg">{formatarData(agendamentoSelecionado.data_hora)}</p>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={20} className="text-green-400" />
                  <span className="text-white/60 text-sm font-medium">Horário</span>
                </div>
                <p className="text-white font-medium">
                  {formatarHora(agendamentoSelecionado.data_hora)}
                  {agendamentoSelecionado.duracao_em_minutos && (
                    <span className="text-white/60 ml-1">
                      ({agendamentoSelecionado.duracao_em_minutos}min)
                    </span>
                  )}
                </p>
              </div>

              {agendamentoSelecionado.local && (
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={20} className="text-red-400" />
                    <span className="text-white/60 text-sm font-medium">Local</span>
                  </div>
                  <p className="text-white font-medium">{agendamentoSelecionado.local}</p>
                </div>
              )}

              {agendamentoSelecionado.valor !== undefined && agendamentoSelecionado.valor !== null && (
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-green-400">💰</span>
                    <span className="text-white/60 text-sm font-medium">Valor</span>
                  </div>
                  <p className="text-white font-medium text-lg">R$ {parseFloat(agendamentoSelecionado.valor).toFixed(2)}</p>
                </div>
              )}

              {agendamentoSelecionado.participantes && agendamentoSelecionado.participantes.length > 0 && (
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={20} className="text-purple-400" />
                    <span className="text-white/60 text-sm font-medium">Participantes ({agendamentoSelecionado.participantes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {agendamentoSelecionado.participantes.slice(0, 5).map((participante, index) => (
                      <p key={index} className="text-white font-medium text-sm">
                        • {participante.nome} {participante.email && `(${participante.email})`}
                      </p>
                    ))}
                    {agendamentoSelecionado.participantes.length > 5 && (
                      <p className="text-white/60 text-sm">
                        ... e mais {agendamentoSelecionado.participantes.length - 5} participante(s)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {agendamentoSelecionado.observacoes && (
              <div className="mt-6 bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-start gap-3">
                  <FileText size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white/60 text-sm font-medium block mb-2">Observações</span>
                    <p className="text-white leading-relaxed">{agendamentoSelecionado.observacoes}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-600/50 flex justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    alternarConcluido(agendamentoSelecionado);
                  }}
                  disabled={processando}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2 ${
                    agendamentoSelecionado.concluido
                      ? 'bg-yellow-600/80 hover:bg-yellow-700/80 text-white'
                      : 'bg-green-600/80 hover:bg-green-700/80 text-white'
                  }`}
                >
                  <Check size={16} />
                  {processando ? 'Atualizando...' : (agendamentoSelecionado.concluido ? 'Marcar como Pendente' : 'Marcar como Concluído')}
                </button>
                
                <button
                  onClick={() => editarAgendamento(agendamentoSelecionado)}
                  disabled={processando}
                  className="px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-700/80 text-white font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  <Edit size={16} />
                  Editar
                </button>
                
                <button
                  onClick={() => {
                    setModalConfirmacao({
                      tipo: 'excluir',
                      agendamento: agendamentoSelecionado,
                      mensagem: `Tem certeza que deseja excluir o agendamento "${agendamentoSelecionado.titulo}"?`
                    });
                  }}
                  disabled={processando}
                  className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-700/80 text-white font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
              
              <button
                onClick={() => setAgendamentoSelecionado(null)}
                className="py-2 px-4 rounded-xl bg-slate-700/80 hover:bg-slate-600/80 text-white font-medium transition-all duration-300 border border-slate-600/50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {modalEdicao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Agendamento</h3>
              <button
                onClick={() => {
                  setModalEdicao(null);
                  setDadosEdicao({});
                }}
                className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-600/80 text-white transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={dadosEdicao.titulo}
                  onChange={(e) => setDadosEdicao({...dadosEdicao, titulo: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 transition-colors"
                  placeholder="Digite o título do agendamento"
                  required
                />
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={dadosEdicao.data}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, data: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-400/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={dadosEdicao.hora}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, hora: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-400/50 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Tipo de Sessão e Duração */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Tipo de Sessão
                  </label>
                  <select
                    value={dadosEdicao.tipo_sessao}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, tipo_sessao: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-400/50 transition-colors"
                  >
                    <option value="reuniao">Reunião</option>
                    <option value="consulta">Consulta</option>
                    <option value="evento">Evento</option>
                    <option value="compromisso">Compromisso</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    value={dadosEdicao.duracao_em_minutos}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, duracao_em_minutos: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 transition-colors"
                    min="1"
                    max="1440"
                  />
                </div>
              </div>

              {/* Local e Valor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Local
                  </label>
                  <input
                    type="text"
                    value={dadosEdicao.local}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, local: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 transition-colors"
                    placeholder="Digite o local"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosEdicao.valor}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, valor: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 transition-colors"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Participantes */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Participantes
                </label>
                <select
                  multiple
                  value={dadosEdicao.participantes_ids || []}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setDadosEdicao({...dadosEdicao, participantes_ids: selectedIds});
                  }}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-400/50 transition-colors min-h-20"
                >
                  {participantesDisponiveis.map((participante) => (
                    <option key={participante.id} value={participante.id}>
                      {participante.nome} ({participante.email})
                    </option>
                  ))}
                </select>
                <p className="text-white/50 text-xs mt-1">Segure Ctrl/Cmd para selecionar múltiplos participantes</p>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Observações
                </label>
                <textarea
                  value={dadosEdicao.observacoes}
                  onChange={(e) => setDadosEdicao({...dadosEdicao, observacoes: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 transition-colors resize-vertical"
                  rows="3"
                  placeholder="Digite observações sobre o agendamento"
                />
              </div>

              {/* Status Concluído */}
              <div>
                <label className="flex items-center gap-3 text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dadosEdicao.concluido}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, concluido: e.target.checked})}
                    className="w-4 h-4 rounded bg-slate-700/50 border border-slate-600/50 text-green-400 focus:ring-green-400/50"
                  />
                  <span className="text-sm font-medium">Marcar como concluído</span>
                </label>
              </div>
            </form>

            {/* Botões */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-600/50">
              <button
                onClick={() => {
                  setModalEdicao(null);
                  setDadosEdicao({});
                }}
                disabled={processando}
                className="px-4 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-600/80 text-white font-medium transition-all duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={processando || !dadosEdicao.titulo || !dadosEdicao.data || !dadosEdicao.hora}
                className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListarAgendamentos;