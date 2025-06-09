import { useState } from 'react';
import { UserPlus, User, Mail, Phone, Calendar, MapPin, Check, X } from 'lucide-react';

function CriarCadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    endereco: ''
  });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const limitado = apenasNumeros.slice(0, 11);
    if (limitado.length > 7) return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
    if (limitado.length > 2) return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
    return limitado;
  };

  const formatarData = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const limitado = apenasNumeros.slice(0, 8);
    if (limitado.length > 4) return `${limitado.slice(0, 2)}/${limitado.slice(2, 4)}/${limitado.slice(4)}`;
    if (limitado.length > 2) return `${limitado.slice(0, 2)}/${limitado.slice(2)}`;
    return limitado;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      setFormData({ ...formData, [name]: formatarTelefone(value) });
    } else if (name === 'data_nascimento') {
      setFormData({ ...formData, [name]: formatarData(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    setCarregando(true);
    
    try {
      const response = await fetch(`${API_URL}/cadastros/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar cadastro');
      }
      
      const data = await response.json();
      setMensagem(`Cadastro criado com sucesso! ID: ${data.id}`);
      setFormData({ nome: '', email: '', telefone: '', data_nascimento: '', endereco: '' });
    } catch (error) {
      setErro(`Erro ao criar cadastro: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <UserPlus className="text-blue-400" /> Criar Novo Cadastro
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
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <User size={16} className="inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Digite o nome completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Mail size={16} className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="exemplo@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Phone size={16} className="inline mr-2" />
              Contato
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="(11) 99999-9999"
              maxLength="15"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              <Calendar size={16} className="inline mr-2" />
              Data de Nascimento
            </label>
            <input
              type="text"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="DD/MM/AAAA"
              maxLength="10"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-300">
            <MapPin size={16} className="inline mr-2" />
            Endereço (opcional)
          </label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Endereço completo"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={carregando}
            className="py-3 px-6 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {carregando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <UserPlus size={20} />
            )}
            {carregando ? 'Criando...' : 'Criar Cadastro'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CriarCadastro;