import React, { useState } from "react";
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
} from "lucide-react";
import { Empresa, FaixaFuncionarios, RascunhoVistoria, VistoriaState } from "../types";
import { FAIXAS_FUNCIONARIOS } from "../data/nr28Data";
import {
  LISTA_CNAE_NR04,
  CNPJ_CNAE_DEMO,
  buscarCNAEPorCodigoOuDescricao,
  obterGrauRiscoTexto,
} from "../data/cnaeData";

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
  const [novoNome, setNovoNome] = useState("");
  const [novoCnpj, setNovoCnpj] = useState("");
  const [novaFaixa, setNovaFaixa] = useState<FaixaFuncionarios>("26 a 50");
  const [novoWpp, setNovoWpp] = useState("");
  const [novoCnae, setNovoCnae] = useState("41.20-4");
  const [novoGrauRisco, setNovoGrauRisco] = useState<1 | 2 | 3 | 4>(3);

  // Auto-busca CNAE e Grau de Risco ao mudar CNPJ
  const handleCnpjChange = (cnpjDigitado: string) => {
    onChange("cnpj", cnpjDigitado);
    const cnpjFormatado = cnpjDigitado.trim();
    if (CNPJ_CNAE_DEMO[cnpjFormatado]) {
      const match = CNPJ_CNAE_DEMO[cnpjFormatado];
      const cnaeEncontrado = buscarCNAEPorCodigoOuDescricao(match.cnae);
      if (cnaeEncontrado) {
        onChange("cnae", cnaeEncontrado.codigo);
        onChange("cnaeDescricao", cnaeEncontrado.descricao);
        onChange("grauRisco", cnaeEncontrado.grauRisco);
      }
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
      onChange("empresa", encontrada.nome);
      onChange("cnpj", encontrada.cnpj);
      onChange("faixa", encontrada.faixaFuncionarios);
      onChange("wpp", encontrada.contatoWpp);
      if (encontrada.cnae) {
        onChange("cnae", encontrada.cnae);
        const cnaeInfo = buscarCNAEPorCodigoOuDescricao(encontrada.cnae);
        if (cnaeInfo) {
          onChange("cnaeDescricao", cnaeInfo.descricao);
          onChange("grauRisco", cnaeInfo.grauRisco);
        }
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
      faixaFuncionarios: novaFaixa,
      contatoWpp: novoWpp.trim() || "34999990000",
      cnae: novoCnae,
      grauRisco: novoGrauRisco,
    });

    onChange("empresa", novoNome.trim());
    onChange("cnpj", novoCnpj.trim() || "00.000.000/0001-00");
    onChange("faixa", novaFaixa);
    onChange("wpp", novoWpp.trim() || "34999990000");
    onChange("cnae", novoCnae);
    const cnaeInfo = buscarCNAEPorCodigoOuDescricao(novoCnae);
    if (cnaeInfo) {
      onChange("cnaeDescricao", cnaeInfo.descricao);
      onChange("grauRisco", cnaeInfo.grauRisco);
    }

    setNovoNome("");
    setNovoCnpj("");
    setNovoWpp("");
    setShowNovoClienteModal(false);
  };

  const infoGrauRisco = obterGrauRiscoTexto(state.grauRisco || 3);

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

          {/* Grid CNPJ e Faixa NR 28 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                CNPJ / Matrícula CEI
              </label>
              <input
                type="text"
                id="input-cnpj"
                value={state.cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
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

          {/* NOVO: CNAE & Grau de Risco Automático (NR 04) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>Atividade Econômica (CNAE) & Grau de Risco (NR 04)</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                Auto-enquadramento NR 04
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Selecione ou busque o CNAE da Empresa:
                </label>
                <div className="relative">
                  <select
                    id="select-cnae-nr04"
                    value={state.cnae || "41.20-4"}
                    onChange={(e) => handleCnaeChange(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none pr-8 truncate"
                  >
                    {LISTA_CNAE_NR04.map((c) => (
                      <option key={c.codigo} value={c.codigo}>
                        CNAE {c.codigo} - {c.descricao} (Grau {c.grauRisco})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Grau de Risco (NR 04):</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                    Puxado do CNPJ
                  </span>
                </label>
                <div className="relative">
                  <div
                    id="display-grau-risco-bloqueado"
                    className="h-10 px-3 w-full bg-slate-100 border border-slate-300 rounded-xl text-xs font-black text-slate-800 flex items-center justify-between select-none cursor-not-allowed shadow-inner"
                    title="O Grau de Risco é derivado automaticamente do CNPJ/CNAE da empresa (Quadro I da NR 04) e não pode ser alterado manualmente na inspeção."
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          (state.grauRisco || 3) === 1
                            ? "bg-emerald-500"
                            : (state.grauRisco || 3) === 2
                            ? "bg-sky-500"
                            : (state.grauRisco || 3) === 3
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                      <span className="truncate">
                        Grau {state.grauRisco || 3} —{" "}
                        {(state.grauRisco || 3) === 1
                          ? "Risco Leve (Escritório)"
                          : (state.grauRisco || 3) === 2
                          ? "Risco Médio (Comércio/Serviço)"
                          : (state.grauRisco || 3) === 3
                          ? "Risco Alto (Indústria/Obras)"
                          : "Risco Máximo (Pesado/Inflamáveis)"}
                      </span>
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </div>
                </div>
              </div>
            </div>

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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razão Social / Nome da Obra</label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Construtora Horizonte Verde Ltda"
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={novoCnpj}
                  onChange={(e) => setNovoCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CNAE Principal (NR 04)</label>
                <select
                  value={novoCnae}
                  onChange={(e) => {
                    setNovoCnae(e.target.value);
                    const achado = buscarCNAEPorCodigoOuDescricao(e.target.value);
                    if (achado) setNovoGrauRisco(achado.grauRisco);
                  }}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 truncate"
                >
                  {LISTA_CNAE_NR04.map((c) => (
                    <option key={c.codigo} value={c.codigo}>
                      CNAE {c.codigo} - {c.descricao} (GR {c.grauRisco})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faixa de Funcionários</label>
                <select
                  value={novaFaixa}
                  onChange={(e) => setNovaFaixa(e.target.value as FaixaFuncionarios)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                >
                  {FAIXAS_FUNCIONARIOS.map((f) => (
                    <option key={f} value={f}>
                      {f} funcionários
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp do Gestor</label>
                <input
                  type="tel"
                  value={novoWpp}
                  onChange={(e) => setNovoWpp(e.target.value)}
                  placeholder="DDD + Número"
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNovoClienteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
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

