import { useState } from 'react';
import { Search, AlertCircle, User, Mail, Phone, Calendar, MapPin, Filter, X } from 'lucide-react';
import fetchApi from '../../utils/fetchApi';

function ObterCadastro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cadastroSelecionado, setCadastroSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return '';

    // Se já está no formato ISO (YYYY-MM-DD)
    if (data.includes('-')) {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    }

    // Se está no formato brasileiro (DD/MM/YYYY)
    return data;
  };

  const buscarDados = async () => {
    if (!searchTerm.trim()) {
      setErro('Por favor, insira um nome, email ou ID para pesquisa.');
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
        console.log(`🔍 Buscando cadastro por ID: ${searchTerm.trim()}`);
        const response = await fetchApi(`/api/cadastros/${searchTerm.trim()}`);

        if (response.status === 404) {
          throw new Error('Cadastro não encontrado com este ID.');
        }
        if (!response) {
          const errorText = await response.text();
          throw new Error(`Erro ao buscar cadastro por ID: ${response.status} - ${errorText}`);
        }

        const cadastro =  response;
        data = [cadastro];
      } else {
        // Busca por nome/email usando a API paginada
        console.log(`🔍 Buscando cadastros com filtro: "${searchTerm.trim()}"`);

        // Usar a API paginada com filtro
        const response = await fetchApi(
          `/api/cadastros/?limit=50&skip=0&filtro=${encodeURIComponent(searchTerm.trim())}`
        );

        if (!response) {
          const errorText = await response.text();
          throw new Error(`Erro ao buscar cadastros: ${response.status} - ${errorText}`);
        }

        const responseData = response;
        console.log('📡 Resposta da API:', responseData);

        // Verificar formato da resposta
        if (responseData.cadastros && Array.isArray(responseData.cadastros)) {
          // Resposta paginada
          data = responseData.cadastros;
        } else if (Array.isArray(responseData)) {
          // Resposta simples (fallback)
          data = responseData.filter(c =>
            c.nome.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.trim().toLowerCase())
          );
        } else {
          throw new Error('Formato de resposta inesperado da API');
        }
      }

      console.log(`✅ Encontrados ${data.length} cadastros`);

      if (data.length === 0) {
        setErro('Nenhum cadastro encontrado com o termo pesquisado.');
      } else if (data.length === 1) {
        setCadastroSelecionado(data[0]);
      } else {
        setResultados(data);
      }
    } catch (error) {
      console.error('❌ Erro na busca:', error);
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
        <Search className="text-purple-400" size={28} />
        Buscar Cadastro
      </h2>

      {/* Barra de pesquisa */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative group">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite o ID, nome ou email do cadastro"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm hover:bg-white/10"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={buscarDados}
              disabled={carregando}
              className="group relative py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 flex items-center gap-3 transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-xl overflow-hidden"
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

            <button
              onClick={limparBusca}
              className="py-4 px-6 rounded-2xl font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
            >
              Limpar
            </button>
          </div>
        </div>

        <p className="text-white/50 text-sm mt-3 ml-1">
          💡 Dica: Digite um número para buscar por ID ou texto para buscar por nome/email
        </p>
      </div>

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

      {/* Cadastro selecionado - detalhes completos */}
      {cadastroSelecionado && (
        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Detalhes do Cadastro</h3>
            <div className="flex items-center gap-3">
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
                Encontrado
              </span>
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/30">
                ID: {cadastroSelecionado.id}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <User size={20} className="text-blue-400" />
                <span className="text-white/60 text-sm font-medium">Nome</span>
              </div>
              <p className="text-white font-semibold text-lg">{cadastroSelecionado.nome}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={20} className="text-green-400" />
                <span className="text-white/60 text-sm font-medium">Email</span>
              </div>
              <p className="text-white font-medium break-all">{cadastroSelecionado.email}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Phone size={20} className="text-yellow-400" />
                <span className="text-white/60 text-sm font-medium">Telefone</span>
              </div>
              <p className="text-white font-medium">{cadastroSelecionado.telefone}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={20} className="text-purple-400" />
                <span className="text-white/60 text-sm font-medium">Data de Nascimento</span>
              </div>
              <p className="text-white font-medium">{formatarData(cadastroSelecionado.data_nascimento)}</p>
            </div>

            {cadastroSelecionado.endereco && (
              <div className="md:col-span-2 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-red-400" />
                  <span className="text-white/60 text-sm font-medium">Endereço</span>
                </div>
                <p className="text-white font-medium">{cadastroSelecionado.endereco}</p>
              </div>
            )}

            {cadastroSelecionado.data_criacao && (
              <div className="md:col-span-2 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={20} className="text-cyan-400" />
                  <span className="text-white/60 text-sm font-medium">Data de Cadastro</span>
                </div>
                <p className="text-white font-medium">
                  {new Date(cadastroSelecionado.data_criacao).toLocaleDateString('pt-BR')} às {' '}
                  {new Date(cadastroSelecionado.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de resultados múltiplos */}
      {resultados.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Filter className="text-purple-400" />
            Resultados da Busca ({resultados.length} encontrado{resultados.length > 1 ? 's' : ''})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultados.map((resultado) => (
              <div
                key={resultado.id}
                onClick={() => selecionarCadastro(resultado)}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white truncate group-hover:text-purple-200 transition-colors">
                    {resultado.nome}
                  </h4>
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs border border-purple-400/30">
                    ID: {resultado.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Mail size={14} className="text-green-400" />
                    <span className="text-sm truncate">{resultado.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Phone size={14} className="text-yellow-400" />
                    <span className="text-sm">{resultado.telefone}</span>
                  </div>
                  {resultado.data_nascimento && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar size={14} className="text-purple-400" />
                      <span className="text-sm">{formatarData(resultado.data_nascimento)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-purple-400 text-xs font-medium group-hover:text-purple-300 transition-colors">
                    Clique para ver detalhes completos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!searchTerm && !cadastroSelecionado && resultados.length === 0 && !erro && (
        <div className="text-center py-16">
          <Search size={64} className="mx-auto mb-6 text-white/20" />
          <h3 className="text-2xl font-bold text-white mb-3">Busque por um cadastro específico</h3>
          <p className="text-white/60 max-w-md mx-auto">
            Use o campo acima para pesquisar por ID (número) ou nome/email (texto).
            Os resultados aparecerão aqui de forma organizada.
          </p>
          <div className="mt-6 space-y-2 text-white/50 text-sm">
            <p><strong>Exemplos de busca:</strong></p>
            <p>• Digite "1" para buscar o cadastro com ID 1</p>
            <p>• Digite "João" para buscar por nome</p>
            <p>• Digite "email@exemplo.com" para buscar por email</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObterCadastro;