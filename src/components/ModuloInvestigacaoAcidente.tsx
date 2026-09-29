import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, ArrowLeft, Download, Plus, Trash2, CheckCircle2, UserCheck, Calendar, Clock, FileText, Wrench } from "lucide-react";
import { AcidenteInvestigacaoState } from "../typesAcidente";
import { UsuarioAuditor } from "../types";
import { gerarRelatorioAcidentePDF } from "../utils/pdfAcidenteGenerator";
import { SignatureCanvas } from "./SignatureCanvas";

interface ModuloInvestigacaoAcidenteProps {
  onVoltar: () => void;
  usuarioLogado?: UsuarioAuditor | null;
}

export const ModuloInvestigacaoAcidente: React.FC<ModuloInvestigacaoAcidenteProps> = ({ onVoltar, usuarioLogado }) => {
  const [investigacao, setInvestigacao] = useState<AcidenteInvestigacaoState>({
    dataAcidente: new Date().toISOString().split("T")[0],
    horaAcidente: "14:30",
    localSetor: "Linha de Produção / Almoxarifado",
    tipoAcidente: "ambos",
    vitimaNome: "Carlos Eduardo da Silva",
    vitimaCargo: "Operador de Máquinas Plenas",
    vitimaTempoEmpresa: "2 anos e 4 meses",
    tipoLesao: "Contusão e escoriação no membro superior direito",
    parteCorpoAtingida: "Mão Direita (Dedos)",
    afastamentoDias: 3,
    houveObito: false,
    tipoDanoMaterial: "Danos mecânicos no painel de proteção e eixo da esteira transportadora",
    estimativaPrejuizoBRL: 8500,
    descricaoFatos: "Durante a operação rotineira de ajuste de correia na esteira principal, o colaborador tentou remover resíduos sem o acionamento prévio do sistema de bloqueio e etiquetagem (LOTO), resultando no aprisionamento parcial dos dedos e danos no mecanismo de proteção.",
    condicoesInseguras: ["Proteção perimetral da esteira com intertravamento desregulado", "Iluminação de apoio deficiente no setor"],
    atosInseguros: ["Tentativa de limpeza com equipamento em funcionamento", "Inobservância do procedimento padrão de LOTO (NR 10 / NR 12)"],
    causaRaizPrincipal: "Falha na cultura de segurança operacional e ausência de barreira física rígida intertravada de segurança na zona de engrenamento.",
    metodoAnalise: "cinco_porques",
    acoesImediatas: "Paralisação imediata da máquina, socorro médico ao colaborador (pronto-socorro local) e isolamento da área.",
    acoesCorretivasDefinitivas: "Instalação de chave de segurança com intertravamento mecânico duplo, revisão do procedimento LOTO e reciclagem de todos os operadores.",
    responsavelImplementacao: "Roberto Mendes (Gerente de Manutenção)",
    prazoDias: 15,
    investigadorNome: usuarioLogado?.nome || "Raul Luiz de Faria",
    investigadorCargo: usuarioLogado?.cargo || "Engenheiro de Segurança do Trabalho",
    investigadorRegistro: usuarioLogado?.registro || "CREA 123456/D SP",
    dataEmissao: new Date().toLocaleDateString("pt-BR"),
  });

  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState<string | null>(null);

  const handleBaixarPdf = async () => {
    try {
      setGerandoPdf(true);
      const blob = await gerarRelatorioAcidentePDF({ investigacao });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Relatorio_Investigacao_Acidente_${investigacao.dataAcidente}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMsgSucesso("Relatório técnico de investigação gerado e baixado com sucesso!");
      setTimeout(() => setMsgSucesso(null), 4000);
    } catch (err: any) {
      alert("Erro ao gerar PDF de investigação: " + (err?.message || err));
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Página Inicial</span>
          </button>
          <div>
            <h1 className="text-sm font-black flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Módulo de Investigação de Acidentes e Incidentes (Pessoal e Material)</span>
            </h1>
            <p className="text-[11px] text-slate-400">Atendimento à NR 01, NR 10, NR 12 e diretrizes OHSAS / ISO 45001</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBaixarPdf}
            disabled={gerandoPdf}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-900/40 transition cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${gerandoPdf ? "animate-bounce" : ""}`} />
            <span>{gerandoPdf ? "Gerando PDF..." : "Exportar Relatório PDF"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {msgSucesso && (
          <div className="p-3 bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{msgSucesso}</span>
          </div>
        )}

        {/* 1. SELEÇÃO DO TIPO DE ACIDENTE E DATA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>1. Classificação e Dados da Ocorrência</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tipo de Ocorrência</label>
              <select
                value={investigacao.tipoAcidente}
                onChange={(e) => setInvestigacao({ ...investigacao, tipoAcidente: e.target.value as any })}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 font-semibold"
              >
                <option value="ambos">Dano Pessoal e Material</option>
                <option value="pessoal">Apenas Dano Pessoal (Vítima)</option>
                <option value="material">Apenas Dano Material / Patrimonial</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data do Acidente</label>
              <input
                type="date"
                value={investigacao.dataAcidente}
                onChange={(e) => setInvestigacao({ ...investigacao, dataAcidente: e.target.value })}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Horário</label>
              <input
                type="text"
                value={investigacao.horaAcidente}
                onChange={(e) => setInvestigacao({ ...investigacao, horaAcidente: e.target.value })}
                placeholder="Ex: 14:30"
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Local / Setor Específico</label>
              <input
                type="text"
                value={investigacao.localSetor}
                onChange={(e) => setInvestigacao({ ...investigacao, localSetor: e.target.value })}
                placeholder="Ex: Linha de Montagem 02, Galpão B"
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* 2. DADOS DA VÍTIMA (Se pessoal ou ambos) */}
        {(investigacao.tipoAcidente === "pessoal" || investigacao.tipoAcidente === "ambos") && (
          <div className="bg-rose-950/30 border border-rose-900/50 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>2. Informações da Vítima & Lesão</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome Completo do Colaborador</label>
                <input
                  type="text"
                  value={investigacao.vitimaNome || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, vitimaNome: e.target.value })}
                  placeholder="Ex: Carlos Silva"
                  className="w-full h-10 px-3 bg-slate-950 border border-rose-900/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={investigacao.vitimaCargo || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, vitimaCargo: e.target.value })}
                  placeholder="Ex: Operador de Máquinas"
                  className="w-full h-10 px-3 bg-slate-950 border border-rose-900/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tipo de Lesão</label>
                <input
                  type="text"
                  value={investigacao.tipoLesao || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, tipoLesao: e.target.value })}
                  placeholder="Ex: Fratura, Contusão, Corte"
                  className="w-full h-10 px-3 bg-slate-950 border border-rose-900/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Parte do Corpo Atingida</label>
                <input
                  type="text"
                  value={investigacao.parteCorpoAtingida || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, parteCorpoAtingida: e.target.value })}
                  placeholder="Ex: Mão Direita, Olhos"
                  className="w-full h-10 px-3 bg-slate-950 border border-rose-900/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Dias de Afastamento Estimados</label>
                <input
                  type="number"
                  value={investigacao.afastamentoDias || 0}
                  onChange={(e) => setInvestigacao({ ...investigacao, afastamentoDias: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-slate-950 border border-rose-900/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(investigacao.houveObito)}
                    onChange={(e) => setInvestigacao({ ...investigacao, houveObito: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded bg-slate-950 border-rose-800"
                  />
                  <span className="text-xs font-bold text-rose-400">Houve Óbito (Acidente Fatal)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 2B. DADOS DE DANO MATERIAL (Se material ou ambos) */}
        {(investigacao.tipoAcidente === "material" || investigacao.tipoAcidente === "ambos") && (
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>2B. Danos Materiais e Patrimoniais</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Natureza do Dano Material</label>
                <input
                  type="text"
                  value={investigacao.tipoDanoMaterial || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, tipoDanoMaterial: e.target.value })}
                  placeholder="Ex: Danos a Equipamento, Incêndio em Instalação"
                  className="w-full h-10 px-3 bg-slate-950 border border-amber-900/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Prejuízo Financeiro Estimado (R$)</label>
                <input
                  type="number"
                  value={investigacao.estimativaPrejuizoBRL || 0}
                  onChange={(e) => setInvestigacao({ ...investigacao, estimativaPrejuizoBRL: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-slate-950 border border-amber-900/60 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. RELATO CRONOLÓGICO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>3. Descrição Cronológica dos Fatos</span>
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Relato Técnico Detalhado</label>
            <textarea
              rows={4}
              value={investigacao.descricaoFatos}
              onChange={(e) => setInvestigacao({ ...investigacao, descricaoFatos: e.target.value })}
              placeholder="Descreva passo a passo o que aconteceu antes, durante e após o evento..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* 4. CAUSA RAIZ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>4. Análise de Causa Raiz (Árvore de Causas / 5 Porquês)</span>
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Causa Raiz Principal Identificada</label>
            <textarea
              rows={3}
              value={investigacao.causaRaizPrincipal}
              onChange={(e) => setInvestigacao({ ...investigacao, causaRaizPrincipal: e.target.value })}
              placeholder="Qual foi a falha fundamental de gestão ou processo que permitiu o acidente?"
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* 5. PLANO DE AÇÃO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>5. Plano de Ação Corretiva & Preventiva (CAPA)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Ações Imediatas (Contido o Risco)</label>
              <textarea
                rows={3}
                value={investigacao.acoesImediatas}
                onChange={(e) => setInvestigacao({ ...investigacao, acoesImediatas: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Ações Definitivas</label>
              <textarea
                rows={3}
                value={investigacao.acoesCorretivasDefinitivas}
                onChange={(e) => setInvestigacao({ ...investigacao, acoesCorretivasDefinitivas: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Responsável pela Implementação</label>
              <input
                type="text"
                value={investigacao.responsavelImplementacao}
                onChange={(e) => setInvestigacao({ ...investigacao, responsavelImplementacao: e.target.value })}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Prazo (Dias)</label>
              <input
                type="number"
                value={investigacao.prazoDias}
                onChange={(e) => setInvestigacao({ ...investigacao, prazoDias: Number(e.target.value) })}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 6. FOTO DE EVIDÊNCIA & MEDIDAS ANTERIORES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>6. Registro Fotográfico de Evidência & Medidas Prévias</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto Evidenciando o Acidente */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                📸 Fotos Evidenciando o Acidente ({((investigacao.fotoEvidenciaDataUrl ? 1 : 0) + (investigacao.fotosEvidenciaLista?.length || 0))})
              </label>
              <p className="text-[11px] text-slate-400">
                Anexe ou tire múltiplas fotos do local, equipamento ou lesão.
              </p>
              
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                {/* Grade de Fotos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {investigacao.fotoEvidenciaDataUrl && (
                    <div className="relative group">
                      <img
                        src={investigacao.fotoEvidenciaDataUrl}
                        alt="Evidência 1"
                        className="h-24 w-full rounded-xl object-cover border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setInvestigacao({ ...investigacao, fotoEvidenciaDataUrl: null })}
                        className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded shadow hover:bg-rose-500"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {investigacao.fotosEvidenciaLista?.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Evidência ${idx + 2}`}
                        className="h-24 w-full rounded-xl object-cover border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const novaLista = [...(investigacao.fotosEvidenciaLista || [])];
                          novaLista.splice(idx, 1);
                          setInvestigacao({ ...investigacao, fotosEvidenciaLista: novaLista });
                        }}
                        className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded shadow hover:bg-rose-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <label className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl cursor-pointer transition">
                    + Adicionar Foto de Evidência
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          Array.from(files).forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (upload) => {
                              const res = upload.target?.result as string;
                              if (!investigacao.fotoEvidenciaDataUrl) {
                                setInvestigacao((prev) => ({ ...prev, fotoEvidenciaDataUrl: res }));
                              } else {
                                setInvestigacao((prev) => ({
                                  ...prev,
                                  fotosEvidenciaLista: [...(prev.fotosEvidenciaLista || []), res],
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Medidas Realizadas Antes do Acidente */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                🛡️ Medidas Prévias / Fotos das Condições Anteriores ({((investigacao.medidasAntesFotoDataUrl ? 1 : 0) + (investigacao.medidasAntesFotosLista?.length || 0))})
              </label>
              <p className="text-[11px] text-slate-400">
                Descreva e adicione fotos das medidas preventivas existentes antes da ocorrência.
              </p>

              <div>
                <textarea
                  rows={2}
                  value={investigacao.medidasAntesDescricao || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, medidasAntesDescricao: e.target.value })}
                  placeholder="Ex: Treinamento NR 12 realizado, EPIs fornecidos, sinalização..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {investigacao.medidasAntesFotoDataUrl && (
                    <div className="relative group">
                      <img
                        src={investigacao.medidasAntesFotoDataUrl}
                        alt="Medida 1"
                        className="h-20 w-full rounded-xl object-cover border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setInvestigacao({ ...investigacao, medidasAntesFotoDataUrl: null })}
                        className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded shadow hover:bg-rose-500"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {investigacao.medidasAntesFotosLista?.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Medida ${idx + 2}`}
                        className="h-20 w-full rounded-xl object-cover border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const novaLista = [...(investigacao.medidasAntesFotosLista || [])];
                          novaLista.splice(idx, 1);
                          setInvestigacao({ ...investigacao, medidasAntesFotosLista: novaLista });
                        }}
                        className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded shadow hover:bg-rose-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <label className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-xl cursor-pointer transition">
                    + Adicionar Foto das Medidas Prévias
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          Array.from(files).forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (upload) => {
                              const res = upload.target?.result as string;
                              if (!investigacao.medidasAntesFotoDataUrl) {
                                setInvestigacao((prev) => ({ ...prev, medidasAntesFotoDataUrl: res }));
                              } else {
                                setInvestigacao((prev) => ({
                                  ...prev,
                                  medidasAntesFotosLista: [...(prev.medidasAntesFotosLista || []), res],
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. ASSINATURAS DUPLAS (INVESTIGADOR & RESPONSÁVEL DA EMPRESA) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>7. Assinaturas e Encerramento da Investigação</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assinatura Investigador */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Assinatura do Investigador SST</span>
                <input
                  type="text"
                  value={investigacao.investigadorNome}
                  onChange={(e) => setInvestigacao({ ...investigacao, investigadorNome: e.target.value })}
                  placeholder="Nome do Investigador"
                  className="w-full mt-1 h-9 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold"
                />
                <input
                  type="text"
                  value={investigacao.investigadorCargo}
                  onChange={(e) => setInvestigacao({ ...investigacao, investigadorCargo: e.target.value })}
                  placeholder="Cargo / Registro"
                  className="w-full mt-1.5 h-8 px-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300"
                />
              </div>

              <div className="pt-2">
                <SignatureCanvas
                  id="sig-investigador-acidente"
                  label="Rubrica / Assinatura Digital do Investigador"
                  initialDataUrl={investigacao.assinaturaInvestigador || undefined}
                  onSave={(url) => setInvestigacao({ ...investigacao, assinaturaInvestigador: url })}
                />
              </div>
            </div>

            {/* Assinatura Responsável Empresa */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Assinatura do Responsável da Empresa</span>
                <input
                  type="text"
                  value={investigacao.responsavelEmpresaNome || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, responsavelEmpresaNome: e.target.value })}
                  placeholder="Nome do Gestor / Diretor / Líder"
                  className="w-full mt-1 h-9 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold"
                />
                <input
                  type="text"
                  value={investigacao.responsavelEmpresaCargo || ""}
                  onChange={(e) => setInvestigacao({ ...investigacao, responsavelEmpresaCargo: e.target.value })}
                  placeholder="Cargo na Empresa (Ex: Gerente Operacional)"
                  className="w-full mt-1.5 h-8 px-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300"
                />
              </div>

              <div className="pt-2">
                <SignatureCanvas
                  id="sig-gestor-acidente"
                  label="Rubrica / Assinatura Digital do Responsável"
                  initialDataUrl={investigacao.assinaturaGestor || undefined}
                  onSave={(url) => setInvestigacao({ ...investigacao, assinaturaGestor: url })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={handleBaixarPdf}
            disabled={gerandoPdf}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xl cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório PDF Oficial</span>
          </button>
        </div>
      </main>
    </div>
  );
};
