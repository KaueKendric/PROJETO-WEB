import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, X, Check, Search, AlertCircle, Save } from 'lucide-react';
import fetchApi from '../../utils/fetchApi';

function CriarAgendamento() {
  const [agendamento, setAgendamento] = useState({
    titulo: '',
    data: '',
    hora: '',
    local: '',
    descricao: '',
    participantes: [],
    tipo: 'reuniao' // Valor padrão
  });

  const [cadastros, setCadastros] = useState([]);
  const [carregandoCadastros, setCarregandoCadastros] = useState(true);
  const [buscaParticipante, setBuscaParticipante] = useState('');
  const [mostrarListaParticipantes, setMostrarListaParticipantes] = useState(false);
  const [carregandoSalvar, setCarregandoSalvar] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const inputParticipanteRef = useRef(null);
  const listaParticipantesRef = useRef(null);

  // Opções de tipo de agendamento
  const tiposAgendamento = [
    { value: 'reuniao', label: 'Reunião', icon: '👥' },
    { value: 'consulta', label: 'Consulta', icon: '🩺' },
    { value: 'evento', label: 'Evento', icon: '🎉' },
    { value: 'outros', label: 'Outros', icon: '📋' }
  ];

  // Buscar cadastros do backend - URL CORRIGIDA
  useEffect(() => {
    const fetchCadastros = async () => {
      try {
        const response = await fetchApi('/api/cadastros'); // URL CORRIGIDA
        console.log("Cadastro",response)
        if (!response) {
          
          throw new Error('Erro ao buscar cadastros');
        }
        const data = response;
        setCadastros(data);
      } catch (error) {
        console.error('Erro ao buscar cadastros:', error);
        setMensagem({ tipo: 'erro', texto: 'Erro ao carregar lista de pessoas cadastradas' });
      } finally {
        setCarregandoCadastros(false);
      }
    };

    fetchCadastros();
  }, []);

  // Fechar lista ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listaParticipantesRef.current && !listaParticipantesRef.current.contains(event.target)) {
        setMostrarListaParticipantes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar cadastros para busca de participantes
  const cadastrosFiltrados = cadastros.filter(cadastro =>
    !agendamento.participantes.some(p => p.id === cadastro.id) &&
    (cadastro.nome.toLowerCase().includes(buscaParticipante.toLowerCase()) ||
      cadastro.email.toLowerCase().includes(buscaParticipante.toLowerCase()))
  );

  const handleInputChange = (campo, valor) => {
    setAgendamento(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const adicionarParticipante = (cadastro) => {
    setAgendamento(prev => ({
      ...prev,
      participantes: [...prev.participantes, cadastro]
    }));
    setBuscaParticipante('');
    setMostrarListaParticipantes(false);
  };

  const removerParticipante = (id) => {
    setAgendamento(prev => ({
      ...prev,
      participantes: prev.participantes.filter(p => p.id !== id)
    }));
  };

  const validarFormulario = () => {
    if (!agendamento.titulo.trim()) {
      setMensagem({ tipo: 'erro', texto: 'O título é obrigatório' });
      return false;
    }
    if (!agendamento.data) {
      setMensagem({ tipo: 'erro', texto: 'A data é obrigatória' });
      return false;
    }
    if (!agendamento.hora) {
      setMensagem({ tipo: 'erro', texto: 'A hora é obrigatória' });
      return false;
    }
    if (!agendamento.tipo) {
      setMensagem({ tipo: 'erro', texto: 'O tipo de agendamento é obrigatório' });
      return false;
    }
    return true;
  };

  const salvarAgendamento = async () => {
    if (!validarFormulario()) return;

    setCarregandoSalvar(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      // Combinar data e hora em um único DateTime
      const dataHora = `${agendamento.data}T${agendamento.hora}:00`;
      
      const dadosAgendamento = {
        titulo: agendamento.titulo,
        data_hora: dataHora, // Campo correto do modelo
        usuario_id: 1, // TEMPORÁRIO - você precisa definir qual usuário está criando
        local: agendamento.local || null,
        observacoes: agendamento.descricao || null, // Campo correto do modelo
        participantes_ids: agendamento.participantes.map(p => p.id),
        tipo_sessao: agendamento.tipo,
        duracao_em_minutos: 60,
        status: "agendado" // Status padrão
      };

      console.log('📤 Enviando agendamento:', dadosAgendamento);
      console.log('🔍 Data/Hora combinada:', dataHora);

      const response = await fetchApi('/api/agendamentos/', { // URL CORRIGIDA
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosAgendamento)
      });
      console.log("agendamentos", response)

      if (!response) {
        const errorData = response;
        throw new Error(errorData.detail || 'Erro ao salvar agendamento');
      }

      const resultado = response;
      console.log('✅ Agendamento criado:', resultado);

      setMensagem({ tipo: 'sucesso', texto: 'Agendamento criado com sucesso!' });

      // Limpar formulário
      setAgendamento({
        titulo: '',
        data: '',
        hora: '',
        local: '',
        descricao: '',
        participantes: [],
        tipo: 'reuniao'
      });

    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      setMensagem({
        tipo: 'erro',
        texto: `Erro ao salvar agendamento: ${error.message}`
      });
    } finally {
      setCarregandoSalvar(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <Plus className="text-green-400" size={28} />
        Novo Agendamento
      </h2>

      {/* Mensagens */}
      {mensagem.texto && (
        <div className={`mb-6 p-4 rounded-2xl border backdrop-blur-sm flex items-center gap-3 ${mensagem.tipo === 'sucesso'
          ? 'bg-green-500/20 border-green-400/30 text-green-300'
          : 'bg-red-500/20 border-red-400/30 text-red-300'
          }`}>
          {mensagem.tipo === 'sucesso' ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {mensagem.texto}
        </div>
      )}

      <div className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-white font-medium mb-2">
            Título do Agendamento *
          </label>
          <input
            type="text"
            value={agendamento.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            placeholder="Ex: Reunião de equipe, Consulta médica..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm"
          />
        </div>

        {/* Tipo de Agendamento */}
        <div>
          <label className="block text-white font-medium mb-2">
            <Tag size={16} className="inline mr-2" />
            Tipo de Agendamento *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiposAgendamento.map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => handleInputChange('tipo', tipo.value)}
                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                  agendamento.tipo === tipo.value
                    ? 'bg-green-500/20 border-green-400/50 text-green-300'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{tipo.icon}</span>
                <span className="text-sm font-medium">{tipo.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">
              <Calendar size={16} className="inline mr-2" />
              Data *
            </label>
            <input
              type="date"
              value={agendamento.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              <Clock size={16} className="inline mr-2" />
              Hora *
            </label>
            <input
              type="time"
              value={agendamento.hora}
              onChange={(e) => handleInputChange('hora', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Local */}
        <div>
          <label className="block text-white font-medium mb-2">
            <MapPin size={16} className="inline mr-2" />
            Local
          </label>
          <input
            type="text"
            value={agendamento.local}
            onChange={(e) => handleInputChange('local', e.target.value)}
            placeholder="Ex: Sala de reuniões, Clínica médica, Online..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm"
          />
        </div>

        {/* Participantes */}
        <div>
          <label className="block text-white font-medium mb-2">
            <Users size={16} className="inline mr-2" />
            Participantes
          </label>

          {/* Busca de participantes */}
          <div className="relative" ref={listaParticipantesRef}>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
              <input
                ref={inputParticipanteRef}
                type="text"
                value={buscaParticipante}
                onChange={(e) => {
                  setBuscaParticipante(e.target.value);
                  setMostrarListaParticipantes(true);
                }}
                onFocus={() => setMostrarListaParticipantes(true)}
                placeholder={carregandoCadastros ? "Carregando cadastros..." : "Buscar pessoas para adicionar..."}
                disabled={carregandoCadastros}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm"
              />
            </div>

            {/* Lista de resultados */}
            {mostrarListaParticipantes && buscaParticipante && (
              <div className="absolute z-10 w-full mt-2 bg-slate-800 rounded-xl border border-slate-600 max-h-60 overflow-y-auto shadow-2xl">
                {carregandoCadastros ? (
                  <div className="p-4 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-400/30 border-t-green-400 mx-auto mb-2"></div>
                    Carregando...
                  </div>
                ) : cadastrosFiltrados.length > 0 ? (
                  cadastrosFiltrados.map((cadastro) => (
                    <button
                      key={cadastro.id}
                      onClick={() => adicionarParticipante(cadastro)}
                      className="w-full text-left p-3 hover:bg-slate-700 transition-colors border-b border-slate-600 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Users size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{cadastro.nome}</p>
                          <p className="text-slate-300 text-sm">{cadastro.email}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    Nenhuma pessoa encontrada
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Participantes selecionados */}
          {agendamento.participantes.length > 0 && (
            <div className="mt-4">
              <p className="text-white/70 text-sm mb-3">
                Participantes selecionados ({agendamento.participantes.length}):
              </p>
              <div className="space-y-2">
                {agendamento.participantes.map((participante) => (
                  <div
                    key={participante.id}
                    className="flex items-center justify-between bg-green-500/20 rounded-lg p-3 border border-green-400/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Users size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{participante.nome}</p>
                        <p className="text-green-200 text-sm">{participante.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removerParticipante(participante.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-white font-medium mb-2">
            Descrição
          </label>
          <textarea
            value={agendamento.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder="Adicione detalhes, agenda ou observações sobre o agendamento..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              setAgendamento({
                titulo: '',
                data: '',
                hora: '',
                local: '',
                descricao: '',
                participantes: [],
                tipo: 'reuniao'
              });
              setMensagem({ tipo: '', texto: '' });
            }}
            className="flex-1 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 border border-white/20"
            disabled={carregandoSalvar}
          >
            Limpar
          </button>

          <button
            onClick={salvarAgendamento}
            disabled={carregandoSalvar}
            className="flex-1 py-3 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregandoSalvar ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Criar Agendamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CriarAgendamento;