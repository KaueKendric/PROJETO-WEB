import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Users, Calendar, UserPlus } from 'lucide-react';

function DashboardPage() {
    const [summary, setSummary] = useState({ cadastros: 0, agendamentos: 0 });
    const [atividade, setAtividade] = useState({ hoje: 0, semana: 0, ativos_mes: 0 });

    useEffect(() => {
        fetch("http://localhost:8000/api/dashboard/summary")
            .then(res => res.json())
            .then(data => setSummary(data));

        fetch("http://localhost:8000/api/dashboard/atividade")
            .then(res => res.json())
            .then(data => setAtividade(data));
    }, []);

    return (
        <div className="p-8 text-white">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Cadastros" value={summary.cadastros} icon={UserPlus} />
                <Card title="Agendamentos" value={summary.agendamentos} icon={Calendar} />
                <Card title="Atividade Hoje" value={atividade.hoje} icon={Activity} />
                <Card title="Atividade Semana" value={atividade.semana} icon={TrendingUp} />
                <Card title="Usuários Ativos no Mês" value={atividade.ativos_mes} icon={Users} />
            </div>
        </div>
    );
}

function Card({ title, value }) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-full">
                <Icon size={24} />
            </div>
            <div>
                <h2 className="text-xl font-semibold">{value}</h2>
                <p className="text-sm text-purple-300">{title}</p>
            </div>
        </div>
    );
}

export default DashboardPage;
