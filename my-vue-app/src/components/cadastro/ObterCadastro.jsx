import { useState } from 'react';
import { Search, AlertCircle, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';

function ObterCadastro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cadastroSelecionado, setCadastroSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const buscarDados = async () => {
    if (!searchTerm.trim()) {
      setErro('Por favor, insira um nome ou ID para pesquisa.');
      return;
    }

    setResultados([]);
    setCadastroSelecionado(null);
    setErro('');
    setCarregando(true);

    try {
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      let data;

      if (isNumeric) {
        // Busca por ID específico
        const response = await fetch(`http://localhost:8000/cadastros/${searchTerm.trim()}`);
        if (response.status === 404) {
          throw new Error('Cadastro não encontrado com este ID.');
        }
        if (!response.ok) {
          throw new Error('Erro ao buscar cadastro por ID.');
        }
        data = [await response.json()];
      } else {
        // Busca por nome
        const response = await fetch('http://localhost:8000/cadastros/');
        if (!response.ok) {
          throw new Error('Erro ao buscar lista de cadastros.');
        }
        const todos = await response.json();
        data = todos.filter(c => 
          c.nome.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
      }

      if (data.length === 0) {
        setErro('Nenhum cadastro encontrado com o termo pesquisado.');
      } else if (data.length === 1) {
        setCadastroSelecionado(data[0]);
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
      buscarDados();
    }
  };

  const selecionarCadastro = (cadastro) => {
    setCadastroSelecionado(cadastro);
    setResultados([]);
  };

  const limparBusca = () => {
    setSearchTerm('');
    setResultados([]);
    setCadastroSelecionado(null);
    setErro('');
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <Search className="text-blue-400" /> Buscar Cadastro
      </h2>

      {/* Barra de pesquisa */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite o nome ou ID do cadastro"
            className="w-full p-3 rounded-lg bg-slate-900 text-white border-2 border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-sm text-slate-400 mt-1">
            Dica: Digite um número para buscar por ID ou texto para buscar por nome
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={buscarDados}
            disabled={carregando}
            className="py-3 px-6 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {carregando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Search size={20} />
            )}
            {carregando ? 'Buscando...' : 'Buscar'}
          </button>
          
          <button
            onClick={limparBusca}
            className="py-3 px-4 rounded-lg font-bold text-white bg-slate-600 hover:bg-slate-700 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/50 text-red-400 border border-red-800 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      {/* Cadastro selecionado - detalhes completos */}
      {cadastroSelecionado && (
        <div className="mb-6 bg-slate-900 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Detalhes do Cadastro</h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              ID: {cadastroSelecionado.id}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              <User size={20} className="text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Nome</p>
                <p className="text-white font-medium">{cadastroSelecionado.nome}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              <Mail size={20} className="text-green-400" />
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-white font-medium">{cadastroSelecionado.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              <Phone size={20} className="text-yellow-400" />
              <div>
                <p className="text-slate-400 text-sm">Telefone</p>
                <p className="text-white font-medium">{cadastroSelecionado.telefone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              <Calendar size={20} className="text-purple-400" />
              <div>
                <p className="text-slate-400 text-sm">Data de Nascimento</p>
                <p className="text-white font-medium">{cadastroSelecionado.data_nascimento}</p>
              </div>
            </div>
            
            {cadastroSelecionado.endereco && (
              <div className="md:col-span-2 flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <MapPin size={20} className="text-red-400" />
                <div>
                  <p className="text-slate-400 text-sm">Endereço</p>
                  <p className="text-white font-medium">{cadastroSelecionado.endereco}</p>
                </div>
              </div>
            )}
          </div>
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
                onClick={() => selecionarCadastro(resultado)}
                className="bg-slate-900 rounded-lg p-4 border border-slate-700 cursor-pointer hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white truncate">{resultado.nome}</h4>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                    ID: {resultado.id}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate mb-1">{resultado.email}</p>
                <p className="text-sm text-slate-500">{resultado.telefone}</p>
                <div className="mt-3 text-xs text-blue-400">
                  Clique para ver detalhes completos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio quando não há pesquisa */}
      {!searchTerm && !cadastroSelecionado && resultados.length === 0 && !erro && (
        <div className="text-center py-12 text-slate-500">
          <Search size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-lg mb-2">Busque por um cadastro específico</p>
          <p className="text-sm">
            Use o campo acima para pesquisar por ID (número) ou nome (texto)
          </p>
        </div>
      )}
    </div>
  );
}

export default ObterCadastro;