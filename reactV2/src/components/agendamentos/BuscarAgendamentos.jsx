import { useState } from 'react';
import { Search, AlertCircle, Calendar, Clock, MapPin, Users, FileText, Filter, X } from 'lucide-react';

function BuscarAgendamento() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState(false);

  const tiposBusca = [
    { value: '', label: 'Todos os tipos', color: '#6b7280' },
    { value: 'reuniao', label: 'Reunião', color: '#3b82f6' },
    { value: 'consulta', label: 'Consulta', color: '#10b981' },
    { value: 'evento', label: 'Evento', color: '#8b5cf6' },
    { value: 'compromisso', label: 'Compromisso Pessoal', color: '#f59e0b' },
    { value: 'outros', label: 'Outros', color: '#6b7280' }
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

  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora) => {
    return hora.slice(0, 5);
  };

  const buscarAgendamentos = async () => {
    if (!searchTerm.trim() && !filtroData && !filtroTipo) {
      setErro('Por favor, preencha pelo menos um campo de busca.');
      return;
    }

    setResultados([]);
    setAgendamentoSelecionado(null);
    setErro('');
    setCarregando(true);

    try {
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      let data;

      if (isNumeric && searchTerm.trim()) {
        // Busca por ID específico
        const response = await fetch(`http://localhost:8000/agendamentos/${searchTerm.trim()}`);
        if (response.status === 404) {
          throw new Error('Agendamento não encontrado com este ID.');
        }
        if (!response.ok) {
          throw new Error('Erro ao buscar agendamento por ID.');
        }
        data = [await response.json()];
      } else {
        // Busca geral com filtros
        const response = await fetch('http://localhost:8000/agendamentos/');
        if (!response.ok) {
          throw new Error('Erro ao buscar lista de agendamentos.');
        }
        const todos = await response.json();
        
        data = todos.filter(agendamento => {
          // Filtro por texto (título, descrição, local, participantes)
          const matchTexto = !searchTerm.trim() || 
            agendamento.titulo.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
            (agendamento.descricao && agendamento.descricao.toLowerCase().includes(searchTerm.trim().toLowerCase())) ||
            (agendamento.local && agendamento.local.toLowerCase().includes(searchTerm.trim().toLowerCase())) ||
            (agendamento.participantes && agendamento.participantes.toLowerCase().includes(searchTerm.trim().toLowerCase()));

          // Filtro por data
          const matchData = !filtroData || agendamento.data === filtroData;

          // Filtro por tipo
          const matchTipo = !filtroTipo || agendamento.tipo === filtroTipo;

          return matchTexto && matchData && matchTipo;
        });
      }

      if (data.length === 0) {
        setErro('Nenhum agendamento encontrado com os critérios de busca.');
      } else if (data.length === 1) {
        setAgendamentoSelecionado(data[0]);
      } else {
        setResultados(data);
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarAgendamentos();
    }
  };

  const selecionarAgendamento = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setResultados([]);
  };

  const limparBusca = () => {
    setSearchTerm('');
    setFiltroData('');
    setFiltroTipo('');
    setResultados([]);
    setAgendamentoSelecionado(null);
    setErro('');
    setFiltrosAtivos(false);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <Search className="text-green-400" size={28} />
        Buscar Agendamento
      </h2>

      {/* Barra de pesquisa principal */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative group">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 group-focus-within:text-green-300 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite o ID, título, descrição, local ou participantes"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm hover:bg-white/10"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setFiltrosAtivos(!filtrosAtivos)}
              className={`py-4 px-6 rounded-2xl font-medium text-white transition-all duration-300 flex items-center gap-2 border ${
                filtrosAtivos 
                  ? 'bg-green-600/20 border-green-400/50 text-green-300' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <Filter size={20} />
              Filtros
            </button>
            
            <button
              onClick={buscarAgendamentos}
              disabled={carregando}
              className="group relative py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center gap-3 transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-xl overflow-hidden"
            >
              {/* Brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <div className="relative flex items-center gap-3">
                {carregando ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                ) : (
                  <Search size={20} />
                )}
                {carregando ? 'Buscando...' : 'Buscar'}
              </div>
            </button>
          </div>
        </div>
        
        <p className="text-white/50 text-sm mt-3 ml-1">
          💡 Dica: Digite um número para buscar por ID ou texto para busca geral
        </p>
      </div>

      {/* Filtros avançados */}
      {filtrosAtivos && (
        <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Filter size={18} className="text-green-400" />
            Filtros Avançados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
                <Calendar size={16} className="text-green-400" />
                Data Específica
              </label>
              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
                <FileText size={16} className="text-green-400" />
                Tipo de Agendamento
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
              >
                {tiposBusca.map((tipo) => (
                  <option key={tipo.value} value={tipo.value} className="bg-slate-800">
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={limparBusca}
              className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 border border-white/20"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-300 flex items-start gap-3 backdrop-blur-sm">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro na busca</p>
            <p className="text-sm text-red-200/80 mt-1">{erro}</p>
          </div>
        </div>
      )}

      {/* Agendamento selecionado - detalhes completos */}
      {agendamentoSelecionado && (
        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Detalhes do Agendamento</h3>
            <div className="flex items-center gap-3">
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
                Encontrado
              </span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
                ID: {agendamentoSelecionado.id}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-bold text-white text-2xl mb-3">{agendamentoSelecionado.titulo}</h4>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getTipoColor(agendamentoSelecionado.tipo) }}
              ></div>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white border"
                style={{ 
                  backgroundColor: getTipoColor(agendamentoSelecionado.tipo) + '20',
                  borderColor: getTipoColor(agendamentoSelecionado.tipo) + '30'
                }}
              >
                {getTipoLabel(agendamentoSelecionado.tipo)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={20} className="text-blue-400" />
                <span className="text-white/60 text-sm font-medium">Data</span>
              </div>
              <p className="text-white font-semibold text-lg">{formatarData(agendamentoSelecionado.data)}</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={20} className="text-green-400" />
                <span className="text-white/60 text-sm font-medium">Horário</span>
              </div>
              <p className="text-white font-medium">
                {formatarHora(agendamentoSelecionado.hora_inicio)} - {formatarHora(agendamentoSelecionado.hora_fim)}
              </p>
            </div>
            
            {agendamentoSelecionado.local && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-red-400" />
                  <span className="text-white/60 text-sm font-medium">Local</span>
                </div>
                <p className="text-white font-medium">{agendamentoSelecionado.local}</p>
              </div>
            )}
            
            {agendamentoSelecionado.participantes && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={20} className="text-purple-400" />
                  <span className="text-white/60 text-sm font-medium">Participantes</span>
                </div>
                <p className="text-white font-medium">{agendamentoSelecionado.participantes}</p>
              </div>
            )}
          </div>
          
          {agendamentoSelecionado.descricao && (
            <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white/60 text-sm font-medium block mb-2">Descrição</span>
                  <p className="text-white">{agendamentoSelecionado.descricao}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de resultados múltiplos */}
      {resultados.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Filter className="text-green-400" />
            Resultados da Busca ({resultados.length} encontrado{resultados.length > 1 ? 's' : ''})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultados.map((resultado) => (
              <div
                key={resultado.id}
                onClick={() => selecionarAgendamento(resultado)}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white truncate group-hover:text-green-200 transition-colors">
                    {resultado.titulo}
                  </h4>
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-lg text-xs border border-green-400/30">
                    ID: {resultado.id}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: getTipoColor(resultado.tipo) }}
                    ></div>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ 
                        backgroundColor: getTipoColor(resultado.tipo) + '20',
                        borderColor: getTipoColor(resultado.tipo) + '30'
                      }}
                    >
                      {getTipoLabel(resultado.tipo)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar size={14} className="text-blue-400" />
                    <span className="text-sm">{formatarData(resultado.data)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock size={14} className="text-green-400" />
                    <span className="text-sm">{formatarHora(resultado.hora_inicio)} - {formatarHora(resultado.hora_fim)}</span>
                  </div>
                  {resultado.local && (
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin size={14} className="text-red-400" />
                      <span className="text-sm truncate">{resultado.local}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-green-400 text-xs font-medium group-hover:text-green-300 transition-colors">
                    Clique para ver detalhes completos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!searchTerm && !filtroData && !filtroTipo && !agendamentoSelecionado && resultados.length === 0 && !erro && (
        <div className="text-center py-16">
          <Search size={64} className="mx-auto mb-6 text-white/20" />
          <h3 className="text-2xl font-bold text-white mb-3">Busque por um agendamento específico</h3>
          <p className="text-white/60 max-w-md mx-auto mb-6">
            Use o campo acima para pesquisar por ID, título, descrição, local ou participantes. 
            Os resultados aparecerão aqui de forma organizada.
          </p>
          <button
            onClick={() => setFiltrosAtivos(true)}
            className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2 mx-auto hover:bg-white/5 px-4 py-2 rounded-xl"
          >
            <Filter size={16} />
            Usar filtros avançados
          </button>
        </div>
      )}
    </div>
  );
}

export default BuscarAgendamento;