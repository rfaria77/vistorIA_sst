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
} from "lucide-react";
import { VistoriaState } from "../types";
import { SignatureCanvas } from "./SignatureCanvas";
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

  const totalNaoConformidades = state.evidencias.filter((e) => e.status === "Não Conformidade").length;
  const passivoMax = state.evidencias
    .filter((e) => e.status === "Não Conformidade")
    .reduce((acc, curr) => acc + curr.valorMax, 0);

  const economiaMax = state.evidencias
    .filter((e) => e.status === "Conformidade")
    .reduce((acc, curr) => acc + curr.valorMax, 0);

  const [emailDestino, setEmailDestino] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Clean WhatsApp Link without markdown glitches
  const whatsappUrl = gerarLinkWhatsApp(
    state.wpp || "11999999999",
    state.empresa || "Empresa Auditada",
    passivoMax,
    economiaMax,
    totalNaoConformidades
  );

  const emailUrl = gerarLinkEmail(
    emailDestino || "diretoria@empresa.com.br",
    state.empresa || "Empresa Auditada",
    passivoMax,
    economiaMax,
    totalNaoConformidades,
    state.inspetor
  );

  const handleCopiarResumo = async () => {
    const texto = gerarTextoResumoExecutivo(
      state.empresa || "Empresa Auditada",
      passivoMax,
      economiaMax,
      totalNaoConformidades,
      state.inspetor
    );
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // fallback
    }
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
      });

      // Trigger instant download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = state.empresa.replace(/[^a-zA-Z0-9]/g, "_");
      link.href = url;
      link.download = `Laudo_SST_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSucessoMsg("Laudo Técnico Pericial gerado e baixado com sucesso!");
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
            <p className="text-xs text-slate-500">Coleta de assinaturas forenses e emissão do parecer oficial</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-slate-600" />
            Resumo Pericial da Auditoria
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Apontamentos Avaliados</span>
              <span className="text-base font-bold text-slate-900">{state.evidencias.length} itens</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Não Conformidades</span>
              <span className="text-base font-bold text-rose-600">{totalNaoConformidades} críticas</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Passivo em Risco NR 28</span>
              <span className="text-sm font-bold text-rose-600">{formatarBRL(passivoMax)}</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Economia Gerada</span>
              <span className="text-sm font-bold text-emerald-600">{formatarBRL(economiaMax)}</span>
            </div>
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
              Estrutura Oficial Inclusa no PDF:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
              <li><b>Gráficos Visuais de Multa:</b> Balanço proporcional do passivo e distribuição por Norma Regulamentadora.</li>
              <li><b>Plano de Ação (5W2H):</b> Tabela com datas de prazo e vistos em aberto para preenchimento manual no local.</li>
              <li><b>Identificação Alinhada:</b> Grid bilateral sem sobreposição de textos da empresa e do auditor.</li>
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

          {/* Signature 2: Company Representative */}
          <SignatureCanvas
            id="signature-acompanhante"
            label={`2. Assinatura do Acompanhante da Empresa — ${state.acompNome || "Preposto"}`}
            sublabel={`Cargo: ${state.acompCargo || "Encarregado Geral"}`}
            initialDataUrl={state.assinaturaAcompanhante}
            onSave={(dataUrl) => onChange("assinaturaAcompanhante", dataUrl)}
          />
        </div>

        {/* Disparo Executivo & Notificações */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">
              Disparo Imediato do Resumo da Vistoria (WhatsApp / E-mail)
            </span>

            <div className="flex gap-2">
              <input
                type="email"
                id="input-email-cliente"
                value={emailDestino}
                onChange={(e) => setEmailDestino(e.target.value)}
                placeholder="E-mail da diretoria/cliente (opcional)"
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
                className="h-10 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Resumo Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Texto Executivo</span>
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
            className="w-full h-13 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {gerandoPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Compilando Laudo Pericial com Carimbos e Assinaturas...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-sky-400" />
                <span>Emitir e Baixar Laudo Pericial Completo (PDF)</span>
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
    </div>
  );
};
