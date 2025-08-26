import React from "react";

function AgendamentoCard({
  agendamento,
  onClick,
  getTipoLabel,
  getTipoColor,
  formatarData,
  formatarHora,
  formatarParticipantes
}) {
  return (
    <div
      onClick={() => onClick(agendamento)}
      className="bg-slate-800 p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-slate-700 hover:border-purple-500"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-white">{agendamento.titulo}</h2>
        <span
          className="px-2 py-1 rounded text-xs text-white"
          style={{ backgroundColor: getTipoColor(agendamento.tipo) }}
        >
          {getTipoLabel(agendamento.tipo)}
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-1">{agendamento.descricao}</p>
      <p className="text-slate-400 text-sm">
        {formatarData(agendamento.data_hora)} às {formatarHora(agendamento.data_hora)}
      </p>
      <p className="text-slate-400 text-sm">Local: {agendamento.local ?? "Não informado"}</p>
      <p className="text-slate-400 text-sm">
        Participantes: {formatarParticipantes(agendamento.participantes)}
      </p>
    </div>
  );
}

export default AgendamentoCard;
