import { useNavigate } from 'react-router-dom';
import { Calendar, UserPlus, LogOut, BarChart3, Settings, Bell, Search, Menu, User, Clock, ChevronRight, Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import fetchApi from '../utils/fetchApi';

function DashboardPage({ onLogout }) {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName] = useState('Admin');
    const [greeting, setGreeting] = useState('');

    const [sistemas, setSistemas] = useState([]);
    const [estatisticas, setEstatisticas] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const hour = currentTime.getHours();
        if (hour < 12) {
            setGreeting('Bom dia');
        } else if (hour < 18) {
            setGreeting('Boa tarde');
        } else {
            setGreeting('Boa noite');
        }
    }, [currentTime]);

    useEffect(() => {
        const fetchDadosDashboard = async () => {
            try {
                const summary = await fetchApi(`/api/dashboard/summary`);
                const atividade = await fetchApi(`/api/dashboard/atividade`);
                console.log(summary)

                setSistemas([
                    {
                        id: 'cadastramento',
                        name: 'Sistema de Cadastro',
                        description: 'Gerencie cadastros de usuários e dados pessoais',
                        icon: UserPlus,
                        gradient: 'from-purple-500 to-purple-700',
                        path: '/cadastramento',
                        stats: summary.cadastros,
                        label: 'cadastros',
                        trend: '+0%',
                        active: true
                    },
                    {
                        id: 'agendamento',
                        name: 'Sistema de Agendamento',
                        description: 'Gerencie compromissos, eventos e reuniões',
                        icon: Calendar,
                        gradient: 'from-green-500 to-green-700',
                        path: '/agendamento',
                        stats: summary.agendamentos,
                        label: 'agendamentos',
                        trend: '+0%',
                        active: true
                    },
                    {
                        id: 'relatorios',
                        name: 'Relatórios & Analytics',
                        description: 'Visualize dados, métricas e estatísticas',
                        icon: BarChart3,
                        gradient: 'from-blue-500 to-blue-700',
                        path: '#',
                        stats: 'Em breve',
                        label: '',
                        trend: '',
                        active: false
                    },
                    {
                        id: 'configuracoes',
                        name: 'Configurações',
                        description: 'Ajustes do sistema e preferências',
                        icon: Settings,
                        gradient: 'from-gray-500 to-gray-700',
                        path: '#',
                        stats: 'Sistema',
                        label: '',
                        trend: '',
                        active: false
                    }
                ]);

                setEstatisticas([
                    {
                        title: 'Atividade Hoje',
                        value: atividade.hoje,
                        subtitle: 'ações realizadas',
                        icon: Activity,
                        color: 'text-green-400',
                        bg: 'bg-green-500/20'
                    },
                    {
                        title: 'Esta Semana',
                        value: atividade.semana,
                        subtitle: 'total de registros',
                        icon: TrendingUp,
                        color: 'text-blue-400',
                        bg: 'bg-blue-500/20'
                    },
                    {
                        title: 'Usuários Ativos',
                        value: atividade.ativos_mes,
                        subtitle: 'últimos 30 dias',
                        icon: Users,
                        color: 'text-purple-400',
                        bg: 'bg-purple-500/20'
                    }
                ]);

            } catch (error) {
                console.error('❌ Erro ao carregar dados do dashboard:', error);
            }
        };

        fetchDadosDashboard();
    }, [API_URL]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const handleSystemClick = (system) => {
        if (system.active) {
            navigate(system.path);
        }
    };

    const acoesRapidas = [
        {
            name: 'Novo Cadastro',
            description: 'Adicionar usuário',
            path: '/cadastramento',
            icon: UserPlus,
            color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
            name: 'Agendar',
            description: 'Novo compromisso',
            path: '/agendamento',
            icon: Calendar,
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            name: 'Buscar',
            description: 'Encontrar dados',
            path: '#',
            icon: Search,
            color: 'bg-blue-500 hover:bg-blue-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Zap size={20} className="text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                                <p className="text-sm text-purple-200">Sistema Integrado</p>
                            </div>
                        </div>

                        {/* Centro - Data/hora */}
                        <div className="hidden lg:flex items-center gap-4 bg-white/10 rounded-2xl px-4 py-2 backdrop-blur-sm">
                            <Clock size={18} className="text-purple-300" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-white">{formatTime(currentTime)}</p>
                                <p className="text-xs text-purple-200 capitalize">{formatDate(currentTime)}</p>
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 relative">
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                                <User size={20} />
                            </button>
                            <button
                                onClick={onLogout}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 ml-2"
                                title="Sair do sistema"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

                {/* Saudação */}
                <div className="mb-8 lg:mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                {greeting}, {userName}! 👋
                            </h2>
                            <p className="text-purple-200 text-lg">
                                Bem-vindo ao seu painel de controle
                            </p>
                        </div>

                        {/* Data/hora mobile */}
                        <div className="lg:hidden bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
                            <Clock size={20} className="text-purple-300" />
                            <div>
                                <p className="text-white font-semibold">{formatTime(currentTime)}</p>
                                <p className="text-sm text-purple-200 capitalize">{formatDate(currentTime)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações rápidas */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap size={20} className="text-purple-400" />
                        Ações Rápidas
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {acoesRapidas.map((acao) => {
                            const IconComponent = acao.icon;
                            return (
                                <button
                                    key={acao.name}
                                    onClick={() => navigate(acao.path)}
                                    className={`${acao.color} p-4 lg:p-6 rounded-2xl text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg group`}
                                >
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                                            <IconComponent size={24} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm lg:text-base">{acao.name}</p>
                                            <p className="text-xs opacity-80">{acao.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mb-8 lg:mb-12">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-purple-400" />
                        Resumo de Atividades
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                        {estatisticas.map((stat) => {
                            const IconComponent = stat.icon;
                            return (
                                <div
                                    key={stat.title}
                                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                            <IconComponent size={24} className={stat.color} />
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-purple-100 mb-1">{stat.title}</p>
                                            <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
                                            <p className="text-sm text-purple-300">{stat.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid de sistemas */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Menu size={20} className="text-purple-400" />
                        Sistemas Disponíveis
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {sistemas.map((system) => {
                            const IconComponent = system.icon;
                            return (
                                <div
                                    key={system.id}
                                    onClick={() => handleSystemClick(system)}
                                    className={`group relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/20 transition-all duration-300 ${system.active
                                            ? 'cursor-pointer hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98]'
                                            : 'opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${system.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`w-16 h-16 bg-gradient-to-r ${system.gradient} rounded-2xl flex items-center justify-center shadow-xl`}>
                                                <IconComponent size={28} className="text-white" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!system.active && (
                                                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/30">
                                                        Em breve
                                                    </span>
                                                )}
                                                {system.active && (
                                                    <ChevronRight size={20} className="text-purple-300 group-hover:text-white transition-colors" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="text-xl font-bold text-white mb-2">
                                                {system.name}
                                            </h4>
                                            <p className="text-purple-200 text-sm leading-relaxed">
                                                {system.description}
                                            </p>
                                        </div>

                                        {system.active && (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-2xl font-bold text-white">{system.stats}</p>
                                                    <p className="text-xs text-purple-300">{system.label}</p>
                                                </div>
                                                {system.trend && (
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-green-400">{system.trend}</p>
                                                        <p className="text-xs text-purple-300">esta semana</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;
