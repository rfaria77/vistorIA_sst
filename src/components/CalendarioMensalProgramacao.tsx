import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Sparkles,
  Edit2,
  Play,
  X,
  FileText,
} from "lucide-react";
import { ProgramacaoRelatorio } from "../types";
import { PERIODICIDADES_INFO } from "./GestaoProgramacaoRelatorios";

interface CalendarioMensalProps {
  programacoes: Array<ProgramacaoRelatorio & { statusCalculado: string; statusLabel: string }>;
  onEditar: (prog: ProgramacaoRelatorio) => void;
  onIniciarVistoria: (empresaNome: string, tipo: string) => void;
}

export const CalendarioMensalProgramacao: React.FC<CalendarioMensalProps> = ({
  programacoes,
  onEditar,
  onIniciarVistoria,
}) => {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [eventoSelecionado, setEventoSelecionado] = useState<
    (ProgramacaoRelatorio & { statusCalculado: string; statusLabel: string }) | null
  >(null);

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth(); // 0 a 11

  const nomeMes = dataAtual.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const primeiroDiaMes = new Date(ano, mes, 1);
  const ultimoDiaMes = new Date(ano, mes + 1, 0);
  const diasNoMes = ultimoDiaMes.getDate();
  const diaSemanaInicio = primeiroDiaMes.getDay(); // 0 (Domingo) a 6 (Sábado)

  const handleMesAnterior = () => {
    setDataAtual(new Date(ano, mes - 1, 1));
  };

  const handleMesProximo = () => {
    setDataAtual(new Date(ano, mes + 1, 1));
  };

  const handleMesAtual = () => {
    setDataAtual(new Date());
  };

  // Mapeia eventos por dia do mês (YYYY-MM-DD)
  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, Array<ProgramacaoRelatorio & { statusCalculado: string; statusLabel: string }>>();

    programacoes.forEach((prog) => {
      if (!prog.dataProximaProgramada) return;
      // Esperado YYYY-MM-DD ou DD/MM/YYYY
      let dataStr = prog.dataProximaProgramada;
      if (dataStr.includes("/")) {
        const parts = dataStr.split("/");
        if (parts.length === 3) {
          dataStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      const [pAno, pMes, pDia] = dataStr.split("-");
      if (pAno && pMes && pDia) {
        const chave = `${pAno}-${pMes}-${pDia}`;
        const lista = mapa.get(chave) || [];
        lista.push(prog);
        mapa.set(chave, lista);
      }
    });

    return mapa;
  }, [programacoes]);

  // Dias da semana
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Monta a grade de células (dias do mês anterior, mês atual e próximo)
  const celulas = useMemo(() => {
    const lista: Array<{
      dataIso: string;
      diaNum: number;
      mesAtual: boolean;
      eventos: Array<ProgramacaoRelatorio & { statusCalculado: string; statusLabel: string }>;
    }> = [];

    // Dias do mês anterior para preencher a primeira semana
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const dNum = ultimoDiaMesAnterior - i;
      const mesAnt = mes === 0 ? 11 : mes - 1;
      const anoAnt = mes === 0 ? ano - 1 : ano;
      const dataIso = `${anoAnt}-${String(mesAnt + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      lista.push({
        dataIso,
        diaNum: dNum,
        mesAtual: false,
        eventos: eventosPorDia.get(dataIso) || [],
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= diasNoMes; d++) {
      const dataIso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      lista.push({
        dataIso,
        diaNum: d,
        mesAtual: true,
        eventos: eventosPorDia.get(dataIso) || [],
      });
    }

    // Preenche o restante da última semana com dias do próximo mês
    const totalCelulas = Math.ceil(lista.length / 7) * 7;
    const diasRestantes = totalCelulas - lista.length;
    for (let d = 1; d <= diasRestantes; d++) {
      const mesProx = mes === 11 ? 0 : mes + 1;
      const anoProx = mes === 11 ? ano + 1 : ano;
      const dataIso = `${anoProx}-${String(mesProx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      lista.push({
        dataIso,
        diaNum: d,
        mesAtual: false,
        eventos: eventosPorDia.get(dataIso) || [],
      });
    }

    return lista;
  }, [ano, mes, diasNoMes, diaSemanaInicio, eventosPorDia]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Cabeçalho do Calendário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white capitalize flex items-center gap-2">
              <span>{nomeMes}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Calendário Mensal de Vistoria
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualize graficamente as datas agendadas e clique em qualquer evento para gerenciar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleMesAtual}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Hoje
          </button>
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              type="button"
              onClick={handleMesAnterior}
              className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleMesProximo}
              className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500"></span> Em Atraso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500"></span> Vence em Breve (≤ 7 dias)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500"></span> Em Dia (No Prazo)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-500"></span> Eventual / Demanda
        </span>
      </div>

      {/* Grade de Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-2 border-b border-slate-800">
        {diasSemana.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Grade de Dias do Mês */}
      <div className="grid grid-cols-7 gap-1.5">
        {celulas.map((cel, idx) => {
          const hojeIso = new Date().toISOString().split("T")[0];
          const isHoje = cel.dataIso === hojeIso;

          return (
            <div
              key={idx}
              className={`min-h-[100px] sm:min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                cel.mesAtual
                  ? "bg-slate-950/80 border-slate-800"
                  : "bg-slate-950/30 border-slate-900/60 opacity-40"
              } ${isHoje ? "ring-2 ring-sky-500/80 border-sky-500" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-lg ${
                    isHoje
                      ? "bg-sky-600 text-white"
                      : cel.mesAtual
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  {cel.diaNum}
                </span>
                {cel.eventos.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-mono">
                    {cel.eventos.length}
                  </span>
                )}
              </div>

              {/* Lista de Eventos no Dia */}
              <div className="space-y-1 overflow-y-auto max-h-[70px] mt-1 pr-0.5">
                {cel.eventos.map((ev) => {
                  let corBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                  if (ev.statusCalculado === "atrasado") {
                    corBadge = "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
                  } else if (ev.statusCalculado === "atencao") {
                    corBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
                  } else if (ev.statusCalculado === "eventual") {
                    corBadge = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
                  }

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setEventoSelecionado(ev)}
                      className={`w-full text-left px-1.5 py-1 rounded-lg text-[10px] font-semibold border truncate transition hover:scale-[1.02] cursor-pointer ${corBadge}`}
                      title={`${ev.empresaNome} - ${ev.tipoRelatorio}`}
                    >
                      <span className="font-bold">{ev.empresaNome.split(" ")[0]}:</span> {ev.tipoRelatorio}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE DETALHES DO EVENTO CLICADO */}
      {eventoSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-400" />
                <span>Detalhes da Programação</span>
              </h4>
              <button
                type="button"
                onClick={() => setEventoSelecionado(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Empresa / Cliente</span>
                <strong className="text-white text-sm">{eventoSelecionado.empresaNome}</strong>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Tipo de Relatório / Vistoria</span>
                <span className="text-slate-200 font-semibold">{eventoSelecionado.tipoRelatorio}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Periodicidade</span>
                  <span className="text-white font-bold capitalize">{eventoSelecionado.periodicidade}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Próxima Vistoria</span>
                  <span className="text-sky-400 font-bold font-mono">{eventoSelecionado.dataProximaProgramada}</span>
                </div>
              </div>

              {eventoSelecionado.observacoes && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Observações</span>
                  <p className="text-slate-300">{eventoSelecionado.observacoes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const ev = eventoSelecionado;
                  setEventoSelecionado(null);
                  onEditar(ev);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Programação</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const ev = eventoSelecionado;
                  setEventoSelecionado(null);
                  onIniciarVistoria(ev.empresaNome, ev.tipoRelatorio);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Iniciar Vistoria Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
