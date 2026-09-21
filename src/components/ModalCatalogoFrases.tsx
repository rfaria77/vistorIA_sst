import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  BookOpen,
  Check,
  Zap,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { FRASES_PADRAO_SST, FrasePadrao } from "../data/frasesPadrao";

interface ModalCatalogoFrasesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNrAtual?: string;
  onSelectFrase: (fraseTexto: string) => void;
}

export const ModalCatalogoFrases: React.FC<ModalCatalogoFrasesProps> = ({
  isOpen,
  onClose,
  selectedNrAtual,
  onSelectFrase,
}) => {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Todas");

  // Lista única de categorias
  const categorias = useMemo(() => {
    const setCats = new Set<string>();
    FRASES_PADRAO_SST.forEach((f) => setCats.add(f.categoria));
    return ["Todas", ...Array.from(setCats)];
  }, []);

  // Filtro de frases
  const frasesFiltradas = useMemo(() => {
    return FRASES_PADRAO_SST.filter((item) => {
      const matchCategoria =
        categoriaAtiva === "Todas" || item.categoria === categoriaAtiva;

      const termo = busca.toLowerCase().trim();
      const matchBusca =
        !termo ||
        item.titulo.toLowerCase().includes(termo) ||
        item.texto.toLowerCase().includes(termo) ||
        (item.nr && item.nr.toLowerCase().includes(termo)) ||
        item.categoria.toLowerCase().includes(termo);

      return matchCategoria && matchBusca;
    });
  }, [busca, categoriaAtiva]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Catálogo de Recomendações Técnicas Normativas
              </h3>
              <p className="text-[11px] text-slate-300">
                1 toque para preencher a Ação Corretiva com redação pericial padronizada
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar recomendação (ex: 'linha de vida', 'extintor', 'EPI', 'LOTO')..."
              className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categorias Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${
                  categoriaAtiva === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Frases */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-slate-100">
          {frasesFiltradas.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">Nenhuma recomendação encontrada para a busca.</p>
              <p className="text-[11px] mt-1">Tente buscar por outro termo ou selecione "Todas".</p>
            </div>
          ) : (
            frasesFiltradas.map((frase) => {
              const isNrAtual = selectedNrAtual && frase.nr === selectedNrAtual;
              return (
                <div
                  key={frase.id}
                  className={`pt-2.5 first:pt-0 p-3 rounded-xl border transition-all ${
                    isNrAtual
                      ? "bg-sky-50/50 border-sky-200"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{frase.titulo}</span>
                      {frase.nr && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-white">
                          {frase.nr}
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {frase.categoria}
                      </span>
                      {isNrAtual && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-600 text-white">
                          Sugerido para esta NR
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectFrase(frase.texto);
                        onClose();
                      }}
                      className="h-7 px-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 shrink-0 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Inserir</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{frase.texto}"
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Redações técnicas revisadas em conformidade com as NRs atualizadas (MTE)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
