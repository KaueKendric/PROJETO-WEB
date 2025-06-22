import { useState, useEffect } from 'react';
import { Users, Mail, Phone, AlertCircle, Eye, X, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import fetchApi from '../../utils/fetchApi';

function ListaCadastro() {
  const [cadastros, setCadastros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cadastroSelecionado, setCadastroSelecionado] = useState(null);
  const [filtro, setFiltro] = useState('');

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalCadastros, setTotalCadastros] = useState(0);
  const [carregandoPagina, setCarregandoPagina] = useState(false);
  const limitePorPagina = 6;

  const formatarData = (data) => {
    if (!data) return '';

    if (data.includes('-')) {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    }

    return data;
  };

  const fetchCadastros = async (pagina = 1, filtroAtual = filtro) => {
    try {
      console.log(`👥 Buscando cadastros - Página ${pagina}, Filtro: "${filtroAtual}"`);
      setCarregandoPagina(true);
      setErro('');

      const skip = (pagina - 1) * limitePorPagina;

      let url = `/api/cadastros/?limit=${limitePorPagina}&skip=${skip}`;

      if (filtroAtual.trim()) {
        url += `&filtro=${encodeURIComponent(filtroAtual.trim())}`;
      }


      const response = await fetchApi(url);

      console.log('📡 Resposta recebida:', response.status, response.statusText);

      if (!response) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = response;
      console.log('✅ Cadastros recebidos:', data);

      if (data.cadastros && typeof data.total === 'number') {
        setCadastros(data.cadastros);
        setTotalCadastros(data.total);
      } else {

        setCadastros(Array.isArray(data) ? data : []);
        setTotalCadastros(Array.isArray(data) ? data.length : 0);
      }

    } catch (error) {
      console.error('❌ Erro ao buscar cadastros:', error);
      setErro('Erro ao buscar cadastros: ' + error.message);
    } finally {
      setCarregando(false);
      setCarregandoPagina(false);
    }
  };

  useEffect(() => {
    setCarregando(true);
    fetchCadastros(1, filtro);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPaginaAtual(1);
      fetchCadastros(1, filtro);
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [filtro]);

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
      fetchCadastros(novaPagina, filtro);
    }
  };

  const totalPaginas = Math.ceil(totalCadastros / limitePorPagina);

  const obterNumerosPaginas = () => {
    const numeros = [];
    const maxVisivel = 5;

    if (totalPaginas <= maxVisivel) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      let inicio = Math.max(1, paginaAtual - 2);
      let fim = Math.min(totalPaginas, inicio + maxVisivel - 1);

      if (fim - inicio < maxVisivel - 1) {
        inicio = Math.max(1, fim - maxVisivel + 1);
      }

      for (let i = inicio; i <= fim; i++) {
        numeros.push(i);
      }
    }

    return numeros;
  };

  if (erro) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
          <Users className="text-purple-400" size={28} />
          Lista de Cadastros
        </h2>
        <div className="text-center p-8 bg-red-500/20 rounded-2xl border border-red-400/30 backdrop-blur-sm">
          <AlertCircle className="mx-auto mb-4 text-red-300" size={48} />
          <p className="text-lg text-red-300 font-medium">{erro}</p>
          <button
            onClick={() => {
              setErro('');
              setCarregando(true);
              fetchCadastros(1, filtro);
            }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Users className="text-purple-400" size={28} />
          Lista de Cadastros
        </h2>

        {/* Filtro de busca */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              disabled={carregandoPagina}
              className="pl-10 pr-4 py-2 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm w-80 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400/30 border-t-purple-400 mx-auto mb-4"></div>
          <p className="text-white/70">Carregando cadastros...</p>
        </div>
      ) : cadastros.length > 0 ? (
        <>
          {/* Informações da paginação */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-white/70">
              Mostrando {((paginaAtual - 1) * limitePorPagina) + 1} a {Math.min(paginaAtual * limitePorPagina, totalCadastros)} de {totalCadastros} cadastro(s)
              {filtro && <span className="text-purple-300"> • Filtro: "{filtro}"</span>}
            </p>
            {carregandoPagina && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span className="text-sm text-white/70">Carregando...</span>
              </div>
            )}
            {filtro && (
              <button
                onClick={() => setFiltro('')}
                className="text-purple-400 hover:text-white transition-colors text-sm"
              >
                Limpar filtro
              </button>
            )}
          </div>

          {/* Grid de cadastros */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {cadastros.map((cadastro) => (
              <div
                key={cadastro.id}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/10 transform hover:scale-[1.02]"
              >
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-200 transition-colors">
                    {cadastro.nome}
                  </h3>
                  <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-400/30">
                    ID: {cadastro.id}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/80">
                    <Mail size={16} className="text-purple-400 flex-shrink-0" />
                    <span className="text-sm truncate" title={cadastro.email}>
                      {cadastro.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-white/80">
                    <Phone size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm">
                      {cadastro.telefone}
                    </span>
                  </div>

                  {cadastro.data_nascimento && (
                    <div className="text-white/60 text-sm">
                      <span className="font-medium">Nascimento:</span> {formatarData(cadastro.data_nascimento)}
                    </div>
                  )}

                  {cadastro.endereco && (
                    <div className="text-white/60 text-sm">
                      <span className="font-medium">Endereço:</span>
                      <span className="block truncate" title={cadastro.endereco}>
                        {cadastro.endereco}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botão de detalhes */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCadastroSelecionado(cadastro)}
                    className="w-full py-2 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 border border-purple-400/30 hover:border-purple-400/50"
                  >
                    <Eye size={16} />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 py-6">
              {/* Botão página anterior */}
              <button
                onClick={() => mudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1 || carregandoPagina}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-purple-400/50"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              {/* Números das páginas */}
              <div className="flex gap-1">
                {obterNumerosPaginas().map((numero) => (
                  <button
                    key={numero}
                    onClick={() => mudarPagina(numero)}
                    disabled={carregandoPagina}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors disabled:cursor-not-allowed border ${numero === paginaAtual
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-purple-400/50'
                      }`}
                  >
                    {numero}
                  </button>
                ))}
              </div>

              {/* Botão próxima página */}
              <button
                onClick={() => mudarPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas || carregandoPagina}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-purple-400/50"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-6 text-white/30" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum cadastro encontrado</h3>
          <p className="text-white/60">
            {filtro
              ? `Nenhum resultado encontrado para "${filtro}". Tente alterar o filtro ou criar novos cadastros.`
              : 'Comece criando o primeiro cadastro na aba "Novo Cadastro".'
            }
          </p>
          {filtro && (
            <button
              onClick={() => setFiltro('')}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              Limpar filtro
            </button>
          )}
        </div>
      )}

      {/* Modal de detalhes - Otimizado para viewport */}
      {cadastroSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border-2 border-slate-700 shadow-2xl">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-2xl font-bold text-white">Detalhes do Cadastro</h3>
              <button
                onClick={() => setCadastroSelecionado(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Conteúdo do modal - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-slate-700">
                  <h4 className="font-bold text-white text-2xl mb-2">{cadastroSelecionado.nome}</h4>
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full font-medium">
                    ID: {cadastroSelecionado.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail size={20} className="text-purple-400" />
                      <span className="text-slate-300 text-sm font-medium">Email</span>
                    </div>
                    <p className="text-white font-medium break-all">{cadastroSelecionado.email}</p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone size={20} className="text-green-400" />
                      <span className="text-slate-300 text-sm font-medium">Telefone</span>
                    </div>
                    <p className="text-white font-medium">{cadastroSelecionado.telefone}</p>
                  </div>

                  {cadastroSelecionado.data_nascimento && (
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-blue-400" />
                        <span className="text-slate-300 text-sm font-medium">Data de Nascimento</span>
                      </div>
                      <p className="text-white font-medium">{formatarData(cadastroSelecionado.data_nascimento)}</p>
                    </div>
                  )}

                  {cadastroSelecionado.data_criacao && (
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-cyan-400" />
                        <span className="text-slate-300 text-sm font-medium">Data de Cadastro</span>
                      </div>
                      <p className="text-white font-medium">
                        {new Date(cadastroSelecionado.data_criacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {cadastroSelecionado.endereco && (
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 md:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail size={20} className="text-yellow-400" />
                        <span className="text-slate-300 text-sm font-medium">Endereço</span>
                      </div>
                      <p className="text-white font-medium">{cadastroSelecionado.endereco}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer do modal */}
            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => setCadastroSelecionado(null)}
                className="flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all duration-300 border border-slate-700"
              >
                Fechar
              </button>
              <button className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-300">
                Editar
              </button>
              <button className="py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaCadastro;