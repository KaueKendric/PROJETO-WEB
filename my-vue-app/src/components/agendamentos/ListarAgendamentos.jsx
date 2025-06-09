import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, FileText, AlertCircle, Edit2, Trash2, Eye, X } from 'lucide-react';

function ListaAgendamento() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

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

  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora) => {
    return hora.slice(0, 5);
  };

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const response = await fetch('http://localhost:8000/agendamentos/');
        if (!response.ok) {
          throw new Error('Erro ao buscar agendamentos');
        }
        const data = await response.json();
        setAgendamentos(data);
      } catch (error) {
        setErro('Erro ao buscar agendamentos: ' + error.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchAgendamentos();
  }, []);

  const filtrarAgendamentos = () => {
    if (filtro === 'todos') return agendamentos;
    
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.data + 'T00:00:00');
      
      switch (filtro) {
        case 'hoje':
          return dataAgendamento.toDateString() === hoje.toDateString();
        case 'semana':
          return dataAgendamento >= inicioSemana;
        case 'mes':
          return dataAgendamento >= inicioMes;
        default:
          return agendamento.tipo === filtro;
      }
    });
  };

  const agendamentosFiltrados = filtrarAgendamentos();

  if (erro) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
          <Calendar className="text-green-400" /> Lista de Agendamentos
        </h2>
        <div className="text-center text-red-500 p-8 bg-red-900/20 rounded-lg border border-red-800">
          <AlertCircle className="inline mr-2" size={24} />
          <p className="text-lg">{erro}</p>
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
          className="px-4 py-2 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
      ) : agendamentosFiltrados.length > 0 ? (
        <>
          <div className="mb-4 text-slate-400">
            <p>
              {filtro === 'todos' ? 'Total' : 'Filtrados'}: 
              <span className="font-bold text-white ml-1">{agendamentosFiltrados.length}</span> agendamento(s)
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {agendamentosFiltrados.map((agendamento) => (
              <div
                key={agendamento.id}
                className="bg-slate-900 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-1">
                      {agendamento.titulo}
                    </h3>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getTipoColor(agendamento.tipo) }}
                    >
                      {getTipoLabel(agendamento.tipo)}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    ID: {agendamento.id}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar size={16} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm">
                      {formatarData(agendamento.data)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm">
                      {formatarHora(agendamento.hora_inicio)} - {formatarHora(agendamento.hora_fim)}
                    </span>
                  </div>
                  
                  {agendamento.local && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={16} className="text-red-400 flex-shrink-0" />
                      <span className="text-sm truncate" title={agendamento.local}>
                        {agendamento.local}
                      </span>
                    </div>
                  )}
                  
                  {agendamento.participantes && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users size={16} className="text-purple-400 flex-shrink-0" />
                      <span className="text-sm truncate" title={agendamento.participantes}>
                        {agendamento.participantes}
                      </span>
                    </div>
                  )}
                  
                  {agendamento.descricao && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <FileText size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm line-clamp-2">
                        {agendamento.descricao}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
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

      {/* Modal de detalhes */}
      {agendamentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalhes do Agendamento</h3>
              <button
                onClick={() => setAgendamentoSelecionado(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-lg mb-2">{agendamentoSelecionado.titulo}</h4>
                <span 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getTipoColor(agendamentoSelecionado.tipo) }}
                >
                  {getTipoLabel(agendamentoSelecionado.tipo)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                  <Calendar size={20} className="text-blue-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Data</p>
                    <p className="text-white font-medium">{formatarData(agendamentoSelecionado.data)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                  <Clock size={20} className="text-green-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Horário</p>
                    <p className="text-white font-medium">
                      {formatarHora(agendamentoSelecionado.hora_inicio)} - {formatarHora(agendamentoSelecionado.hora_fim)}
                    </p>
                  </div>
                </div>
                
                {agendamentoSelecionado.local && (
                  <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                    <MapPin size={20} className="text-red-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Local</p>
                      <p className="text-white font-medium">{agendamentoSelecionado.local}</p>
                    </div>
                  </div>
                )}
                
                {agendamentoSelecionado.participantes && (
                  <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                    <Users size={20} className="text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Participantes</p>
                      <p className="text-white font-medium">{agendamentoSelecionado.participantes}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {agendamentoSelecionado.descricao && (
                <div className="p-3 bg-slate-900 rounded-lg">
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
            
            <div className="flex gap-3 mt-6">
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