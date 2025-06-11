import { useState, useEffect } from 'react';
import { Users, Mail, Phone, AlertCircle, Eye, X, Filter } from 'lucide-react';

function ListaCadastro() {
  const [cadastros, setCadastros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cadastroSelecionado, setCadastroSelecionado] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Função para formatar data no formato brasileiro
  const formatarData = (data) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

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

  const cadastrosFiltrados = cadastros.filter(cadastro =>
    cadastro.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    cadastro.email.toLowerCase().includes(filtro.toLowerCase())
  );

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
        
        {/* Filtro */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Filtrar cadastros..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 placeholder-white/40 backdrop-blur-sm w-64"
            />
          </div>
        </div>
      </div>
      
      {carregando ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400/30 border-t-purple-400 mx-auto mb-4"></div>
          <p className="text-white/70">Carregando cadastros...</p>
        </div>
      ) : cadastrosFiltrados.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-white/70">
              {filtro ? 'Filtrados' : 'Total'}: 
              <span className="font-bold text-white ml-2">{cadastrosFiltrados.length}</span> cadastro(s)
            </p>
            {filtro && (
              <button
                onClick={() => setFiltro('')}
                className="text-purple-400 hover:text-white transition-colors text-sm"
              >
                Limpar filtro
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cadastrosFiltrados.map((cadastro) => (
              <div
                key={cadastro.id}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/10 cursor-pointer transform hover:scale-[1.02]"
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
        </>
      ) : (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-6 text-white/30" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum cadastro encontrado</h3>
          <p className="text-white/60">
            {filtro 
              ? 'Tente alterar o filtro ou criar novos cadastros.'
              : 'Comece criando o primeiro cadastro na aba "Novo Cadastro".'
            }
          </p>
        </div>
      )}

      {/* Modal de detalhes - TOTALMENTE SÓLIDO */}
      {cadastroSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Detalhes do Cadastro</h3>
              <button
                onClick={() => setCadastroSelecionado(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>
            
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
                  <p className="text-white font-medium">{cadastroSelecionado.email}</p>
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
            
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={() => setCadastroSelecionado(null)}
                className="flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all duration-300 border border-slate-700"
              >
                Fechar
              </button>
              <button className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-300">
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaCadastro;