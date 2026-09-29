import React from "react";
import { ClipboardList, ShieldAlert, BarChart3, CalendarDays, Settings, LogOut, ArrowRight, Sparkles, Building2, User, Briefcase, Truck } from "lucide-react";
import { UsuarioAuditor } from "../types";

interface ModuloSelectorProps {
  usuario: UsuarioAuditor;
  onSelecionarModulo: (modulo: "inspecao" | "investigacao" | "dashboard" | "programacao" | "atividades" | "checklist_equipamentos" | "admin") => void;
  onLogout: () => void;
  totalRascunhos: number;
  totalLaudos: number;
  totalProgramacoesAtrasadas: number;
}

export const ModuloSelector: React.FC<ModuloSelectorProps> = ({
  usuario,
  onSelecionarModulo,
  onLogout,
  totalRascunhos,
  totalLaudos,
  totalProgramacoesAtrasadas,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Header Corporativo */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-sky-950">
            SST
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              <span>VistorIA SST &amp; Auditoria Pericial</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Plataforma Multimodular
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Profissional: <strong className="text-slate-200">{usuario.nome}</strong> ({usuario.cargo} • {usuario.registro})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {usuario.perfil === "admin" && (
            <button
              type="button"
              onClick={() => onSelecionarModulo("admin")}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Painel ADM &amp; Usuários</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Encerrar Sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Hero Central de Seleção */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Bem-vindo(a), {usuario.nome.split(" ")[0]}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Selecione o Módulo de Atuação Profissional
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Escolha abaixo qual sistema pericial deseja acessar para iniciar levantamentos, investigações, painéis gerenciais ou agendamentos.
          </p>
        </div>

        {/* Grade de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* MÓDULO 1: INVESTIGAÇÃO DE ACIDENTES */}
          <div
            onClick={() => onSelecionarModulo("investigacao")}
            className="group relative bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/60 border-2 border-slate-800 hover:border-rose-500 rounded-3xl p-6 sm:p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-950 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                    Investigação de Acidentes
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Módulo de Análise
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Investigue acidentes com dano pessoal ou dano material. Conduza análise de causa raiz, fatores contributivos, árvore de causas e plano de ação CAPA.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 font-medium">
                <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  Danos Pessoais &amp; Materiais
                </span>
                <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  PDF Oficial
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300">
              <span>Acessar Investigação de Acidentes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* MÓDULO 2: VISTORIA SST & LAUDOS PERICIAIS */}
          <div
            onClick={() => onSelecionarModulo("inspecao")}
            className="group relative bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 border-2 border-slate-800 hover:border-sky-500 rounded-3xl p-6 sm:p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-950 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                    Vistorias SST &amp; Laudos NRs
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Módulo Principal
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Realize inspeções completas em Normas Regulamentadoras (NR 06, NR 10, NR 12, NR 18, NR 35), adicione evidências com fotos forenses e apure multas da NR 28.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 font-medium">
                <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {totalRascunhos} rascunho(s)
                </span>
                <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {totalLaudos} laudo(s) emitido(s)
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300">
              <span>Acessar Vistorias e Rascunhos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Atalhos Secundários (Dashboard & Programação) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full pt-2">
          <button
            type="button"
            onClick={() => onSelecionarModulo("dashboard")}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition group cursor-pointer text-left shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dashboard de Gestão &amp; Gráficos</h4>
                <p className="text-[11px] text-slate-400">Indicadores periciais, NRs violadas e multas acumuladas</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => onSelecionarModulo("programacao")}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition group cursor-pointer text-left shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Programação &amp; Prazos Periódicos</h4>
                <p className="text-[11px] text-slate-400">
                  {totalProgramacoesAtrasadas > 0 ? `${totalProgramacoesAtrasadas} relatório(s) atrasados` : "Cronograma em dia"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition" />
          </button>

          <button
            type="button"
            onClick={() => onSelecionarModulo("checklist_equipamentos")}
            className="p-4 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition group cursor-pointer text-left shadow-md sm:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Checklist de Equipamentos, Máquinas e Áreas de Vivência (NR 11, 12, 18, 24)</h4>
                <p className="text-[11px] text-slate-400">Inspeções técnicas de empilhadeiras, caminhão munck, guindastes e instalações</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-slate-900">
        VistorIA SST &amp; Auditoria Pericial • Desenvolvido para Engenharia e Segurança do Trabalho
      </footer>
    </div>
  );
};
