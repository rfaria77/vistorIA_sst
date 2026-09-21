import React, { useState } from "react";
import {
  FileCheck2,
  Send,
  Download,
  CheckCircle2,
  ShieldCheck,
  User,
  Briefcase,
  AlertCircle,
  FileText,
  Loader2,
  ExternalLink,
  Mail,
  Copy,
  Check,
  Users,
  Eye,
  EyeOff,
  QrCode,
  Smartphone,
} from "lucide-react";
import { VistoriaState } from "../types";
import { SignatureCanvas } from "./SignatureCanvas";
import { ModalQrCodeAssinaturaRemota } from "./ModalQrCodeAssinaturaRemota";
import { formatarBRL } from "../data/nr28Data";
import {
  gerarLinkEmail,
  gerarLinkWhatsApp,
  gerarTextoResumoExecutivo,
  salvarLaudo,
} from "../utils/storage";
import { gerarLaudoPericialPDF } from "../utils/pdfGenerator";

interface ClosureStepProps {
  state: VistoriaState;
  onChange: (field: keyof VistoriaState, value: any) => void;
  logoBase64?: string | null;
  onLaudoEmitido?: () => void;
}

export const ClosureStep: React.FC<ClosureStepProps> = ({
  state,
  onChange,
  logoBase64,
  onLaudoEmitido,
}) => {
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  const mostrarMultas = state.mostrarMultas !== false;

  const totalNaoConformidades = state.evidencias.filter((e) => e.status === "Não Conformidade").length;
  const passivoMax = state.evidencias
    .filter((e) => e.status === "Não Conformidade")
    .reduce((acc, curr) => acc + curr.valorMax, 0);

  const economiaMax = state.evidencias
    .filter((e) => e.status === "Conformidade")
    .reduce((acc, curr) => acc + curr.valorMax, 0);

  const [emailDestino, setEmailDestino] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [modalQrCodeAberto, setModalQrCodeAberto] = useState(false);
  const [assinaturaRemotaRecebida, setAssinaturaRemotaRecebida] = useState(false);

  const handleAssinaturaRemotaRecebida = (
    dataUrl: string,
    acompNome?: string,
    acompCargo?: string
  ) => {
    onChange("assinaturaAcompanhante", dataUrl);
    if (acompNome && acompNome.trim()) onChange("acompNome", acompNome.trim());
    if (acompCargo && acompCargo.trim()) onChange("acompCargo", acompCargo.trim());
    setAssinaturaRemotaRecebida(true);
  };

  // Clean WhatsApp Link without markdown glitches, respecting financial toggle
  const whatsappUrl = gerarLinkWhatsApp(
    state.wpp || "11999999999",
    state.empresa || "Empresa Auditada",
    passivoMax,
    economiaMax,
    totalNaoConformidades,
    mostrarMultas
  );

  const emailUrl = gerarLinkEmail(
    emailDestino || "diretoria@empresa.com.br",
    state.empresa || "Empresa Auditada",
    passivoMax,
    economiaMax,
    totalNaoConformidades,
    state.inspetor,
    mostrarMultas
  );

  const handleCopiarResumo = async () => {
    const texto = gerarTextoResumoExecutivo(
      state.empresa || "Empresa Auditada",
      passivoMax,
      economiaMax,
      totalNaoConformidades,
      state.inspetor,
      mostrarMultas
    );
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleToggleMultas = (ativo: boolean) => {
    onChange("mostrarMultas", ativo);
    onChange("publicoAlvo", ativo ? "gestor" : "lider");
  };

  const handleEmitirPDF = async () => {
    try {
      setGerandoPdf(true);
      setSucessoMsg(null);

      const blob = await gerarLaudoPericialPDF({
        estado: state,
        logoBase64,
        assinaturaInspetor: state.assinaturaInspetor,
        assinaturaAcompanhante: state.assinaturaAcompanhante,
        mostrarMultas,
      });

      setPdfBlob(blob);

      // Save to local registry of issued reports
      salvarLaudo({
        data: state.data || new Date().toLocaleDateString("pt-BR"),
        empresa: state.empresa,
        cnpj: state.cnpj,
        inspetor: state.inspetor,
        regInspetor: state.regInspetor,
        acompNome: state.acompNome,
        acompCargo: state.acompCargo,
        totalItens: state.evidencias.length,
        totalNaoConformidades,
        passivoRiscoMax: passivoMax,
        economiaGeradaMax: economiaMax,
        estado: JSON.parse(JSON.stringify(state)),
        mostrarMultas,
        publicoAlvo: mostrarMultas ? "gestor" : "lider",
      });

      // Trigger instant download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = state.empresa.replace(/[^a-zA-Z0-9]/g, "_");
      const tipoSufixo = mostrarMultas ? "Gestores" : "Lideres";
      link.href = url;
      link.download = `Laudo_SST_${safeName}_${tipoSufixo}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSucessoMsg(
        `Laudo Técnico (${mostrarMultas ? "Com Multas / Gestores" : "Sem Multas / Líderes"}) gerado e baixado com sucesso!`
      );
      if (onLaudoEmitido) {
        onLaudoEmitido();
      }
    } catch (err) {
      console.error("Falha ao gerar Laudo PDF:", err);
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Fechamento do Laudo & Termo de Ciência</h2>
            <p className="text-xs text-slate-500">Configuração de público-alvo, assinaturas forenses e emissão do parecer oficial</p>
          </div>
        </div>

        {/* SELEÇÃO DO PÚBLICO-ALVO / OPÇÃO DE MOSTRAR MULTAS */}
        <div className="mb-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-3.5 sm:p-4 border border-slate-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/80">
            <div>
              <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
                Público-Alvo & Perfil do Laudo
              </span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {mostrarMultas ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
                Exibição de Valores e Estimativas de Multas (NR 28)
              </h3>
            </div>

            {/* Direct Switch */}
            <label className="inline-flex items-center gap-2.5 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors shrink-0">
              <span className="text-xs font-semibold text-slate-200">
                {mostrarMultas ? "Multas Visíveis" : "Multas Ocultadas"}
              </span>
              <input
                type="checkbox"
                id="toggle-mostrar-multas"
                checked={mostrarMultas}
                onChange={(e) => handleToggleMultas(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative"></div>
            </label>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            Selecione para quem este relatório será apresentado. A seleção ajusta automaticamente o laudo em PDF, os gráficos comparativos e os textos de compartilhamento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            {/* Opção 1: Gestores */}
            <button
              type="button"
              id="btn-selecionar-gestores"
              onClick={() => handleToggleMultas(true)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                mostrarMultas
                  ? "bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/40"
                  : "bg-slate-800/60 border-slate-700 hover:border-slate-600 opacity-75"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${mostrarMultas ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white">Para Gestores & Diretoria</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Com Multas (R$)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Exibe passivo em risco, economia gerada, diagnóstico financeiro da NR 28 e multas estimadas.
                </p>
              </div>
            </button>

            {/* Opção 2: Líderes */}
            <button
              type="button"
              id="btn-selecionar-lideres"
              onClick={() => handleToggleMultas(false)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                !mostrarMultas
                  ? "bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40"
                  : "bg-slate-800/60 border-slate-700 hover:border-slate-600 opacity-75"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${!mostrarMultas ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white">Para Líderes & Operacional</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Sem Multas (Foco Campo)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Oculta as cifras e valores em R$. Foca em ações corretivas, prioridades de segurança e matriz 5W2H.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Resumo Pericial Adaptado */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-slate-600" />
              Resumo da Auditoria ({mostrarMultas ? "Perfil Gerencial" : "Perfil Operacional / Líderes"})
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              mostrarMultas ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
            }`}>
              {mostrarMultas ? "Valores NR 28 Ativos" : "Valores Financeiros Ocultados"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Apontamentos Avaliados</span>
              <span className="text-base font-bold text-slate-900">{state.evidencias.length} itens</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Não Conformidades</span>
              <span className="text-base font-bold text-rose-600">{totalNaoConformidades} críticas</span>
            </div>

            {mostrarMultas ? (
              <>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Passivo em Risco NR 28</span>
                  <span className="text-sm font-bold text-rose-600">{formatarBRL(passivoMax)}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Economia Gerada</span>
                  <span className="text-sm font-bold text-emerald-600">{formatarBRL(economiaMax)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Perfil do Relatório</span>
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5" /> Líderes de Setor
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Exibição de Multas</span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" /> Cifras Ocultadas
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Tag CNAE e Grau de Risco */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs mb-3">
            <div>
              <span className="text-slate-500 text-[11px] block">Enquadramento NR 04</span>
              <span className="font-bold text-slate-800">
                {state.cnae ? `CNAE ${state.cnae}` : "CNAE Padrão"} • Grau de Risco {state.grauRisco || 3}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-md font-black text-xs ${
              (state.grauRisco || 3) >= 3 ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}>
              Grau {state.grauRisco || 3}
            </span>
          </div>

          {/* New inclusions in PDF highlight */}
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-[11px] text-sky-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sky-950">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              Estrutura Oficial Inclusa no PDF ({mostrarMultas ? "Modo Gestores" : "Modo Líderes"}):
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
              {mostrarMultas ? (
                <li><b>Gráficos Financeiros NR 28:</b> Balanço proporcional do passivo e penalidades em R$ por Norma.</li>
              ) : (
                <li><b>Gráficos Operacionais:</b> Distribuição proporcional de apontamentos e volume de itens a adequar por NR.</li>
              )}
              <li><b>Plano de Ação (5W2H):</b> Matriz prática com prazos e vistos para preenchimento manual em campo.</li>
              <li><b>Registros Fotográficos com Carimbo Forense:</b> Fotos georreferenciadas com data, hora e GPS.</li>
            </ul>
          </div>
        </div>

        {/* Representative of the Inspected Company */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Representante / Acompanhante da Empresa Auditada
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Nome do Acompanhante in loco
              </label>
              <input
                type="text"
                id="input-acomp-nome"
                value={state.acompNome}
                onChange={(e) => onChange("acompNome", e.target.value)}
                placeholder="Nome do preposto ou encarregado"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                Cargo / Função na Empresa
              </label>
              <input
                type="text"
                id="input-acomp-cargo"
                value={state.acompCargo}
                onChange={(e) => onChange("acompCargo", e.target.value)}
                placeholder="Ex: Gerente de Obras, Preposto, Engenheiro"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Signature 1: Auditor SST */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <SignatureCanvas
            id="signature-auditor"
            label={`1. Assinatura do Auditor SST — ${state.inspetor || "Auditor"}`}
            sublabel={`Registro: ${state.regInspetor || "MTE / CREA"}`}
            initialDataUrl={state.assinaturaInspetor}
            onSave={(dataUrl) => onChange("assinaturaInspetor", dataUrl)}
          />

          {/* Banner de Assinatura Sem Contato via QR Code */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 border border-sky-600/40 rounded-xl p-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Assinatura Sem Contato via QR Code</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Segurança & Higiene
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Evite contato com seu celular: gere um QR Code para o acompanhante assinar direto no aparelho dele.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-abrir-qrcode-assinatura"
              onClick={() => setModalQrCodeAberto(true)}
              className="h-9.5 px-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Gerar QR Code</span>
            </button>
          </div>

          {/* Signature 2: Company Representative */}
          <div className="relative">
            {assinaturaRemotaRecebida && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-300 shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Assinado via QR Code Remoto</span>
              </div>
            )}
            <SignatureCanvas
              id="signature-acompanhante"
              label={`2. Assinatura do Acompanhante da Empresa — ${state.acompNome || "Preposto"}`}
              sublabel={`Cargo: ${state.acompCargo || "Encarregado Geral"}`}
              initialDataUrl={state.assinaturaAcompanhante}
              onSave={(dataUrl) => onChange("assinaturaAcompanhante", dataUrl)}
            />
          </div>
        </div>

        {/* Disparo Executivo & Notificações */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 block">
                Disparo do Resumo da Vistoria (WhatsApp / E-mail)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                mostrarMultas ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-800"
              }`}>
                {mostrarMultas ? "Com Cifras de Multas" : "Sem Valores de Multas"}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                id="input-email-cliente"
                value={emailDestino}
                onChange={(e) => setEmailDestino(e.target.value)}
                placeholder="E-mail do destinatário (opcional)"
                className="flex-1 h-9.5 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
              <a
                href={emailUrl}
                id="btn-enviar-email"
                className="h-9.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs transition-colors no-underline"
                title="Abrir cliente de e-mail com resumo estruturado"
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>E-mail</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-enviar-whatsapp"
                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors no-underline"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp da Empresa</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <button
                type="button"
                id="btn-copiar-resumo"
                onClick={handleCopiarResumo}
                className="h-10 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Resumo Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Resumo ({mostrarMultas ? "Gestores" : "Líderes"})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PDF Generation Button */}
          <button
            type="button"
            id="btn-emitir-pdf-final"
            onClick={handleEmitirPDF}
            disabled={gerandoPdf}
            className="w-full h-13 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            {gerandoPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Compilando Laudo Pericial ({mostrarMultas ? "Modo Gestores" : "Modo Líderes"})...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-sky-400" />
                <span>
                  Emitir Laudo Oficial em PDF ({mostrarMultas ? "Para Gestores — Com Multas" : "Para Líderes — Sem Multas"})
                </span>
              </>
            )}
          </button>

          {sucessoMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sucessoMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal QR Code para Assinatura Remota */}
      <ModalQrCodeAssinaturaRemota
        isOpen={modalQrCodeAberto}
        onClose={() => setModalQrCodeAberto(false)}
        state={state}
        onAssinaturaRecebida={handleAssinaturaRemotaRecebida}
      />
    </div>
  );
};
