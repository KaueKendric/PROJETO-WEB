import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, LogOut, Home, ChevronDown, Clock } from 'lucide-react';
import CriarAgendamento from '../components/agendamentos/CriarAgendamentos';
import ListaAgendamento from '../components/agendamentos/ListarAgendamentos';
import BuscarAgendamento from '../components/agendamentos/BuscarAgendamentos';

function AgendamentoPage({ onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState('criar');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const navigate = useNavigate();

  const abas = [
    { 
      id: 'criar', 
      nome: 'Novo Agendamento', 
      icone: Plus, 
      descricao: 'Criar compromisso',
      cor: 'green'
    },
    { 
      id: 'lista', 
      nome: 'Todos os Agendamentos', 
      icone: Calendar, 
      descricao: 'Visualizar agenda',
      cor: 'green'
    },
    { 
      id: 'buscar', 
      nome: 'Buscar Agendamento', 
      icone: Search, 
      descricao: 'Encontrar evento',
      cor: 'green'
    }
  ];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const abaAtual = abas.find(aba => aba.id === abaAtiva);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900">
      
      {/* Header moderno */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Navegação esquerda */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="p-2 text-green-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center gap-2 group"
              >
                <Home size={20} />
                <span className="hidden sm:inline text-sm group-hover:text-white">Dashboard</span>
              </button>
              
              <div className="hidden md:block w-px h-8 bg-white/20"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-white">
                    Sistema de Agendamento
                  </h1>
                  <p className="hidden lg:block text-sm text-green-200">
                    Gerencie compromissos e eventos
                  </p>
                </div>
              </div>
            </div>
            
            {/* Menu mobile atual */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMenuMobileAberto(!menuMobileAberto)}
                className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-white"
              >
                <abaAtual.icone size={18} />
                <span className="text-sm font-medium">{abaAtual.nome.split(' ')[0]}</span>
                <ChevronDown size={16} className={`transition-transform ${menuMobileAberto ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Ações direita */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onLogout}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                title="Sair do sistema"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Menu mobile dropdown */}
          {menuMobileAberto && (
            <div className="md:hidden pb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                {abas.map((aba) => {
                  const IconeAba = aba.icone;
                  return (
                    <button
                      key={aba.id}
                      onClick={() => {
                        setAbaAtiva(aba.id);
                        setMenuMobileAberto(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                        abaAtiva === aba.id 
                          ? 'bg-green-600 text-white' 
                          : 'text-green-200 hover:bg-white/10'
                      }`}
                    >
                      <IconeAba size={18} />
                      <div className="text-left">
                        <p className="font-medium">{aba.nome}</p>
                        <p className="text-xs opacity-80">{aba.descricao}</p>
                      </div>
                    </button>
                  );
                })}
                <div className="border-t border-white/20 p-2">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Navegação por abas - Desktop */}
        <div className="hidden md:block mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="flex">
              {abas.map((aba) => {
                const IconeAba = aba.icone;
                return (
                  <button
                    key={aba.id}
                    onClick={() => setAbaAtiva(aba.id)}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-6 font-medium transition-all duration-300 relative group ${
                      abaAtiva === aba.id 
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'text-green-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {abaAtiva === aba.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700"></div>
                    )}
                    <div className="relative z-10 flex items-center gap-3">
                      <IconeAba size={20} />
                      <div className="text-left">
                        <span className="block">{aba.nome}</span>
                        <span className="text-xs opacity-80">{aba.descricao}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Indicador mobile da aba atual */}
        <div className="md:hidden mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <abaAtual.icone size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{abaAtual.nome}</h2>
                <p className="text-sm text-green-200">{abaAtual.descricao}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="p-6 lg:p-8">
            {abaAtiva === 'criar' && <CriarAgendamento />}
            {abaAtiva === 'lista' && <ListaAgendamento />}
            {abaAtiva === 'buscar' && <BuscarAgendamento />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AgendamentoPage;