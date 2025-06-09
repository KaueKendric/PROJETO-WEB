import { useState, useEffect } from 'react';
import { Users, Mail, Phone, AlertCircle } from 'lucide-react';

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
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
          <Users className="text-blue-400" /> Lista de Cadastros
        </h2>
        <div className="text-center text-red-500 p-8 bg-red-900/20 rounded-lg border border-red-800">
          <AlertCircle className="inline mr-2" size={24} />
          <p className="text-lg">{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <Users className="text-blue-400" /> Lista de Cadastros
      </h2>
      
      {carregando ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto border-blue-500"></div>
          <p className="mt-3 text-slate-400">Carregando cadastros...</p>
        </div>
      ) : cadastros.length > 0 ? (
        <>
          <div className="mb-4 text-slate-400">
            <p>Total de cadastros: <span className="font-bold text-white">{cadastros.length}</span></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cadastros.map((cadastro) => (
              <div
                key={cadastro.id}
                className="bg-slate-900 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-white mb-1">
                    {cadastro.nome}
                  </h3>
                  <p className="text-sm text-slate-500">
                    ID: {cadastro.id}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail size={16} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm truncate" title={cadastro.email}>
                      {cadastro.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm">
                      {cadastro.telefone}
                    </span>
                  </div>
                  
                  {cadastro.data_nascimento && (
                    <div className="text-slate-400 text-sm">
                      <span className="font-medium">Nascimento:</span> {cadastro.data_nascimento}
                    </div>
                  )}
                  
                  {cadastro.endereco && (
                    <div className="text-slate-400 text-sm">
                      <span className="font-medium">Endereço:</span> {cadastro.endereco}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-slate-500">
          <Users size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-lg">Nenhum cadastro encontrado.</p>
          <p className="text-sm mt-2">
            Comece criando o primeiro cadastro na aba "Criar Cadastro".
          </p>
        </div>
      )}
    </div>
  );
}

export default ListaCadastro;