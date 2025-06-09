import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Mail, Phone, MapPin, Calendar, User, Check, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Componente principal com abas
function SistemaCadastro() {
  const [abaAtiva, setAbaAtiva] = useState('criar');

  const abas = [
    { id: 'criar', nome: 'Criar Cadastro', icone: UserPlus },
    { id: 'lista', nome: 'Lista de Cadastros', icone: Users },
    { id: 'obter', nome: 'Buscar Cadastro', icone: Search }
  ];

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#0f172a' }}>
      {/* Container principal que ocupa toda a tela */}
      <div className="w-full min-h-screen flex flex-col">
        {/* Header fixo */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ backgroundColor: '#1e293b' }}>
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4" style={{ color: '#ffffff' }}>
              Sistema de Cadastro
            </h1>
            <p className="text-base sm:text-lg" style={{ color: '#cbd5e1' }}>
              Gerencie seus cadastros de forma simples e eficiente
            </p>
          </div>
        </div>

        {/* Navegação por abas */}
        <div className="w-full flex-1 flex flex-col">
          <div className="w-full" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex">
                {abas.map((aba) => {
                  const IconeAba = aba.icone;
                  return (
                    <button
                      key={aba.id}
                      onClick={() => setAbaAtiva(aba.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-4 sm:py-6 font-medium transition-all duration-300 ${
                        abaAtiva === aba.id
                          ? 'border-b-4'
                          : 'hover:bg-slate-700'
                      }`}
                      style={{
                        backgroundColor: abaAtiva === aba.id ? '#3b82f6' : 'transparent',
                        color: abaAtiva === aba.id ? '#ffffff' : '#cbd5e1',
                        borderBottomColor: abaAtiva === aba.id ? '#60a5fa' : 'transparent'
                      }}
                    >
                      <IconeAba size={20} className="sm:w-6 sm:h-6" />
                      <span className="text-sm sm:text-base font-semibold hidden sm:inline">{aba.nome}</span>
                      <span className="text-xs sm:hidden">{aba.nome.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conteúdo das abas */}
          <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ backgroundColor: '#0f172a' }}>
            <div className="max-w-7xl mx-auto">
              {abaAtiva === 'criar' && <CriarCadastro />}
              {abaAtiva === 'lista' && <ListaCadastro />}
              {abaAtiva === 'obter' && <ObterCadastro />}
            </div>
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

  // Função para formatar telefone automaticamente
  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const limitado = apenasNumeros.slice(0, 11);

    if (limitado.length <= 2) {
      return limitado;
    } else if (limitado.length <= 7) {
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
    } else if (limitado.length <= 11) {
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
    }

    return limitado;
  };

  // Função para formatar data automaticamente
  const formatarData = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const limitado = apenasNumeros.slice(0, 8);

    if (limitado.length <= 2) {
      return limitado;
    } else if (limitado.length <= 4) {
      return `${limitado.slice(0, 2)}/${limitado.slice(2)}`;
    } else if (limitado.length <= 8) {
      return `${limitado.slice(0, 2)}/${limitado.slice(2, 4)}/${limitado.slice(4)}`;
    }

    return limitado;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telefone') {
      const telefoneFormatado = formatarTelefone(value);
      setFormData({ ...formData, [name]: telefoneFormatado });
    } else if (name === 'data_nascimento') {
      const dataFormatada = formatarData(value);
      setFormData({ ...formData, [name]: dataFormatada });
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
      const response = await fetch('http://localhost:8000/cadastros/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar cadastro');
      }

      const data = await response.json();
      setMensagem(`Cadastro criado com sucesso! ID: ${data.id}`);

      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        endereco: ''
      });
    } catch (error) {
      setErro(`Erro ao criar cadastro: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center gap-3" style={{ color: '#ffffff' }}>
        <UserPlus className="text-blue-400" size={24} />
        Criar Novo Cadastro
      </h2>

      {/* Mensagens */}
      {mensagem && (
        <div className="mb-6 p-4 sm:p-6 rounded-xl flex items-center gap-3 shadow-lg" style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534' }}>
          <Check size={24} />
          <span className="text-sm sm:text-base font-medium">{mensagem}</span>
        </div>
      )}

      {erro && (
        <div className="mb-6 p-4 sm:p-6 rounded-xl flex items-center gap-3 shadow-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          <X size={24} />
          <span className="text-sm sm:text-base font-medium">{erro}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna esquerda */}
        <div className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              <User size={18} className="inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-6 py-5 rounded-full text-sm sm:text-base focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '2px solid #334155'
              }}
              placeholder="Digite o nome completo"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              <Mail size={18} className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-6 py-5 rounded-full text-sm sm:text-base focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '2px solid #334155'
              }}
              placeholder="exemplo@email.com"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              <MapPin size={18} className="inline mr-2" />
              Endereço (opcional)
            </label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className="w-full px-6 py-5 rounded-full text-sm sm:text-base focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '2px solid #334155'
              }}
              placeholder="Endereço completo"
            />
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-6">
          {/* Telefone */}
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              <Phone size={18} className="inline mr-2" />
              Contato
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              className="w-full px-6 py-5 rounded-full text-sm sm:text-base focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '2px solid #334155'
              }}
              placeholder="(11) 99999-9999"
              maxLength="15"
            />
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              <Calendar size={18} className="inline mr-2" />
              Data de Nascimento
            </label>
            <input
              type="text"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              required
              className="w-full px-6 py-5 rounded-full text-sm sm:text-base focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '2px solid #334155'
              }}
              placeholder="DD/MM/AAAA"
              maxLength="10"
            />
          </div>
        </div>
      </div>

      {/* Botão de submit */}
      <div className="mt-6 max-w-4xl mx-auto flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={carregando}
          className="w-full py-4 sm:py-6 px-6 sm:px-8 rounded-full font-bold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl transform hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#3b82f6',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            if (!carregando) e.target.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            if (!carregando) e.target.style.backgroundColor = '#3b82f6';
          }}
        >
          {carregando ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Criando...
            </>
          ) : (
            <>
              <UserPlus size={24} />
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
        const response = await fetch('http://localhost:8000/cadastros/');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar cadastros');
        }

        const data = await response.json();
        setCadastros(data);
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
    <div className="w-full">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center" style={{ color: '#ffffff' }}>
        <Users className="text-blue-400 mr-3" size={24} />
        Lista de Cadastros
      </h2>

      {carregando ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#60a5fa' }}></div>
          <p className="mt-4 text-lg" style={{ color: '#cbd5e1' }}>Carregando cadastros...</p>
        </div>
      ) : cadastros.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-4 max-w-7xl mx-auto">
          {cadastros.map((cadastro) => (
            <div key={cadastro.id}>
              {/* 2. O card interno agora tem todos os estilos e o efeito de hover.
                   Adicionei `h-full` para garantir que os cards na mesma linha tenham a mesma altura. */}
              <div className="h-full rounded-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
                <div className="flex flex-col items-center justify-center mb-4"> {/* Centralizei o cabeçalho */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#3b82f6' }}>
                    <User size={24} style={{ color: '#ffffff' }} />
                  </div>
                  <div className="mt-2 text-center"> {/* Centralizei o texto */}
                    <h3 className="font-bold text-lg" style={{ color: '#ffffff' }}>{cadastro.nome}</h3>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>ID: {cadastro.id}</p>
                  </div>
                </div>
                <div className="space-y-3 flex flex-col items-center justify-center">
                <div className="flex items-center gap-3"> {/* Alinhei ícone e texto à esquerda */}
                  <Mail size={16} className="text-blue-400" />
                  <span className="text-sm sm:text-base" style={{ color: '#e2e8f0' }}>{cadastro.email}</span>
                </div>
                <div className="flex items-center gap-3"> {/* Alinhei ícone e texto à esquerda */}
                  <Phone size={16} className="text-green-400" />
                  <span className="text-sm sm:text-base" style={{ color: '#e2e8f0' }}>{cadastro.telefone}</span>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users size={64} className="mx-auto mb-6" style={{ color: '#475569' }} />
          <p className="text-xl" style={{ color: '#94a3b8' }}>Nenhum cadastro encontrado.</p>
        </div>
      )}
    </div>
  );
}

// Componente Obter Cadastro
function ObterCadastro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cadastroSelecionado, setCadastroSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Função para buscar por ID (comportamento original)
  const buscarPorId = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/cadastros/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cadastro não encontrado');
        }
        throw new Error('Erro ao buscar cadastro');
      }

      const data = await response.json();
      return [data]; // Retorna como array para manter consistência
    } catch (error) {
      throw error;
    }
  };

  // Função para buscar por nome (nova funcionalidade)
  const buscarPorNome = async (nome) => {
    try {
      const response = await fetch('http://localhost:8000/cadastros/');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cadastros');
      }

      const todosOsCadastros = await response.json();
      
      // Filtrar cadastros que contenham o nome pesquisado (case insensitive)
      const cadastrosFiltrados = todosOsCadastros.filter(cadastro =>
        cadastro.nome.toLowerCase().includes(nome.toLowerCase())
      );

      return cadastrosFiltrados;
    } catch (error) {
      throw error;
    }
  };

  const handleBuscar = async () => {
    if (!searchTerm.trim()) {
      setErro('Por favor, insira um nome ou ID para pesquisa.');
      return;
    }

    setResultados([]);
    setCadastroSelecionado(null);
    setErro('');
    setCarregando(true);

    try {
      let resultadosBusca = [];
      
      // Verificar se é um número (ID) ou texto (nome)
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      
      if (isNumeric) {
        // Buscar por ID
        resultadosBusca = await buscarPorId(searchTerm.trim());
      } else {
        // Buscar por nome
        resultadosBusca = await buscarPorNome(searchTerm.trim());
      }

      if (resultadosBusca.length === 0) {
        setErro('Nenhum cadastro encontrado com esse termo de busca.');
      } else if (resultadosBusca.length === 1) {
        // Se encontrou apenas um resultado, mostra diretamente os detalhes
        setCadastroSelecionado(resultadosBusca[0]);
        setResultados([]);
      } else {
        // Se encontrou múltiplos resultados, mostra a lista
        setResultados(resultadosBusca);
        setCadastroSelecionado(null);
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  const selecionarCadastro = (cadastro) => {
    setCadastroSelecionado(cadastro);
    setResultados([]);
  };

  const voltarParaLista = () => {
    setCadastroSelecionado(null);
    // Restaurar a lista se havia múltiplos resultados
    if (resultados.length === 0 && searchTerm.trim()) {
      handleBuscar();
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center gap-3" style={{ color: '#ffffff' }}>
        <Search className="text-blue-400" size={24} />
        Buscar Cadastro
      </h2>

      {/* Formulário de busca */}
<div className="p-6 sm:p-8 rounded-xl mb-8 shadow-lg flex flex-col items-center" style={{ backgroundColor: '#1e293b', border: '2px solid #334155' }}>
  <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full"> {/* Alterei para 1 coluna em todas as telas e ajustei a largura */}
    <div>
      <label className="block text-sm sm:text-base font-semibold mb-3 text-slate-200 text-center">
        Buscar por Nome ou ID:
      </label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Digite o nome ou ID do cadastro"
        className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-xl text-sm sm:text-base focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 shadow-lg"
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: '2px solid #334155',
          textAlign: 'center' // Adicionei esta linha
        }}
        onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
      />
    </div>

          <div className="flex justify-center">
            <button
              onClick={handleBuscar}
              disabled={carregando}
              className="w-full py-4 sm:py-5 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff'
              }}
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
        <div className="mb-6 p-4 sm:p-6 rounded-xl flex items-center justify-center gap-3 shadow-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          <AlertCircle size={24} />
          <span className="text-sm sm:text-base font-medium">{erro}</span>
        </div>
      )}

      {/* Detalhes do cadastro */}
      {cadastroSelecionado && (
        <div className="rounded-xl p-6 sm:p-8 shadow-lg flex flex-col items-center" style={{ backgroundColor: '#1e293b', border: '2px solid #334155' }}>
          <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 justify-center" style={{ color: '#ffffff' }}>
            <User className="text-blue-400" size={24} />
            Detalhes do Cadastro
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-lg w-full"> {/* Ajustei largura máxima */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg w-full" style={{ backgroundColor: '#0f172a' }}>
                <span className="font-semibold text-sm sm:text-base" style={{ color: '#cbd5e1' }}>ID: </span>
                <span className="text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>{cadastroSelecionado.id}</span>
              </div>

              <div className="flex items-center justify-center gap-3 p-4 rounded-lg w-full" style={{ backgroundColor: '#0f172a' }}>
                <User size={18} className="text-blue-400" />
                <span className="font-semibold text-sm sm:text-base" style={{ color: '#cbd5e1' }}>Nome: </span>
                <span className="text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>{cadastroSelecionado.nome}</span>
              </div>

              <div className="flex items-center justify-center gap-3 p-4 rounded-lg w-full" style={{ backgroundColor: '#0f172a' }}>
                <Mail size={18} className="text-green-400" />
                <span className="font-semibold text-sm sm:text-base" style={{ color: '#cbd5e1' }}>Email: </span>
                <span className="text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>{cadastroSelecionado.email}</span>
              </div>
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg w-full" style={{ backgroundColor: '#0f172a' }}>
                <Phone size={18} className="text-purple-400" />
                <span className="font-semibold text-sm sm:text-base" style={{ color: '#cbd5e1' }}>Contato: </span>
                <span className="text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>{cadastroSelecionado.telefone}</span>
              </div>

              <div className="flex items-center justify-center gap-3 p-4 rounded-lg w-full" style={{ backgroundColor: '#0f172a' }}>
                <Calendar size={18} className="text-yellow-400" />
                <span className="font-semibold text-sm sm:text-base" style={{ color: '#cbd5e1' }}>Data de Nascimento: </span>
                <span className="text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>{cadastroSelecionado.data_nascimento}</span>
              </div>

              {cadastroSelecionado.endereco && (
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg w-full" style={{ backgroundColor: '#0f172a' }}>
                  <MapPin size={18} className="mt-0.5 text-red-400" />
                  <div>
                    <span className="font-semibold text-sm sm:text-base" style={{ color: '#cbd5e1' }}>Endereço:</span>
                    <span className="text-sm sm:text-base font-bold text-white text-center">{cadastroSelecionado.endereco}</span>
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