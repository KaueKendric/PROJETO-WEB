import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Mail, Phone, MapPin, Calendar, User, Check, X, AlertCircle } from 'lucide-react';

// Componente principal com abas
function SistemaCadastro() {
  const [abaAtiva, setAbaAtiva] = useState('criar');

  const abas = [
    { id: 'criar', nome: 'Criar Cadastro', icone: UserPlus },
    { id: 'lista', nome: 'Lista de Cadastros', icone: Users },
    { id: 'obter', nome: 'Buscar Cadastro', icone: Search }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2"></h1>
          <h2 className="text-3xl font-bold text-white mb-2">Sistema de Cadastro</h2>
          <p className="text-gray-300">Gerencie seus cadastros de forma simples e eficiente</p>
        </div>

        {/* Navegação por abas */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="flex border-b border-gray-600">
            {abas.map((aba) => {
              const IconeAba = aba.icone;
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                    abaAtiva === aba.id
                      ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <IconeAba size={20} />
                  <span className="hidden sm:inline">{aba.nome}</span>
                </button>
              );
            })}
          </div>

          {/* Conteúdo das abas */}
          <div className="p-6 bg-gray-800">
            {abaAtiva === 'criar' && <CriarCadastro />}
            {abaAtiva === 'lista' && <ListaCadastro />}
            {abaAtiva === 'obter' && <ObterCadastro />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Criar Cadastro
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    setCarregando(true);

    try {
      // Simulação da API - substitua pela sua chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulação de sucesso
      const novoId = Math.floor(Math.random() * 1000);
      setMensagem(`Cadastro criado com sucesso! ID: ${novoId}`);
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        endereco: ''
      });
    } catch (error) {
      setErro('Erro ao criar cadastro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <UserPlus className="text-blue-400" />
        Criar Novo Cadastro
      </h2>

      {/* Mensagens */}
      {mensagem && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Check size={20} />
          {mensagem}
        </div>
      )}
      
      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <X size={20} />
          {erro}
        </div>
      )}

      <div className="space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User size={16} className="inline mr-2" />
            Nome Completo
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Digite o nome completo"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
            placeholder="exemplo@email.com"
          />
        </div>

        {/* Telefone e Data de Nascimento - Layout responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone size={16} className="inline mr-2" />
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Data de Nascimento
            </label>
            <input
              type="text"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
              placeholder="DD-MM-AAAA"
            />
          </div>
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin size={16} className="inline mr-2" />
            Endereço (opcional)
          </label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Endereço completo"
          />
        </div>

        {/* Botão de submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={carregando}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {carregando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Criando...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Criar Cadastro
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Componente Lista de Cadastros
function ListaCadastro() {
  const [cadastros, setCadastros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchCadastros = async () => {
      try {
        // Simulação da API - substitua pela sua chamada real
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const dadosSimulados = [
          { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-1111' },
          { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99999-2222' },
          { id: 3, nome: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 99999-3333' }
        ];
        
        setCadastros(dadosSimulados);
      } catch (error) {
        setErro('Erro ao buscar cadastros: ' + error.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchCadastros();
  }, []);

  if (erro) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <AlertCircle size={20} />
          {erro}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Users className="text-blue-400" />
        Lista de Cadastros
      </h2>

      {carregando ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-300 mt-2">Carregando cadastros...</p>
        </div>
      ) : cadastros.length > 0 ? (
        <div className="grid gap-4">
          {cadastros.map((cadastro) => (
            <div key={cadastro.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:shadow-md hover:bg-gray-650 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{cadastro.nome}</h3>
                    <p className="text-sm text-gray-400">ID: {cadastro.id}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-300">
                  <p className="flex items-center gap-1">
                    <Mail size={14} />
                    {cadastro.email}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone size={14} />
                    {cadastro.telefone}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum cadastro encontrado.</p>
        </div>
      )}
    </div>
  );
}

// Componente Obter Cadastro
function ObterCadastro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('id');
  const [cadastro, setCadastro] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const tiposBusca = [
    { value: 'id', label: 'ID', icon: '#' },
    { value: 'nome', label: 'Nome', icon: User },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'telefone', label: 'Telefone', icon: Phone }
  ];

  const handleBuscar = async () => {
    if (!searchTerm.trim()) {
      setErro('Por favor, insira um termo de pesquisa.');
      return;
    }

    setCadastro(null);
    setErro('');
    setCarregando(true);

    try {
      // Simulação da API - substitua pela sua chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulação de dados encontrados
      const dadoSimulado = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-1111',
        data_nascimento: '15-03-1990',
        endereco: 'Rua das Flores, 123 - São Paulo, SP'
      };
      
      setCadastro(dadoSimulado);
    } catch (error) {
      setErro('Cadastro não encontrado.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Search className="text-blue-400" />
        Buscar Cadastro
      </h2>

      {/* Formulário de busca */}
      <div className="bg-gray-700 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar por:
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
            >
              {tiposBusca.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Termo de busca:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Digite o ${tiposBusca.find(t => t.value === searchType)?.label.toLowerCase()}`}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleBuscar}
              disabled={carregando}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Mensagem de erro */}
      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          {erro}
        </div>
      )}

      {/* Resultado da busca */}
      {cadastro && (
        <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <User className="text-blue-400" />
            Detalhes do Cadastro
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-300">ID:</span>
                <span className="text-white">{cadastro.id}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="font-medium text-gray-300">Nome:</span>
                <span className="text-white">{cadastro.nome}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span className="font-medium text-gray-300">Email:</span>
                <span className="text-white">{cadastro.email}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span className="font-medium text-gray-300">Telefone:</span>
                <span className="text-white">{cadastro.telefone}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium text-gray-300">Data de Nascimento:</span>
                <span className="text-white">{cadastro.data_nascimento}</span>
              </div>
              
              {cadastro.endereco && (
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-300">Endereço:</span>
                    <p className="text-white">{cadastro.endereco}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SistemaCadastro;