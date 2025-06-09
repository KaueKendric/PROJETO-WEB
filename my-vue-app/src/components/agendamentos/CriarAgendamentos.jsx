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
    { value: 'reuniao', label: 'Reunião' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'evento', label: 'Evento' },
    { value: 'compromisso', label: 'Compromisso Pessoal' },
    { value: 'outros', label: 'Outros' }
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

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <Plus className="text-green-400" /> Criar Novo Agendamento
      </h2>
      
      {mensagem && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-green-100 border border-green-300 text-green-800">
          <Check />
          <span>{mensagem}</span>
        </div>
      )}
      
      {erro && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-red-100 border border-red-300 text-red-800">
          <X />
          <span>{erro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Calendar size={16} className="inline mr-2" />
              Título do Agendamento
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ex: Reunião de planejamento"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <FileText size={16} className="inline mr-2" />
              Tipo de Agendamento
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              {tiposAgendamento.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Calendar size={16} className="inline mr-2" />
              Data
            </label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Hora Início */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Clock size={16} className="inline mr-2" />
              Hora de Início
            </label>
            <input
              type="time"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Hora Fim */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Clock size={16} className="inline mr-2" />
              Hora de Fim
            </label>
            <input
              type="time"
              name="hora_fim"
              value={formData.hora_fim}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <MapPin size={16} className="inline mr-2" />
              Local (opcional)
            </label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ex: Sala de reuniões, Online, etc."
            />
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Users size={16} className="inline mr-2" />
              Participantes (opcional)
            </label>
            <input
              type="text"
              name="participantes"
              value={formData.participantes}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ex: João, Maria, Pedro"
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">
            <FileText size={16} className="inline mr-2" />
            Descrição (opcional)
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
            placeholder="Descreva os detalhes do agendamento..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={carregando}
            className="py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {carregando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Plus size={20} />
            )}
            {carregando ? 'Criando...' : 'Criar Agendamento'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CriarAgendamento;