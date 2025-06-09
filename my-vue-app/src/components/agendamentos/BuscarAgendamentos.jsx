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
    { value: '', label: 'Todos os tipos' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'evento', label: 'Evento' },
    { value: 'compromisso', label: 'Compromisso Pessoal' },
    { value: 'outros', label: 'Outros' }
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
        <Search className="text-green-400" /> Buscar Agendamento
      </h2>

      {/* Barra de pesquisa principal */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite o ID, título, descrição, local ou participantes"
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <p className="text-sm text-slate-400 mt-1">
              Dica: Digite um número para buscar por ID ou texto para busca geral
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFiltrosAtivos(!filtrosAtivos)}
              className={`py-3 px-4 rounded-lg font-bold text-white transition-colors flex items-center gap-2 ${
                filtrosAtivos ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'
              }`}
            >
              <Filter size={20} />
              Filtros
            </button>
            
            <button
              onClick={buscarAgendamentos}
              disabled={carregando}
              className="py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {carregando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search size={20} />
              )}
              {carregando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros avançados */}
      {filtrosAtivos && (
        <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Filter size={18} />
            Filtros Avançados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                <Calendar size={16} className="inline mr-2" />
                Data Específica
              </label>
              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border-2 border-slate-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">
                <FileText size={16} className="inline mr-2" />
                Tipo de Agendamento
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border-2 border-slate-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                {tiposBusca.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={limparBusca}
              className="py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/50 text-red-400 border border-red-800 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      {/* Agendamento selecionado - detalhes completos */}
      {agendamentoSelecionado && (
        <div className="mb-6 bg-slate-900 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Detalhes do Agendamento</h3>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              ID: {agendamentoSelecionado.id}
            </span>
          </div>
          
          <div className="mb-4">
            <h4 className="font-bold text-white text-lg mb-2">{agendamentoSelecionado.titulo}</h4>
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: getTipoColor(agendamentoSelecionado.tipo) }}
            >
              {getTipoLabel(agendamentoSelecionado.tipo)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              <Calendar size={20} className="text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Data</p>
                <p className="text-white font-medium">{formatarData(agendamentoSelecionado.data)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              <Clock size={20} className="text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Horário</p>
                <p className="text-white font-medium">
                  {formatarHora(agendamentoSelecionado.hora_inicio)} - {formatarHora(agendamentoSelecionado.hora_fim)}
                </p>
              </div>
            </div>
            
            {agendamentoSelecionado.local && (
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <MapPin size={20} className="text-red-400" />
                <div>
                  <p className="text-slate-400 text-sm">Local</p>
                  <p className="text-white font-medium">{agendamentoSelecionado.local}</p>
                </div>
              </div>
            )}
            
            {agendamentoSelecionado.participantes && (
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <Users size={20} className="text-purple-400" />
                <div>
                  <p className="text-slate-400 text-sm">Participantes</p>
                  <p className="text-white font-medium">{agendamentoSelecionado.participantes}</p>
                </div>
              </div>
            )}
          </div>
          
          {agendamentoSelecionado.descricao && (
            <div className="mt-4 p-3 bg-slate-800 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-sm mb-2">Descrição</p>
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
          <h3 className="text-xl font-bold text-white mb-4">
            Resultados da Busca ({resultados.length} encontrado{resultados.length > 1 ? 's' : ''})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultados.map((resultado) => (
              <div
                key={resultado.id}
                onClick={() => selecionarAgendamento(resultado)}
                className="bg-slate-900 rounded-lg p-4 border border-slate-700 cursor-pointer hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white truncate">{resultado.titulo}</h4>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                    ID: {resultado.id}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span 
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getTipoColor(resultado.tipo) }}
                  >
                    {getTipoLabel(resultado.tipo)}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-slate-400">
                  <p><Calendar size={14} className="inline mr-2" />{formatarData(resultado.data)}</p>
                  <p><Clock size={14} className="inline mr-2" />{formatarHora(resultado.hora_inicio)} - {formatarHora(resultado.hora_fim)}</p>
                  {resultado.local && <p className="truncate"><MapPin size={14} className="inline mr-2" />{resultado.local}</p>}
                </div>
                
                <div className="mt-3 text-xs text-green-400">
                  Clique para ver detalhes completos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio quando não há pesquisa */}
      {!searchTerm && !filtroData && !filtroTipo && !agendamentoSelecionado && resultados.length === 0 && !erro && (
        <div className="text-center py-12 text-slate-500">
          <Search size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-lg mb-2">Busque por um agendamento específico</p>
          <p className="text-sm mb-4">
            Use o campo acima para pesquisar por ID, título, descrição, local ou participantes
          </p>
          <button
            onClick={() => setFiltrosAtivos(true)}
            className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2 mx-auto"
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