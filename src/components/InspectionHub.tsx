import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Edit3,
  Trash2,
  Download,
  Eye,
  AlertTriangle,
  Building2,
  User,
  ShieldCheck,
  Shield,
  Settings,
  LogOut,
  Search,
  Calendar,
  DollarSign,
  ChevronRight,
  FileCheck,
  Fingerprint,
} from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";
import {
  LaudoEmitido,
  RascunhoVistoria,
  UsuarioAuditor,
  VistoriaState,
} from "../types";
import {
  excluirRascunho,
  excluirLaudo,
  getLaudos,
  getRascunhos,
  getLogoConsultoria,
  calcularDiasSemEdicao,
} from "../utils/storage";
import { isBiometriaHabilitada } from "../utils/biometrics";
import { formatarBRL } from "../data/nr28Data";
import { gerarLaudoPericialPDF } from "../utils/pdfGenerator";

interface InspectionHubProps {
  usuario: UsuarioAuditor;
  onIniciarNovaInspecao: () => void;
  onContinuarInspecao: (estado: VistoriaState) => void;
  onLogout: () => void;
  onAbrirAdmin?: () => void;
  onLaudoExcluido?: () => void;
}

export const InspectionHub: React.FC<InspectionHubProps> = ({
  usuario,
  onIniciarNovaInspecao,
  onContinuarInspecao,
  onLogout,
  onAbrirAdmin,
  onLaudoExcluido,
}) => {
  const [rascunhos, setRascunhos] = useState<RascunhoVistoria[]>([]);
  const [laudos, setLaudos] = useState<LaudoEmitido[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<"todos" | "andamento" | "finalizados" | "parados">("todos");
  const [laudoVisualizando, setLaudoVisualizando] = useState<LaudoEmitido | null>(null);
  const [gerandoPdfId, setGerandoPdfId] = useState<string | null>(null);
  const [mensagemAviso, setMensagemAviso] = useState<string | null>(null);

  const carregarDados = () => {
    setRascunhos(getRascunhos());
    setLaudos(getLaudos());
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleExcluirRascunho = (id: string, empresa: string) => {
    if (window.confirm(`Deseja realmente descartar o rascunho da vistoria da empresa "${empresa}"?`)) {
      excluirRascunho(id);
      carregarDados();
      setMensagemAviso("Rascunho de vistoria excluído com sucesso.");
      setTimeout(() => setMensagemAviso(null), 3000);
    }
  };

  const handleExcluirLaudo = (id: string, empresa: string, numero?: number) => {
    if (usuario.perfil !== "admin") {
      alert("Operação negada: apenas usuários com perfil Administrador têm autorização para excluir laudos emitidos.");
      return;
    }
    const confirmMsg = `ATENÇÃO: Operação restrita a Administrador!\n\nDeseja realmente excluir em definitivo o Laudo Oficial ${
      numero ? `#${numero}` : ""
    } da empresa "${empresa}"?\n\nEsta ação apagará o registro histórico do banco de dados local.`;

    if (window.confirm(confirmMsg)) {
      excluirLaudo(id);
      carregarDados();
      if (onLaudoExcluido) {
        onLaudoExcluido();
      }
      if (laudoVisualizando?.id === id) {
        setLaudoVisualizando(null);
      }
      setMensagemAviso(`Laudo da empresa "${empresa}" excluído com sucesso pelo Administrador.`);
      setTimeout(() => setMensagemAviso(null), 3500);
    }
  };

  const handleBaixarPdfLaudo = async (laudo: LaudoEmitido) => {
    if (!laudo.estado) {
      alert("Os dados completos desta vistoria antiga não estão disponíveis para reemissão em PDF.");
      return;
    }
    try {
      setGerandoPdfId(laudo.id);
      const logo = getLogoConsultoria();
      const blob = await gerarLaudoPericialPDF({
        estado: laudo.estado,
        logoBase64: logo,
        assinaturaInspetor: laudo.estado.assinaturaInspetor,
        assinaturaAcompanhante: laudo.estado.assinaturaAcompanhante,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = laudo.empresa.replace(/[^a-zA-Z0-9]/g, "_");
      link.href = url;
      link.download = `Laudo_SST_${safeName}_${laudo.data.replace(/\//g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF do laudo:", err);
      alert("Não foi possível gerar o PDF deste laudo.");
    } finally {
      setGerandoPdfId(null);
    }
  };

  const rascunhosComDias = rascunhos.map((r) => {
    const diasSemEdicao = calcularDiasSemEdicao(r.dataAtualizacao, r.estado?.data);
    return {
      ...r,
      diasSemEdicao,
      isParadoMaisDe7Dias: diasSemEdicao >= 7,
    };
  });

  const rascunhosParados = rascunhosComDias.filter((r) => r.isParadoMaisDe7Dias);

  const rascunhosFiltrados = rascunhosComDias.filter((r) => {
    const matchBusca =
      r.empresa.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (r.estado?.cnpj && r.estado.cnpj.includes(termoBusca));
    if (abaAtiva === "parados") {
      return matchBusca && r.isParadoMaisDe7Dias;
    }
    return matchBusca;
  });

  const laudosFiltrados = laudos.filter((l) =>
    l.empresa.toLowerCase().includes(termoBusca.toLowerCase()) ||
    l.cnpj.includes(termoBusca) ||
    l.inspetor.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Bar / Navigation */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="VistorIA SST"
              className="w-10 h-10 rounded-xl object-contain shadow-md border border-slate-750"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  VistorIA <span className="text-sky-400">SST</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-md">
                  Portal Pericial
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Gestão e Execução de Laudos NR 28 &amp; Vistorias In Loco
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>{usuario.nome}</span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    usuario.perfil === "admin"
                      ? "bg-indigo-900/80 text-indigo-300 border border-indigo-700"
                      : "bg-sky-900/80 text-sky-300 border border-sky-700"
                  }`}
                >
                  {usuario.perfil === "admin" ? "ADMINISTRADOR" : "INSPETOR"}
                </span>
                {isBiometriaHabilitada(usuario.id) && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 inline-flex items-center gap-1"
                    title="Autenticação Biométrica ativa neste dispositivo"
                  >
                    <Fingerprint className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="hidden md:inline">Biometria Ativa</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                {usuario.cargo} • {usuario.registro}
              </div>
            </div>

            <PWAInstallButton />

            {usuario.perfil === "admin" && onAbrirAdmin && (
              <button
                type="button"
                id="btn-hub-gestao-adm"
                onClick={onAbrirAdmin}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Acessar Painel de Gestão Corporativa e Usuários"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gestão ADM</span>
              </button>
            )}

            {rascunhosParados.length > 0 && (
              <button
                type="button"
                id="btn-notificacao-parados-header"
                onClick={() => setAbaAtiva(abaAtiva === "parados" ? "andamento" : "parados")}
                className="px-2.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
                title={`${rascunhosParados.length} vistoria(s) sem edição há mais de 7 dias`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{rascunhosParados.length} Parada(s) (+7d)</span>
                <span className="sm:hidden">{rascunhosParados.length}</span>
              </button>
            )}

            <button
              type="button"
              id="btn-hub-logout"
              onClick={onLogout}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Encerrar Sessão / Trocar de Usuário"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trocar Usuário</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {mensagemAviso && (
          <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-700/80 rounded-2xl text-xs sm:text-sm text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{mensagemAviso}</span>
            </div>
            <button
              type="button"
              onClick={() => setMensagemAviso(null)}
              className="text-emerald-400 hover:text-white font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Primary Action Hero: Start New Inspection */}
        <div className="mb-8 bg-gradient-to-r from-sky-900/60 via-indigo-900/40 to-slate-900 border border-sky-600/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-950/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 border border-sky-400/30 rounded-full text-[11px] font-bold text-sky-300">
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Nova Auditoria Técnica</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pronto para iniciar um novo levantamento pericial?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Inicie a inspeção técnica de segurança, selecione os itens das NRs (NR 06, NR 10, NR 12, NR 18, NR 35), faça fotos com carimbo forense e apure os valores de multas da NR 28.
            </p>
          </div>

          <button
            type="button"
            id="btn-iniciar-nova-inspecao"
            onClick={onIniciarNovaInspecao}
            className="w-full lg:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-sky-950 hover:shadow-sky-800/40 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Iniciar Nova Inspeção</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ALERTA VISUAL DE VISTORIAS PARADAS (+7 DIAS SEM EDIÇÃO) */}
        {rascunhosParados.length > 0 && (
          <div
            id="alerta-vistorias-paradas-hub"
            className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-950/90 via-slate-950 to-rose-950/80 border-2 border-amber-500/80 rounded-3xl shadow-2xl shadow-amber-950/40 relative overflow-hidden"
          >
            {/* Ambient amber glow */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-950/50 animate-pulse mt-0.5 sm:mt-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Alerta Pericial: {rascunhosParados.length} {rascunhosParados.length === 1 ? "Vistoria Parada" : "Vistorias Paradas"} há mais de 7 dias
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-rose-600 text-white shadow-sm">
                      Ação Necessária
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-200/90 mt-1 leading-relaxed">
                    Identificamos rascunhos de vistorias técnicas sem edição há mais de 7 dias. Vistorias paradas podem acarretar desatualização de prazos legais e agravar riscos periciais da NR 28.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  id="btn-filtrar-parados-hub"
                  onClick={() => setAbaAtiva(abaAtiva === "parados" ? "andamento" : "parados")}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {abaAtiva === "parados" ? "Exibir Todos os Rascunhos" : `Filtrar Apenas Paradas (${rascunhosParados.length})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Lista dos rascunhos parados com destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
              {rascunhosParados.map((r) => (
                <div
                  key={`card-alerta-${r.id}`}
                  className="bg-slate-950/90 border border-amber-500/50 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600/70 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3 text-rose-400" />
                        <span>Parado há {r.diasSemEdicao} dias</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Última: {r.dataAtualizacao?.split(",")[0] || r.estado.data}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{r.empresa}</span>
                    </h4>

                    {r.estado?.cnpj && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        CNPJ: {r.estado.cnpj}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Apontamentos:</span>
                      <span className="font-bold text-amber-300">
                        {r.estado?.evidencias?.length || 0} item(ns)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onContinuarInspecao(r.estado)}
                    className="w-full h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Retomar Vistoria Agora</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 flex-wrap gap-1">
            <button
              type="button"
              id="tab-todas-inspecoes"
              onClick={() => setAbaAtiva("todos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                abaAtiva === "todos"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Todas as Inspeções ({rascunhos.length + laudos.length})
            </button>
            <button
              type="button"
              id="tab-inspecoes-andamento"
              onClick={() => setAbaAtiva("andamento")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                abaAtiva === "andamento"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Em Andamento ({rascunhos.length})</span>
            </button>
            {rascunhosParados.length > 0 && (
              <button
                type="button"
                id="tab-inspecoes-paradas"
                onClick={() => setAbaAtiva("parados")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  abaAtiva === "parados"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-700/60"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Paradas +7 Dias ({rascunhosParados.length})</span>
              </button>
            )}
            <button
              type="button"
              id="tab-inspecoes-finalizadas"
              onClick={() => setAbaAtiva("finalizados")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                abaAtiva === "finalizados"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finalizadas / Assinadas ({laudos.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-busca-inspecoes"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por empresa, CNPJ..."
              className="w-full h-10 pl-9 pr-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Legal Immutability Notice */}
        <div className="mb-6 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white">Regra de Segurança Pericial e Jurídica:</span>{" "}
            Inspeções <span className="text-amber-300 font-semibold">em andamento</span> podem ser continuadas ou editadas livremente. Após a coleta das assinaturas e emissão oficial, a inspeção é{" "}
            <span className="text-emerald-300 font-bold">lacrada e imutável</span>, garantindo fé pública e integridade forense aos laudos emitidos.
          </div>
        </div>

        {/* SECTION 1: Em Andamento / Rascunhos */}
        {(abaAtiva === "todos" || abaAtiva === "andamento" || abaAtiva === "parados") && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${abaAtiva === "parados" ? "bg-rose-500 animate-ping" : "bg-amber-400 animate-pulse"}`} />
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {abaAtiva === "parados"
                      ? "Vistorias Paradas há mais de 7 dias (Atenção Pericial)"
                      : "Inspeções em Andamento (Editáveis)"}
                  </span>
                </h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  abaAtiva === "parados"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}>
                  {rascunhosFiltrados.length}
                </span>
              </div>
            </div>

            {rascunhosFiltrados.length === 0 ? (
              <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-400">
                  {abaAtiva === "parados"
                    ? "Nenhuma vistoria parada há mais de 7 dias encontrada."
                    : "Nenhuma inspeção em andamento no momento."}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Clique em "Iniciar Nova Inspeção" para começar uma vistoria pericial.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rascunhosFiltrados.map((rascunho) => (
                  <div
                    key={rascunho.id}
                    className={`border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                      rascunho.isParadoMaisDe7Dias
                        ? "bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-amber-500/80 ring-1 ring-amber-500/40 shadow-amber-950/30"
                        : "bg-slate-950 border-slate-800 hover:border-amber-500/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Edit3 className="w-3 h-3" />
                            EM ANDAMENTO
                          </span>
                          {rascunho.isParadoMaisDe7Dias && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-600/80 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              PARADO HÁ {rascunho.diasSemEdicao} DIAS
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {rascunho.dataAtualizacao || rascunho.estado.data}
                        </span>
                      </div>

                      {/* Notificação explicativa para o inspetor sobre o tempo parado */}
                      {rascunho.isParadoMaisDe7Dias && (
                        <div className="mb-3 p-2.5 bg-amber-950/60 border border-amber-600/50 rounded-xl text-[11px] text-amber-200 flex items-start gap-2 leading-tight">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-300">Atenção Pericial:</strong> Esta vistoria está sem edição há{" "}
                            <span className="font-bold text-white underline">{rascunho.diasSemEdicao} dias</span>. Recomenda-se dar continuidade aos apontamentos e emitir o laudo para garantir a vigência dos prazos legais da NR 28.
                          </div>
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5 truncate">
                        <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="truncate">{rascunho.empresa || "Empresa não informada"}</span>
                      </h4>

                      {rascunho.estado?.cnpj && (
                        <p className="text-xs text-slate-400 mb-3 font-mono">
                          CNPJ: {rascunho.estado.cnpj}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs mb-4">
                        <div>
                          <span className="block text-[10px] text-slate-400">Itens / Fotos:</span>
                          <span className="font-bold text-white">
                            {rascunho.estado?.evidencias?.length || 0} apontamento(s)
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Não Conformidades:</span>
                          <span className="font-bold text-rose-400">
                            {rascunho.estado?.evidencias?.filter((e) => e.status === "Não Conformidade").length || 0} irregularidade(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        id={`btn-continuar-${rascunho.id}`}
                        onClick={() => onContinuarInspecao(rascunho.estado)}
                        className={`flex-1 h-9 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md ${
                          rascunho.isParadoMaisDe7Dias
                            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                            : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{rascunho.isParadoMaisDe7Dias ? "Retomar e Concluir Vistoria" : "Continuar / Editar"}</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-excluir-${rascunho.id}`}
                        onClick={() => handleExcluirRascunho(rascunho.id, rascunho.empresa)}
                        className="h-9 px-3 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 rounded-xl text-xs transition-colors cursor-pointer"
                        title="Descartar rascunho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Finalizadas & Assinadas (Imutáveis) */}
        {(abaAtiva === "todos" || abaAtiva === "finalizados") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Inspeções Finalizadas &amp; Assinadas (Imutáveis)</span>
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {laudosFiltrados.length}
                </span>
              </div>
            </div>

            {laudosFiltrados.length === 0 ? (
              <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
                <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-400">
                  Nenhuma inspeção assinada ou laudo emitido até o momento.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Quando uma vistoria for concluída com assinatura digital, ela será arquivada aqui permanentemente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {laudosFiltrados.map((laudo, idx) => (
                  <div
                    key={laudo.id}
                    className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all relative overflow-hidden"
                  >
                    {/* Legal Seal Watermark */}
                    <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center pointer-events-none">
                        <Lock className="w-6 h-6 text-emerald-500/30" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          FINALIZADA &amp; ASSINADA
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          {laudo.data}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5 truncate">
                        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{laudo.empresa}</span>
                      </h4>

                      <p className="text-xs text-slate-400 mb-3 font-mono">
                        CNPJ: {laudo.cnpj || "Não cadastrado"}
                      </p>

                      <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs mb-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Auditor Responsável:</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                            {laudo.inspetor}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Preposto Signatário:</span>
                          <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                            {laudo.acompNome}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Passivo NR 28 Apurado:</span>
                          <span className="font-bold text-rose-400">
                            {formatarBRL(laudo.passivoRiscoMax)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        {/* Download Official Signed PDF */}
                        <button
                          type="button"
                          id={`btn-baixar-pdf-${laudo.id}`}
                          onClick={() => handleBaixarPdfLaudo(laudo)}
                          disabled={gerandoPdfId === laudo.id}
                          className="flex-1 h-9 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-400" />
                          <span>{gerandoPdfId === laudo.id ? "Gerando PDF..." : "Baixar Laudo PDF"}</span>
                        </button>

                        {/* View in Read-Only Mode */}
                        <button
                          type="button"
                          id={`btn-ver-laudo-${laudo.id}`}
                          onClick={() => setLaudoVisualizando(laudo)}
                          className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Visualizar laudo pericial"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        {/* Delete Button (Restricted strictly to ADM) */}
                        {usuario.perfil === "admin" && (
                          <button
                            type="button"
                            id={`btn-excluir-laudo-${laudo.id}`}
                            onClick={() => handleExcluirLaudo(laudo.id, laudo.empresa, laudo.numero)}
                            className="h-9 px-3 bg-slate-900 hover:bg-rose-950/70 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Excluir Laudo Permanentemente (Função Exclusiva para Administrador)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        )}
                      </div>

                      {/* Disabled Edit Button with Explanatory Warning */}
                      <button
                        type="button"
                        disabled
                        className="w-full h-7.5 bg-slate-900/50 border border-slate-800 text-slate-400 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed opacity-75"
                        title="Documento jurídico oficial finalizado. Edição bloqueada permanentemente."
                      >
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Edição Bloqueada (Documento Assinado)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Visualização Somente-Leitura do Laudo */}
      {laudoVisualizando && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Visualização Oficial do Laudo Pericial</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      IMUTÁVEL
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {laudoVisualizando.empresa} — Emitido em {laudoVisualizando.data}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLaudoVisualizando(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Razão Social:</span>
                  <span className="font-bold text-white text-sm">{laudoVisualizando.empresa}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">CNPJ / Cadastro:</span>
                  <span className="font-mono text-slate-300">{laudoVisualizando.cnpj || "Não cadastrado"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Auditor / Perito Responsável:</span>
                  <span className="font-semibold text-slate-200">{laudoVisualizando.inspetor}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{laudoVisualizando.regInspetor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Acompanhante / Preposto:</span>
                  <span className="font-semibold text-slate-200">{laudoVisualizando.acompNome}</span>
                  <span className="text-[10px] text-slate-400 block">{laudoVisualizando.acompCargo}</span>
                </div>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400">Total de Itens</span>
                  <span className="text-base font-black text-white">{laudoVisualizando.totalItens}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-rose-950 text-center">
                  <span className="block text-[10px] text-rose-400">Não Conformidades</span>
                  <span className="text-base font-black text-rose-300">{laudoVisualizando.totalNaoConformidades}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400">Passivo NR 28</span>
                  <span className="text-sm font-bold text-rose-400">{formatarBRL(laudoVisualizando.passivoRiscoMax)}</span>
                </div>
              </div>

              {/* Evidence list */}
              {laudoVisualizando.estado && laudoVisualizando.estado.evidencias.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2.5">
                    Apontamentos Registrados ({laudoVisualizando.estado.evidencias.length})
                  </h4>
                  <div className="space-y-2.5">
                    {laudoVisualizando.estado.evidencias.map((ev, i) => (
                      <div key={ev.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                        {ev.fotoDataUrl ? (
                          <img
                            src={ev.fotoDataUrl}
                            alt="Evidência"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                            Sem foto
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                ev.status === "Não Conformidade"
                                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              }`}
                            >
                              {ev.status}
                            </span>
                            <span className="font-bold text-white">
                              #{i + 1} {ev.nr} (Item {ev.itemNr})
                            </span>
                          </div>
                          <p className="text-slate-300 mt-1 font-medium line-clamp-2">
                            {ev.descricaoCenario}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures Verified */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/60">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Assinaturas Digitais Homologadas</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Este laudo possui termo de ciência firmado e assinado digitalmente pelas partes com carimbo forense e registro no banco de dados local.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
              <div>
                {usuario.perfil === "admin" && (
                  <button
                    type="button"
                    id={`btn-modal-excluir-laudo-${laudoVisualizando.id}`}
                    onClick={() => handleExcluirLaudo(laudoVisualizando.id, laudoVisualizando.empresa, laudoVisualizando.numero)}
                    className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Excluir este laudo permanentemente (Restrito a Administrador)"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Excluir Laudo (ADM)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLaudoVisualizando(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => handleBaixarPdfLaudo(laudoVisualizando)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Laudo Oficial (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
