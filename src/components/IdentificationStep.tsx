import React, { useState, useRef } from "react";
import {
  Building2,
  UserCheck,
  Phone,
  FileText,
  PlusCircle,
  FolderOpen,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  AlertCircle,
  HelpCircle,
  Lock,
  Search,
  Loader2,
  CheckCircle2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Empresa, FaixaFuncionarios, RascunhoVistoria, TipoInscricao, VistoriaState } from "../types";
import { salvarRascunho } from "../utils/storage";
import { FAIXAS_FUNCIONARIOS } from "../data/nr28Data";
import {
  LISTA_CNAE_NR04,
  CNPJ_CNAE_DEMO,
  buscarCNAEPorCodigoOuDescricao,
  obterGrauRiscoTexto,
} from "../data/cnaeData";
import { CnaeSelector } from "./CnaeSelector";
import {
  consultarCNPJ,
  formatarCNPJ,
  formatarCAEPF,
  formatarCEI,
  formatarDocumentoInscricao,
  detectarTipoInscricao,
} from "../utils/cnpjLookup";

interface IdentificationStepProps {
  state: VistoriaState;
  onChange: (field: keyof VistoriaState, value: any) => void;
  empresas: Empresa[];
  onCadastrarEmpresa: (empresa: Omit<Empresa, "id">) => void;
  rascunhos: RascunhoVistoria[];
  onCarregarRascunho: (rascunho: RascunhoVistoria) => void;
  onExcluirRascunho: (id: string) => void;
  onNext: () => void;
}

export const IdentificationStep: React.FC<IdentificationStepProps> = ({
  state,
  onChange,
  empresas,
  onCadastrarEmpresa,
  rascunhos,
  onCarregarRascunho,
  onExcluirRascunho,
  onNext,
}) => {
  const [showNovoClienteModal, setShowNovoClienteModal] = useState(false);
  const [novoTipoInscricao, setNovoTipoInscricao] = useState<TipoInscricao>("CNPJ");
  const [novoNome, setNovoNome] = useState("");
  const [novoCnpj, setNovoCnpj] = useState("");
  const [novaFaixa, setNovaFaixa] = useState<FaixaFuncionarios>("26 a 50");
  const [novoWpp, setNovoWpp] = useState("");
  const [novoCnae, setNovoCnae] = useState("41.20-4");
  const [novoCnaeDescricao, setNovoCnaeDescricao] = useState("");
  const [novosCnaesSecundarios, setNovosCnaesSecundarios] = useState<{ codigo: string; descricao: string }[]>([]);
  const [novoGrauRisco, setNovoGrauRisco] = useState<1 | 2 | 3 | 4>(3);

  // Estados de busca automática de CNPJ
  const [buscandoCnpjModal, setBuscandoCnpjModal] = useState(false);
  const [msgCnpjModal, setMsgCnpjModal] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [buscandoCnpjPrincipal, setBuscandoCnpjPrincipal] = useState(false);
  const [msgCnpjPrincipal, setMsgCnpjPrincipal] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [cnaesSecundariosPrincipal, setCnaesSecundariosPrincipal] = useState<{ codigo: string; descricao: string }[]>([]);

  const fileImportRef = useRef<HTMLInputElement | null>(null);

  const handleImportarJsonRascunho = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let rascunhoParaCarregar: RascunhoVistoria;
        if (parsed.estado && parsed.empresa) {
          rascunhoParaCarregar = parsed as RascunhoVistoria;
        } else if (parsed.evidencias || parsed.empresa) {
          rascunhoParaCarregar = {
            id: `rasc-import-${Date.now()}`,
            empresa: parsed.empresa || "Inspeção Importada",
            dataAtualizacao: new Date().toLocaleString("pt-BR"),
            estado: parsed as VistoriaState,
          };
        } else {
          throw new Error("Formato de arquivo JSON inválido para rascunho de vistoria.");
        }

        const salvo = salvarRascunho(rascunhoParaCarregar.estado);
        onCarregarRascunho({
          ...rascunhoParaCarregar,
          id: salvo.id,
        });
        alert(`✓ Rascunho da empresa "${rascunhoParaCarregar.empresa}" importado com sucesso!`);
      } catch (err: any) {
        alert(err?.message || "Erro ao ler o arquivo JSON de rascunho. Verifique se o formato é válido.");
      } finally {
        if (fileImportRef.current) fileImportRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Busca automática via Receita Federal no Modal (apenas CNPJ)
  const handleBuscarCnpjModal = async (cnpjParaBuscar?: string) => {
    const valor = (cnpjParaBuscar !== undefined ? cnpjParaBuscar : novoCnpj).replace(/\D/g, "");
    if (valor.length !== 14) {
      setMsgCnpjModal({ tipo: "erro", texto: "Digite os 14 dígitos do CNPJ para buscar os dados." });
      return;
    }

    try {
      setBuscandoCnpjModal(true);
      setMsgCnpjModal(null);
      const dados = await consultarCNPJ(valor);

      setNovoCnpj(dados.cnpjFormatado);
      if (dados.razaoSocial) setNovoNome(dados.razaoSocial);
      if (dados.cnaeCodigo) setNovoCnae(dados.cnaeCodigo);
      if (dados.cnaeDescricao) setNovoCnaeDescricao(dados.cnaeDescricao);
      if (dados.grauRisco) setNovoGrauRisco(dados.grauRisco);
      if (dados.cnaesSecundarios) setNovosCnaesSecundarios(dados.cnaesSecundarios);
      if (dados.telefone && !novoWpp) setNovoWpp(dados.telefone);

      setMsgCnpjModal({
        tipo: "sucesso",
        texto: `✓ CNPJ localizado! Razão Social, CNAE (${dados.cnaeCodigo}) e Grau de Risco ${dados.grauRisco} preenchidos.`,
      });
    } catch (err: any) {
      setMsgCnpjModal({
        tipo: "erro",
        texto: err?.message || "Erro ao consultar dados do CNPJ na Receita Federal.",
      });
    } finally {
      setBuscandoCnpjModal(false);
    }
  };

  const handleNovoCnpjChange = (val: string) => {
    const formatado = formatarDocumentoInscricao(val, novoTipoInscricao);
    setNovoCnpj(formatado);
    setMsgCnpjModal(null);

    const digitos = val.replace(/\D/g, "");
    if (novoTipoInscricao === "CNPJ" && digitos.length === 14) {
      handleBuscarCnpjModal(digitos);
    }
  };

  // Busca automática via Receita Federal no Formulário Principal
  const handleBuscarCnpjPrincipal = async (cnpjParaBuscar?: string) => {
    const valor = (cnpjParaBuscar !== undefined ? cnpjParaBuscar : state.cnpj).replace(/\D/g, "");
    if (valor.length !== 14) {
      setMsgCnpjPrincipal({ tipo: "erro", texto: "Digite os 14 dígitos do CNPJ para consultar." });
      return;
    }

    try {
      setBuscandoCnpjPrincipal(true);
      setMsgCnpjPrincipal(null);
      const dados = await consultarCNPJ(valor);

      onChange("cnpj", dados.cnpjFormatado);
      onChange("cnae", dados.cnaeCodigo);
      onChange("cnaeDescricao", dados.cnaeDescricao);
      onChange("grauRisco", dados.grauRisco);
      if (dados.cnaesSecundarios) setCnaesSecundariosPrincipal(dados.cnaesSecundarios);

      if (
        !state.empresa ||
        state.empresa.includes("Empresa Exemplo") ||
        state.empresa === "Nova Empresa" ||
        empresas.some((e) => e.nome === state.empresa && e.cnpj === "00.000.000/0001-00")
      ) {
        onChange("empresa", dados.razaoSocial);
      }
      if (dados.telefone && !state.wpp) {
        onChange("wpp", dados.telefone);
      }

      setMsgCnpjPrincipal({
        tipo: "sucesso",
        texto: `Receita Federal: ${dados.razaoSocial} • CNAE ${dados.cnaeCodigo} (Grau de Risco ${dados.grauRisco})`,
      });
    } catch (err: any) {
      setMsgCnpjPrincipal({
        tipo: "erro",
        texto: err?.message || "Não foi possível carregar os dados automáticos deste CNPJ.",
      });
    } finally {
      setBuscandoCnpjPrincipal(false);
    }
  };

  const handleMudarTipoInscricao = (novoTipo: TipoInscricao) => {
    onChange("tipoInscricao", novoTipo);
    setMsgCnpjPrincipal(null);
    if (state.cnpj) {
      const reformulado = formatarDocumentoInscricao(state.cnpj, novoTipo);
      onChange("cnpj", reformulado);
    }
  };

  const handleCnpjChange = (documentoDigitado: string) => {
    const tipo = state.tipoInscricao || "CNPJ";
    const formatado = formatarDocumentoInscricao(documentoDigitado, tipo);
    onChange("cnpj", formatado);
    setMsgCnpjPrincipal(null);

    const digitos = documentoDigitado.replace(/\D/g, "");
    if (tipo === "CNPJ" && digitos.length === 14) {
      handleBuscarCnpjPrincipal(digitos);
    }
  };

  const handleCnaeChange = (cnaeTermo: string) => {
    onChange("cnae", cnaeTermo);
    const cnaeEncontrado = buscarCNAEPorCodigoOuDescricao(cnaeTermo);
    if (cnaeEncontrado) {
      onChange("cnaeDescricao", cnaeEncontrado.descricao);
      onChange("grauRisco", cnaeEncontrado.grauRisco);
    }
  };

  const handleSelectEmpresa = (nome: string) => {
    const encontrada = empresas.find((e) => e.nome === nome);
    if (encontrada) {
      const tipo = encontrada.tipoInscricao || (encontrada.cnpj.includes(".00000/") ? "CEI/CNO" : (encontrada.cnpj.split("/")[0]?.length === 11 ? "CAEPF" : "CNPJ"));
      onChange("empresa", encontrada.nome);
      onChange("cnpj", encontrada.cnpj);
      onChange("tipoInscricao", tipo);
      onChange("faixa", encontrada.faixaFuncionarios);
      onChange("wpp", encontrada.contatoWpp);
      if (encontrada.cnae) {
        onChange("cnae", encontrada.cnae);
        onChange("cnaeDescricao", encontrada.cnaeDescricao || buscarCNAEPorCodigoOuDescricao(encontrada.cnae)?.descricao || "");
        onChange("grauRisco", encontrada.grauRisco || buscarCNAEPorCodigoOuDescricao(encontrada.cnae)?.grauRisco || 3);
      } else {
        // Fallback default
        const demo = CNPJ_CNAE_DEMO[encontrada.cnpj];
        if (demo) {
          const cnaeInfo = buscarCNAEPorCodigoOuDescricao(demo.cnae);
          if (cnaeInfo) {
            onChange("cnae", cnaeInfo.codigo);
            onChange("cnaeDescricao", cnaeInfo.descricao);
            onChange("grauRisco", cnaeInfo.grauRisco);
          }
        }
      }
    } else {
      onChange("empresa", nome);
    }
  };

  const handleSalvarNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    onCadastrarEmpresa({
      nome: novoNome.trim(),
      cnpj: novoCnpj.trim() || "00.000.000/0001-00",
      tipoInscricao: novoTipoInscricao,
      faixaFuncionarios: novaFaixa,
      contatoWpp: novoWpp.trim() || "34999990000",
      cnae: novoCnae,
      cnaeDescricao: novoCnaeDescricao || undefined,
      grauRisco: novoGrauRisco,
    });

    onChange("empresa", novoNome.trim());
    onChange("cnpj", novoCnpj.trim() || "00.000.000/0001-00");
    onChange("tipoInscricao", novoTipoInscricao);
    onChange("faixa", novaFaixa);
    onChange("wpp", novoWpp.trim() || "34999990000");
    onChange("cnae", novoCnae);
    onChange("cnaeDescricao", novoCnaeDescricao || buscarCNAEPorCodigoOuDescricao(novoCnae)?.descricao || "");
    onChange("grauRisco", novoGrauRisco);

    setNovoNome("");
    setNovoCnpj("");
    setNovoWpp("");
    setNovoCnae("41.20-4");
    setNovoCnaeDescricao("");
    setNovosCnaesSecundarios([]);
    setNovoTipoInscricao("CNPJ");
    setMsgCnpjModal(null);
    setShowNovoClienteModal(false);
  };

  const infoGrauRisco = obterGrauRiscoTexto(Number(state.grauRisco || 3) as 1 | 2 | 3 | 4);

  return (
    <div className="space-y-4">
      {/* Saved Drafts notification / loader */}
      {rascunhos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <FolderOpen className="w-4 h-4 text-amber-700" />
            <span>Rascunhos Disponíveis ({rascunhos.length})</span>
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {rascunhos.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-100 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">{r.empresa}</p>
                  <p className="text-slate-400 text-[11px]">
                    {r.dataAtualizacao} • {r.estado.evidencias?.length || 0} apontamentos
                    {r.estado.grauRisco && ` • GR ${r.estado.grauRisco}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onCarregarRascunho(r)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-xs transition-colors"
                  >
                    Continuar
                  </button>
                  <button
                    type="button"
                    onClick={() => onExcluirRascunho(r.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Excluir rascunho"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Identification Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Identificação da Empresa & Auditor</h2>
              <p className="text-xs text-slate-500">Parâmetros essenciais, CNAE e Grau de Risco (NR 04 / NR 28)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileImportRef}
              accept=".json"
              className="hidden"
              onChange={handleImportarJsonRascunho}
            />
            <button
              type="button"
              id="btn-importar-rascunho-json"
              onClick={() => fileImportRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 cursor-pointer"
              title="Importar arquivo JSON de rascunho previamente exportado de outro dispositivo"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar JSON</span>
            </button>

            <button
              type="button"
              id="btn-modal-novo-cliente"
              onClick={() => setShowNovoClienteModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Nova Empresa
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Empresa Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Empresa / Obra Auditada
            </label>
            <div className="relative">
              <select
                id="select-empresa"
                value={state.empresa}
                onChange={(e) => handleSelectEmpresa(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none"
              >
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.nome}>
                    {emp.nome} ({emp.faixaFuncionarios} colab. {emp.grauRisco ? `| Grau de Risco ${emp.grauRisco}` : ""})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Grid Tipo de Documento, Inscrição e Faixa NR 28 */}
          <div className="space-y-2">
            {/* Seletor de Tipo de Documento: CNPJ, CAEPF ou CEI */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Tipo de Inscrição da Empresa / Empregador:</span>
              </label>

              <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="btn-tipo-cnpj"
                  onClick={() => handleMudarTipoInscricao("CNPJ")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    (state.tipoInscricao || "CNPJ") === "CNPJ"
                      ? "bg-white text-sky-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏢 CNPJ
                </button>
                <button
                  type="button"
                  id="btn-tipo-caepf"
                  onClick={() => handleMudarTipoInscricao("CAEPF")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    state.tipoInscricao === "CAEPF"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🌾 CAEPF (Rural / PF)
                </button>
                <button
                  type="button"
                  id="btn-tipo-cei"
                  onClick={() => handleMudarTipoInscricao("CEI/CNO")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    state.tipoInscricao === "CEI/CNO"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏗️ CEI / CNO
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>
                      {state.tipoInscricao === "CAEPF"
                        ? "Número do CAEPF (14 dígitos)"
                        : state.tipoInscricao === "CEI/CNO"
                        ? "Matrícula CEI / CNO (12 dígitos)"
                        : "CNPJ da Empresa (14 dígitos)"}
                    </span>
                  </label>
                  {buscandoCnpjPrincipal && (
                    <span className="text-[10px] text-sky-600 font-bold flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Buscando na Receita...
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="input-cnpj"
                    value={state.cnpj}
                    onChange={(e) => handleCnpjChange(e.target.value)}
                    placeholder={
                      state.tipoInscricao === "CAEPF"
                        ? "000.000.000/000-00"
                        : state.tipoInscricao === "CEI/CNO"
                        ? "00.000.00000/00"
                        : "00.000.000/0001-00"
                    }
                    className="w-full h-10 pl-3 pr-28 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                  {(state.tipoInscricao || "CNPJ") === "CNPJ" && (
                    <button
                      type="button"
                      id="btn-buscar-cnpj-principal"
                      onClick={() => handleBuscarCnpjPrincipal()}
                      disabled={buscandoCnpjPrincipal}
                      className="absolute right-1 h-8 px-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-xs"
                      title="Puxar Razão Social e CNAE na Receita Federal"
                    >
                      {buscandoCnpjPrincipal ? (
                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                      ) : (
                        <Search className="w-3 h-3 text-white" />
                      )}
                      <span>Puxar CNPJ</span>
                    </button>
                  )}
                </div>

                {/* Dica para CAEPF */}
                {state.tipoInscricao === "CAEPF" && (
                  <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900">
                    <p className="font-semibold mb-1">🌾 Cadastro de Pessoa Física (Produtor Rural / PF)</p>
                    <p className="text-emerald-700 mb-1.5">Atalhos rápidos de CNAE rural e grau de risco (NR-31 e NR-04):</p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => handleCnaeChange("01.11-3")}
                        className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded-md text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        🌾 Soja/Milho (01.11-3)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCnaeChange("01.51-2")}
                        className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded-md text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        🐄 Pecuária (01.51-2)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCnaeChange("01.31-8")}
                        className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded-md text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        ☕ Café (01.31-8)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCnaeChange("01.61-0")}
                        className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded-md text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        🚜 Apoio Agrícola (01.61-0)
                      </button>
                    </div>
                  </div>
                )}

                {/* Dica para CEI/CNO */}
                {state.tipoInscricao === "CEI/CNO" && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                    <p className="font-semibold mb-1">🏗️ Matrícula de Obras / Vínculo CEI/CNO</p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => handleCnaeChange("41.20-4")}
                        className="px-2 py-0.5 bg-white border border-amber-300 text-amber-800 rounded-md text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                      >
                        🏗️ Edifícios (41.20-4)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCnaeChange("43.99-1")}
                        className="px-2 py-0.5 bg-white border border-amber-300 text-amber-800 rounded-md text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                      >
                        🪜 Serviços Especiais (43.99-1)
                      </button>
                    </div>
                  </div>
                )}

                {msgCnpjPrincipal && (
                  <div
                    className={`mt-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                      msgCnpjPrincipal.tipo === "sucesso"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {msgCnpjPrincipal.tipo === "sucesso" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">{msgCnpjPrincipal.texto}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  Quadro de Funcionários (NR 28)
                </label>
                <select
                  id="select-faixa-funcionarios"
                  value={state.faixa}
                  onChange={(e) => onChange("faixa", e.target.value as FaixaFuncionarios)}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {FAIXAS_FUNCIONARIOS.map((f) => (
                    <option key={f} value={f}>
                      {f} funcionários
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CNAE & Grau de Risco Automático (NR 04) com Catálogo Completo */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <CnaeSelector
              id="main-cnae-selector"
              value={state.cnae || "41.20-4"}
              descricao={state.cnaeDescricao}
              grauRisco={Number(state.grauRisco || 3) as 1 | 2 | 3 | 4}
              cnaesSecundarios={cnaesSecundariosPrincipal}
              puxadoReceita={Boolean(msgCnpjPrincipal && msgCnpjPrincipal.tipo === "sucesso")}
              onChange={(novoCod, novaDesc, novoGr) => {
                onChange("cnae", novoCod);
                onChange("cnaeDescricao", novaDesc);
                onChange("grauRisco", novoGr);
              }}
            />

            {/* Banner de detalhamento do Grau de Risco calculado */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border shrink-0 ${infoGrauRisco.badgeCor}`}>
                Grau {state.grauRisco || 3}
              </span>
              <div className="text-xs">
                <p className="font-bold text-slate-800">{infoGrauRisco.rotulo}</p>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                  {infoGrauRisco.descricaoSST} <strong>SESMT:</strong> {infoGrauRisco.obrigatoriedadeSESMT}
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp do Gestor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              WhatsApp do Gestor da Empresa (Notificação Direta)
            </label>
            <input
              type="tel"
              id="input-whatsapp-gestor"
              value={state.wpp}
              onChange={(e) => onChange("wpp", e.target.value)}
              placeholder="Ex: 11999998888 (com DDD)"
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Dados do Auditor & Vistoria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  Auditor / Perito SST
                </label>
                <input
                  type="text"
                  id="input-auditor-nome"
                  value={state.inspetor}
                  onChange={(e) => onChange("inspetor", e.target.value)}
                  placeholder="Nome do Engenheiro/Técnico"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  Registro Profissional (MTE / CREA)
                </label>
                <input
                  type="text"
                  id="input-auditor-registro"
                  value={state.regInspetor}
                  onChange={(e) => onChange("regInspetor", e.target.value)}
                  placeholder="MTE: 00000/UF ou CREA"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Data da Auditoria
              </label>
              <input
                type="text"
                id="input-data-vistoria"
                value={state.data}
                onChange={(e) => onChange("data", e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          id="btn-avancar-etapa-2"
          onClick={onNext}
          className="w-full mt-6 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Avançar para Apontamentos em Campo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Cadastrar Novo Cliente */}
      {showNovoClienteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                Cadastrar Nova Empresa / Cliente
              </h3>
              <button
                type="button"
                onClick={() => setShowNovoClienteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarNovoCliente} className="space-y-3">
              {/* Seletor de Tipo de Documento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo de Inscrição / Empregador:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setNovoTipoInscricao("CNPJ");
                      setMsgCnpjModal(null);
                      if (novoCnpj) setNovoCnpj(formatarDocumentoInscricao(novoCnpj, "CNPJ"));
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                      novoTipoInscricao === "CNPJ"
                        ? "bg-white text-sky-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🏢 CNPJ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNovoTipoInscricao("CAEPF");
                      setMsgCnpjModal(null);
                      if (novoCnpj) setNovoCnpj(formatarDocumentoInscricao(novoCnpj, "CAEPF"));
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                      novoTipoInscricao === "CAEPF"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🌾 CAEPF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNovoTipoInscricao("CEI/CNO");
                      setMsgCnpjModal(null);
                      if (novoCnpj) setNovoCnpj(formatarDocumentoInscricao(novoCnpj, "CEI/CNO"));
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                      novoTipoInscricao === "CEI/CNO"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🏗️ CEI / CNO
                  </button>
                </div>
              </div>

              {/* 1. Documento com Auto-preenchimento */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>
                      {novoTipoInscricao === "CAEPF"
                        ? "Número do CAEPF (14 dígitos)"
                        : novoTipoInscricao === "CEI/CNO"
                        ? "Matrícula CEI / CNO (12 dígitos)"
                        : "CNPJ da Empresa"}
                    </span>
                  </label>
                  {novoTipoInscricao === "CNPJ" && (
                    <span className="text-[10px] text-slate-500">Puxa dados da Receita</span>
                  )}
                  {novoTipoInscricao === "CAEPF" && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Produtor Rural / PF
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="modal-input-cnpj"
                    value={novoCnpj}
                    onChange={(e) => handleNovoCnpjChange(e.target.value)}
                    placeholder={
                      novoTipoInscricao === "CAEPF"
                        ? "000.000.000/000-00"
                        : novoTipoInscricao === "CEI/CNO"
                        ? "00.000.00000/00"
                        : "00.000.000/0001-00"
                    }
                    className="w-full h-10 pl-3 pr-28 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 font-medium"
                    autoFocus
                  />
                  {novoTipoInscricao === "CNPJ" && (
                    <button
                      type="button"
                      id="btn-modal-buscar-cnpj"
                      onClick={() => handleBuscarCnpjModal()}
                      disabled={buscandoCnpjModal}
                      className="absolute right-1 h-8 px-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-xs"
                      title="Puxar Razão Social, CNAE e Grau de Risco na Receita Federal"
                    >
                      {buscandoCnpjModal ? (
                        <Loader2 className="w-3 h-3 animate-spin text-white" />
                      ) : (
                        <Search className="w-3 h-3 text-white" />
                      )}
                      <span>Puxar CNPJ</span>
                    </button>
                  )}
                </div>

                {/* Dica e atalhos rápidos para CAEPF */}
                {novoTipoInscricao === "CAEPF" && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <p className="font-bold text-[11px] mb-1">🌾 Cadastro de Atividade Econômica da Pessoa Física</p>
                    <p className="text-[11px] text-emerald-800 mb-2 leading-tight">
                      Válido para Produtores Rurais, Profissionais Liberais com empregados e Obras de Pessoa Física.
                      Clique abaixo para selecionar a atividade rural com 1 clique:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setNovoCnae("01.11-3");
                          setNovoCnaeDescricao("Cultivo de cereais (soja, milho, trigo, arroz)");
                          setNovoGrauRisco(3);
                        }}
                        className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      >
                        🌾 Soja/Cereais (01.11-3)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNovoCnae("01.51-2");
                          setNovoCnaeDescricao("Criação de bovinos para corte e leite (pecuária)");
                          setNovoGrauRisco(3);
                        }}
                        className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      >
                        🐄 Pecuária (01.51-2)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNovoCnae("01.31-8");
                          setNovoCnaeDescricao("Cultivo de café (cafeicultura)");
                          setNovoGrauRisco(3);
                        }}
                        className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      >
                        ☕ Café (01.31-8)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNovoCnae("01.61-0");
                          setNovoCnaeDescricao("Atividades de apoio à agricultura");
                          setNovoGrauRisco(3);
                        }}
                        className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      >
                        🚜 Apoio Agrícola (01.61-0)
                      </button>
                    </div>
                  </div>
                )}

                {/* Dica para CEI/CNO */}
                {novoTipoInscricao === "CEI/CNO" && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <p className="font-bold text-[11px] mb-1">🏗️ Atalhos rápidos para Construção Civil / Obras:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setNovoCnae("41.20-4");
                          setNovoCnaeDescricao("Construção de edifícios residenciais e comerciais");
                          setNovoGrauRisco(3);
                        }}
                        className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-[10px] font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                      >
                        🏗️ Construção de Edifícios (41.20-4)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNovoCnae("43.99-1");
                          setNovoCnaeDescricao("Serviços especializados para construção (andaimes)");
                          setNovoGrauRisco(4);
                        }}
                        className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-[10px] font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                      >
                        🪜 Serviços Especializados (43.99-1)
                      </button>
                    </div>
                  </div>
                )}

                {/* Mensagem de Feedback da Busca */}
                {msgCnpjModal && (
                  <div
                    className={`mt-2 p-2 rounded-xl text-xs flex items-start gap-2 ${
                      msgCnpjModal.tipo === "sucesso"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-amber-50 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {msgCnpjModal.tipo === "sucesso" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[11px] leading-tight font-medium">{msgCnpjModal.texto}</span>
                  </div>
                )}
              </div>

              {/* 2. Razão Social (Auto-preenchida pelo CNPJ) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Razão Social / Nome da Obra *</span>
                  {novoNome && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Preenchido
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  id="modal-input-nome"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Construtora Horizonte Verde Ltda"
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>

              {/* 3. CNAE e Grau de Risco com Catálogo Completo */}
              <div>
                <CnaeSelector
                  id="modal-cnae-selector"
                  value={novoCnae}
                  descricao={novoCnaeDescricao}
                  grauRisco={novoGrauRisco}
                  cnaesSecundarios={novosCnaesSecundarios}
                  puxadoReceita={Boolean(msgCnpjModal && msgCnpjModal.tipo === "sucesso")}
                  onChange={(novoCod, novaDesc, novoGr) => {
                    setNovoCnae(novoCod);
                    setNovoCnaeDescricao(novaDesc);
                    setNovoGrauRisco(novoGr);
                  }}
                />
              </div>

              {/* 4. Faixa de Funcionários e WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faixa de Funcionários</label>
                  <select
                    id="modal-select-faixa"
                    value={novaFaixa}
                    onChange={(e) => setNovaFaixa(e.target.value as FaixaFuncionarios)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    {FAIXAS_FUNCIONARIOS.map((f) => (
                      <option key={f} value={f}>
                        {f} funcionários
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    id="modal-input-wpp"
                    value={novoWpp}
                    onChange={(e) => setNovoWpp(e.target.value)}
                    placeholder="DDD + Número"
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  id="btn-modal-cancelar"
                  onClick={() => setShowNovoClienteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-modal-salvar"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar e Selecionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

