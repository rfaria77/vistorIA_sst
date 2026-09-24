import React, { useState, useMemo } from "react";
import {
  LISTA_CNAE_NR04,
  CATEGORIAS_CNAE,
  CNAEItem,
  buscarCNAEPorCodigoOuDescricao,
  deduzirGrauRiscoPorDivisaoCNAE,
  deduzirCategoriaPorDivisao,
  formatarCodigoCNAE,
  normalizarCNAE,
  obterGrauRiscoTexto,
} from "../data/cnaeData";
import {
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  X,
  Plus,
  ShieldCheck,
  Building2,
  ListFilter,
} from "lucide-react";

export interface CnaeSelectorProps {
  id?: string;
  value: string; // Ex: "41.20-4"
  descricao?: string;
  grauRisco: 1 | 2 | 3 | 4;
  onChange: (codigo: string, descricao: string, grauRisco: 1 | 2 | 3 | 4) => void;
  cnaesSecundarios?: { codigo: string; descricao: string }[];
  label?: string;
  puxadoReceita?: boolean;
}

export const CnaeSelector: React.FC<CnaeSelectorProps> = ({
  id = "cnae-selector",
  value,
  descricao,
  grauRisco,
  onChange,
  cnaesSecundarios,
  label = "Atividade Econômica Principal (CNAE - NR 04)",
  puxadoReceita = false,
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [modoManual, setModoManual] = useState(false);
  const [manualCodigo, setManualCodigo] = useState("");
  const [manualDescricao, setManualDescricao] = useState("");
  const [mostrarSecundarios, setMostrarSecundarios] = useState(false);

  // Encontrar dados do item selecionado
  const itemAtual = useMemo(() => {
    const achado = buscarCNAEPorCodigoOuDescricao(value);
    if (achado) {
      return {
        ...achado,
        descricao: descricao || achado.descricao,
        grauRisco,
      };
    }
    return {
      codigo: value || "41.20-4",
      descricao: descricao || "Atividade Econômica Cadastrada",
      grauRisco: grauRisco || 3,
      categoria: deduzirCategoriaPorDivisao(normalizarCNAE(value)),
    };
  }, [value, descricao, grauRisco]);

  // Filtragem rápida
  const cnaesFiltrados = useMemo(() => {
    let lista = LISTA_CNAE_NR04;

    if (categoriaAtiva !== "Todos") {
      lista = lista.filter((c) => c.categoria === categoriaAtiva);
    }

    if (!termoBusca.trim()) return lista;

    const termo = termoBusca.toLowerCase().trim();
    const termoNum = normalizarCNAE(termo);

    return lista.filter((c) => {
      const codLimpo = normalizarCNAE(c.codigo);
      const bateNumero = termoNum && (codLimpo.includes(termoNum) || termoNum.includes(codLimpo));
      const bateTexto = c.descricao.toLowerCase().includes(termo) || c.categoria.toLowerCase().includes(termo);
      return bateNumero || bateTexto;
    });
  }, [termoBusca, categoriaAtiva]);

  // Manipulador de seleção rápida
  const handleSelecionarCnae = (c: CNAEItem) => {
    onChange(c.codigo, c.descricao, c.grauRisco);
    setModalAberto(false);
    setModoManual(false);
  };

  // Manipulador de salvar CNAE manual
  const handleSalvarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodigo.trim()) return;

    const digits = normalizarCNAE(manualCodigo);
    const codFormatado = formatarCodigoCNAE(digits.slice(0, 5)) || manualCodigo.trim();
    const grDeduzido = deduzirGrauRiscoPorDivisaoCNAE(digits);
    const desc = manualDescricao.trim() || `Atividade Econômica CNAE ${codFormatado}`;

    onChange(codFormatado, desc, grDeduzido);
    setModalAberto(false);
    setModoManual(false);
    setManualCodigo("");
    setManualDescricao("");
  };

  const infoRisco = obterGrauRiscoTexto(grauRisco);

  return (
    <div className="space-y-1.5 w-full">
      {/* Cabeçalho do seletor */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="block text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1.5">
          {puxadoReceita && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
              Puxado da Receita
            </span>
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              grauRisco === 4
                ? "bg-rose-50 text-rose-800 border-rose-300"
                : grauRisco === 3
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : grauRisco === 2
                ? "bg-sky-50 text-sky-800 border-sky-300"
                : "bg-emerald-50 text-emerald-800 border-emerald-300"
            }`}
            title={infoRisco.rotulo}
          >
            Grau de Risco {grauRisco} (NR 04)
          </span>
        </div>
      </div>

      {/* Cartão de visualização e disparo do modal de busca */}
      <div className="relative">
        <div
          id={`${id}-display`}
          onClick={() => setModalAberto(true)}
          className="w-full min-h-[44px] p-2.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-sky-500 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setModalAberto(true);
            }
          }}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-mono text-xs font-black">
              {itemAtual.codigo.split(".")[0] || "NR"}
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  CNAE {itemAtual.codigo}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {itemAtual.categoria || "Atividade"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 truncate" title={itemAtual.descricao}>
                {itemAtual.descricao}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-1 rounded-md hidden sm:inline-flex items-center gap-1 group-hover:bg-sky-100 transition-colors">
              <Search className="w-3 h-3 text-sky-600" />
              Alterar / Buscar
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </div>
        </div>
      </div>

      {/* Se houver atividades secundárias puxadas do CNPJ, exibir atalhos rápidos */}
      {cnaesSecundarios && cnaesSecundarios.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setMostrarSecundarios(!mostrarSecundarios)}
            className="text-[10.5px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>
              {mostrarSecundarios ? "Ocultar" : "Ver"} {cnaesSecundarios.length} atividades secundárias deste CNPJ
            </span>
            {mostrarSecundarios ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {mostrarSecundarios && (
            <div className="mt-1.5 p-2 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1.5 max-h-36 overflow-y-auto">
              <p className="text-[10px] font-bold text-indigo-950">
                Selecione caso a vistoria seja focada em uma atividade secundária:
              </p>
              <div className="space-y-1">
                {cnaesSecundarios.map((sec, idx) => {
                  const gr = deduzirGrauRiscoPorDivisaoCNAE(normalizarCNAE(sec.codigo));
                  return (
                    <button
                      key={`${sec.codigo}-${idx}`}
                      type="button"
                      onClick={() => {
                        onChange(sec.codigo, sec.descricao, gr);
                        setMostrarSecundarios(false);
                      }}
                      className="w-full text-left p-1.5 bg-white hover:bg-indigo-100/50 border border-indigo-100 rounded-lg text-xs flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <div className="truncate">
                        <span className="font-mono font-bold text-slate-800 mr-1.5">
                          {sec.codigo}
                        </span>
                        <span className="text-slate-600 text-[11px]">
                          {sec.descricao}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                        GR {gr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / OVERLAY DE BUSCA E SELEÇÃO DE TODOS OS CNAES */}
      {/* ========================================================= */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Cabeçalho do Modal */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Catálogo de CNAEs & Grau de Risco (NR 04)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Selecione ou busque entre todas as atividades econômicas do Brasil
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalAberto(false);
                  setModoManual(false);
                }}
                className="w-8 h-8 rounded-xl hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Busca e Alternador Manual */}
            <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-white">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-busca-cnae-catalogo"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Digite código (ex: 41.20, 47.11) ou palavra (ex: padaria, hospital, obra)..."
                    className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    autoFocus
                  />
                  {termoBusca && (
                    <button
                      type="button"
                      onClick={() => setTermoBusca("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setModoManual(!modoManual)}
                  className={`h-10 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer shrink-0 ${
                    modoManual
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Digitar Outro</span>
                </button>
              </div>

              {/* Categorias (Pills de filtro) */}
              {!modoManual && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1 pr-1">
                    <ListFilter className="w-3 h-3" /> Setores:
                  </span>
                  {CATEGORIAS_CNAE.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaAtiva(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                        categoriaAtiva === cat
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conteúdo: Lista ou Formulário Manual */}
            <div className="flex-1 overflow-y-auto p-3.5">
              {modoManual ? (
                <form onSubmit={handleSalvarManual} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Cadastrar CNAE Específico / Customizado</span>
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      O Grau de Risco é calculado automaticamente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Código CNAE (Ex: 56.11-2) *
                      </label>
                      <input
                        type="text"
                        value={manualCodigo}
                        onChange={(e) => setManualCodigo(e.target.value)}
                        placeholder="Ex: 56.11-2"
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-sky-500"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Descrição da Atividade
                      </label>
                      <input
                        type="text"
                        value={manualDescricao}
                        onChange={(e) => setManualDescricao(e.target.value)}
                        placeholder="Ex: Restaurantes e serviços de alimentação"
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {manualCodigo && (
                    <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs flex items-center justify-between">
                      <span className="text-sky-900 font-medium">
                        Enquadramento NR 04 Previsto:
                      </span>
                      <span className="font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-300">
                        Grau de Risco {deduzirGrauRiscoPorDivisaoCNAE(normalizarCNAE(manualCodigo))}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModoManual(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Confirmar e Usar este CNAE
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-1.5">
                  {/* Opção atual selecionada se não constar na lista padrão */}
                  {!LISTA_CNAE_NR04.some((c) => c.codigo === value) && value && (
                    <div
                      onClick={() => setModalAberto(false)}
                      className="p-3 rounded-xl border-2 border-sky-500 bg-sky-50/70 flex items-center justify-between gap-3 cursor-pointer shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-sky-900">
                            CNAE {value}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-200 text-sky-900">
                            Atualmente Selecionado
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5">{descricao || itemAtual.descricao}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          Grau {grauRisco}
                        </span>
                        <Check className="w-4 h-4 text-sky-600" />
                      </div>
                    </div>
                  )}

                  {/* Lista de CNAEs filtrados */}
                  {cnaesFiltrados.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        Nenhum CNAE pré-cadastrado encontrado para "{termoBusca}"
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Deseja cadastrar manualmente este código ou descrição?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setModoManual(true);
                          if (/^\d/.test(termoBusca)) {
                            setManualCodigo(termoBusca);
                          } else {
                            setManualDescricao(termoBusca);
                          }
                        }}
                        className="mt-3 px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-sky-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Cadastrar CNAE "{termoBusca}"
                      </button>
                    </div>
                  ) : (
                    cnaesFiltrados.map((c) => {
                      const isSelecionado = c.codigo === value;
                      return (
                        <div
                          key={c.codigo}
                          onClick={() => handleSelecionarCnae(c)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelecionado
                              ? "bg-sky-50 border-sky-500 shadow-xs"
                              : "bg-white hover:bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isSelecionado ? "text-sky-900" : "text-slate-900"
                                }`}
                              >
                                CNAE {c.codigo}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {c.categoria}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{c.descricao}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                c.grauRisco === 4
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : c.grauRisco === 3
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : c.grauRisco === 2
                                  ? "bg-sky-50 text-sky-800 border-sky-200"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}
                            >
                              Grau {c.grauRisco}
                            </span>
                            {isSelecionado && <Check className="w-4 h-4 text-sky-600" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Quadro I da NR 04 do MTE
              </span>
              <button
                type="button"
                onClick={() => {
                  setModalAberto(false);
                  setModoManual(false);
                }}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
