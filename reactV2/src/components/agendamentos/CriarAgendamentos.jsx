import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, FileText, Check, X } from 'lucide-react';

function CriarAgendamento() {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    local: '',
    participantes: '',
    tipo: 'reuniao'
  });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const tiposAgendamento = [
    { value: 'reuniao', label: 'Reunião', color: '#3b82f6' },
    { value: 'consulta', label: 'Consulta', color: '#10b981' },
    { value: 'evento', label: 'Evento', color: '#8b5cf6' },
    { value: 'compromisso', label: 'Compromisso Pessoal', color: '#f59e0b' },
    { value: 'outros', label: 'Outros', color: '#6b7280' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    setCarregando(true);

    // Validação básica
    if (formData.hora_fim <= formData.hora_inicio) {
      setErro('A hora de fim deve ser posterior à hora de início.');
      setCarregando(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/agendamentos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar agendamento');
      }
      
      const data = await response.json();
      setMensagem(`Agendamento criado com sucesso! ID: ${data.id}`);
      setFormData({
        titulo: '',
        descricao: '',
        data: '',
        hora_inicio: '',
        hora_fim: '',
        local: '',
        participantes: '',
        tipo: 'reuniao'
      });
    } catch (error) {
      setErro(`Erro ao criar agendamento: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  const tipoSelecionado = tiposAgendamento.find(t => t.value === formData.tipo);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <Plus className="text-green-400" size={28} />
        Criar Novo Agendamento
      </h2>
      
      {mensagem && (
        <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 bg-green-500/20 border border-green-400/30 text-green-300 backdrop-blur-sm">
          <Check size={20} />
          <span className="font-medium">{mensagem}</span>
        </div>
      )}
      
      {erro && (
        <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 bg-red-500/20 border border-red-400/30 text-red-300 backdrop-blur-sm">
          <X size={20} />
          <span className="font-medium">{erro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Título e Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
              <Calendar size={16} className="text-green-400" />
              Título do Agendamento
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm hover:bg-white/10"
              placeholder="Ex: Reunião de planejamento"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
              <FileText size={16} className="text-green-400" />
              Tipo
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
            >
              {tiposAgendamento.map((tipo) => (
                <option key={tipo.value} value={tipo.value} className="bg-slate-800">
                  {tipo.label}
                </option>
              ))}
            </select>
            {/* Preview da cor do tipo */}
            <div className="mt-2 flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: tipoSelecionado?.color }}
              ></div>
              <span className="text-white/60 text-xs">{tipoSelecionado?.label}</span>
            </div>
          </div>
        </div>

        {/* Data e Horários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
              <Calendar size={16} className="text-green-400" />
              Data
            </label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
              <Clock size={16} className="text-green-400" />
              Hora Início
            </label>
            <input
              type="time"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
              <Clock size={16} className="text-green-400" />
              Hora Fim
            </label>
            <input
              type="time"
              name="hora_fim"
              value={formData.hora_fim}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
            />
          </div>
        </div>

        {/* Local e Participantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
              <MapPin size={16} className="text-green-400" />
              Local (opcional)
            </label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm hover:bg-white/10"
              placeholder="Ex: Sala de reuniões, Online, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
              <Users size={16} className="text-green-400" />
              Participantes (opcional)
            </label>
            <input
              type="text"
              name="participantes"
              value={formData.participantes}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm hover:bg-white/10"
              placeholder="Ex: João, Maria, Pedro"
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
            <FileText size={16} className="text-green-400" />
            Descrição (opcional)
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows="4"
            className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm hover:bg-white/10 resize-none"
            placeholder="Descreva os detalhes do agendamento..."
          />
        </div>
        
        {/* Resumo do agendamento */}
        {formData.titulo && formData.data && formData.hora_inicio && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Check size={18} className="text-green-400" />
              Resumo do Agendamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Título:</span>
                <span className="text-white font-medium ml-2">{formData.titulo}</span>
              </div>
              <div>
                <span className="text-white/60">Tipo:</span>
                <span className="text-white font-medium ml-2 flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: tipoSelecionado?.color }}
                  ></div>
                  {tipoSelecionado?.label}
                </span>
              </div>
              <div>
                <span className="text-white/60">Data:</span>
                <span className="text-white font-medium ml-2">
                  {new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-white/60">Horário:</span>
                <span className="text-white font-medium ml-2">
                  {formData.hora_inicio} - {formData.hora_fim}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={carregando}
            className="group relative py-4 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center gap-3 transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-xl overflow-hidden"
          >
            {/* Brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <div className="relative flex items-center gap-3">
              {carregando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              ) : (
                <Plus size={20} />
              )}
              {carregando ? 'Criando...' : 'Criar Agendamento'}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

export default CriarAgendamento;