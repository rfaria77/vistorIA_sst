import React from "react";
import { ShieldAlert, Settings, Plus, Sparkles, Building2, CheckCircle2, ArrowLeft, LayoutGrid, BarChart3, CalendarDays } from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

interface NavbarProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  findingsCount: number;
  onOpenAdmin: () => void;
  onNovaVistoria: () => void;
  onVoltarHub?: () => void;
  onAbrirDashboard?: () => void;
  onAbrirProgramacao?: () => void;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onSetStep,
  findingsCount,
  onOpenAdmin,
  onNovaVistoria,
  onVoltarHub,
  onAbrirDashboard,
  onAbrirProgramacao,
  isAdmin = false,
}) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3">
        {/* Top Brand & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            {onVoltarHub && (
              <button
                type="button"
                id="btn-voltar-hub"
                onClick={onVoltarHub}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center border border-slate-700 transition-colors"
                title="Voltar ao Painel de Inspeções"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <img
              src="/icon-192.png"
              alt="VistorIA SST"
              className="w-10 h-10 rounded-xl object-contain shadow-md border border-slate-700/60"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-white flex items-center">
                  Vistor<span className="text-sky-400">IA</span>
                </span>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  SST
                </span>
                <span className="hidden xs:inline-flex bg-sky-500/15 text-sky-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-400/20 items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                  IA Groq + Gemini
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide uppercase">
                Auditoria Pericial &amp; Riscos NR 28
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <PWAInstallButton />

            {onVoltarHub && (
              <button
                type="button"
                id="btn-nav-hub"
                onClick={onVoltarHub}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                title="Painel de Inspeções"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Painel</span>
              </button>
            )}

            {onAbrirDashboard && (
              <button
                type="button"
                id="btn-nav-dashboard"
                onClick={onAbrirDashboard}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                title="Abrir Dashboard de Gestão"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

            {onAbrirProgramacao && (
              <button
                type="button"
                id="btn-nav-programacao"
                onClick={onAbrirProgramacao}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                title="Programação de Relatórios por Empresa"
              >
                <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Programação</span>
              </button>
            )}

            <button
              type="button"
              id="btn-nova-vistoria"
              onClick={onNovaVistoria}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
              title="Iniciar nova auditoria"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Vistoria</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                id="btn-abrir-gestao"
                onClick={onOpenAdmin}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                title="Gestão Corporativa (Acesso ADM)"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Gestão ADM</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Tabs Indicator */}
        <nav className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            id="tab-step-1"
            onClick={() => onSetStep(1)}
            className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              currentStep === 1
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span>1. Empresa</span>
          </button>

          <button
            type="button"
            id="tab-step-2"
            onClick={() => onSetStep(2)}
            className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              currentStep === 2
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span>2. Apontamentos</span>
            {findingsCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  currentStep === 2 ? "bg-white text-sky-700" : "bg-sky-500/30 text-sky-300"
                }`}
              >
                {findingsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-step-3"
            onClick={() => onSetStep(3)}
            className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              currentStep === 3
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <span>3. Laudo & Assinatura</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
