import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Loader2,
  RefreshCw,
  MapPin,
  Clock,
  ChevronDown,
  Lock,
  Mic,
  MicOff,
  PenTool,
  Sliders,
  Zap,
  BookOpen,
  FileCheck2,
} from "lucide-react";
import {
  Apontamento,
  FaixaFuncionarios,
  GrauInfracao,
  Prioridade,
  StatusApontamento,
  TipoNorma,
  VistoriaState,
} from "../types";
import {
  BASE_ITENS_NR,
  TITULOS_NR,
  calcularMultaNR28,
  formatarBRL,
} from "../data/nr28Data";
import {
  processarEOtimizarFoto,
  ResultadoOtimizacaoFoto,
} from "../utils/forensicWatermark";
import { PhotoAnnotatorModal } from "./PhotoAnnotatorModal";
import { ModalCatalogoFrases } from "./ModalCatalogoFrases";
import { FRASES_PADRAO_SST } from "../data/frasesPadrao";

interface FindingsStepProps {
  state: VistoriaState;
  onAdicionarApontamento: (apontamento: Apontamento) => void;
  onRemoverApontamento: (id: string) => void;
  onSalvarRascunho: () => void;
  onNext: () => void;
}

export const FindingsStep: React.FC<FindingsStepProps> = ({
  state,
  onAdicionarApontamento,
  onRemoverApontamento,
  onSalvarRascunho,
  onNext,
}) => {
  // Form fields
  const [textoIa, setTextoIa] = useState("");
  const [loadingIa, setLoadingIa] = useState(false);
  const [iaFeedback, setIaFeedback] = useState<string | null>(null);

  // Selected NR & Item
  const nrsDisponiveis: string[] = useMemo(() => {
    return Array.from(new Set(BASE_ITENS_NR.map((i) => i.nr).filter((n): n is string => Boolean(n)))).sort((a: string, b: string) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });
  }, []);
  const [selectedNr, setSelectedNr] = useState("NR 35");
  const itensDaNr = BASE_ITENS_NR.filter((i) => i.nr === selectedNr);
  const [selectedItemCode, setSelectedItemCode] = useState(itensDaNr[0]?.item || "35.2.1");

  // Other fields
  const [status, setStatus] = useState<StatusApontamento>("Não Conformidade");
  const [prioridade, setPrioridade] = useState<Prioridade>("Alta");
  const [descricaoCenario, setDescricaoCenario] = useState("");
  const [acaoCorretiva, setAcaoCorretiva] = useState("");

  // Photo & Forensic state (com redimensionamento para 1280px e 80% JPEG)
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);
  const [metricasFoto, setMetricasFoto] = useState<ResultadoOtimizacaoFoto | null>(null);
  const [carimbandoFoto, setCarimbandoFoto] = useState(false);
  const [modalAnotacaoAberta, setModalAnotacaoAberta] = useState(false);
  const [coordenadasGps, setCoordenadasGps] = useState<{ lat: number; lng: number } | null>(null);

  // Catálogo de Frases e Recomendações Padrão
  const [modalFrasesAberta, setModalFrasesAberta] = useState(false);

  const frasesSugeridas = useMemo(() => {
    const exatas = FRASES_PADRAO_SST.filter((f) => f.nr === selectedNr);
    const universais = FRASES_PADRAO_SST.filter((f) => !f.nr).slice(0, 2);
    return [...exatas, ...universais];
  }, [selectedNr]);

  const handleAplicarFrasePadrao = (texto: string) => {
    setAcaoCorretiva((prev) => {
      if (!prev || !prev.trim()) return texto;
      return `${prev.trim()}. ${texto}`;
    });
  };

  // Voice recording state (Speech-to-text nativo para IA, Cenário e Ação)
  const [gravandoCampo, setGravandoCampo] = useState<"ia" | "cenario" | "acao" | null>(null);
  const recognitionRef = useRef<any>(null);

  const fileCameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileGalleryInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleVoz = (campo: "ia" | "cenario" | "acao") => {
    if (gravandoCampo === campo) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setGravandoCampo(null);
      return;
    }

    // Se já estiver gravando outro campo, encerra anterior
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Seu navegador não possui suporte direto à API de reconhecimento de voz. Recomendamos usar o Google Chrome no celular ou computador."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setGravandoCampo(campo);
        if (campo === "ia") {
          setIaFeedback("Ouvindo relato em campo... Fale a situação observada.");
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          if (campo === "ia") {
            setTextoIa((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIaFeedback(`Áudio transcrito: "${transcript}"`);
          } else if (campo === "cenario") {
            setDescricaoCenario((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
          } else if (campo === "acao") {
            setAcaoCorretiva((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
          }
        }
        setGravandoCampo(null);
      };

      recognition.onerror = (event: any) => {
        console.warn("Erro no reconhecimento de voz:", event?.error);
        setGravandoCampo(null);
        if (campo === "ia") {
          if (event?.error === "not-allowed") {
            setIaFeedback("Permissão de microfone negada. Autorize o microfone no navegador.");
          } else {
            setIaFeedback("Não foi possível capturar o áudio. Tente novamente ou digite o relato.");
          }
        }
      };

      recognition.onend = () => {
        setGravandoCampo(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Falha ao iniciar reconhecimento de voz:", err);
      setGravandoCampo(null);
    }
  };

  // Get current GPS position on mount for forensic stamp
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordenadasGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Fallback handled smoothly
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, []);

  // Sync selected item when NR changes
  useEffect(() => {
    const itens = BASE_ITENS_NR.filter((i) => i.nr === selectedNr);
    if (itens.length > 0 && !itens.some((it) => it.item === selectedItemCode)) {
      setSelectedItemCode(itens[0].item);
    }
  }, [selectedNr, selectedItemCode]);

  // Current active item object
  const currentItem = BASE_ITENS_NR.find((i) => i.item === selectedItemCode) || BASE_ITENS_NR[0];
  const [valMin, valMax] = calcularMultaNR28(currentItem.infracao || currentItem.grau || "I1", (state.faixa || "1 a 10") as FaixaFuncionarios, currentItem.tipo);

  // KPIs
  const passivoRiscoTotal = state.evidencias
    .filter((e) => e.status === "Não Conformidade")
    .reduce((acc, curr) => acc + (curr.valorMax || 0), 0);

  const economiaGeradaTotal = state.evidencias
    .filter((e) => e.status === "Conformidade")
    .reduce((acc, curr) => acc + (curr.valorMax || 0), 0);

  // Handle Photo Capture com Redimensionamento Automático no Navegador e Compressão 80% JPEG
  const handlePhotoSelected = async (file: File) => {
    try {
      setCarimbandoFoto(true);
      const resultado = await processarEOtimizarFoto(file, {
        lat: coordenadasGps?.lat,
        lng: coordenadasGps?.lng,
        auditorNome: state.inspetor,
        empresaNome: state.empresa,
        maxDim: 1280,
        qualidade: 0.80,
      });
      setFotoDataUrl(resultado.dataUrl);
      setMetricasFoto(resultado);
    } catch (err) {
      console.error("Erro ao aplicar carimbo e comprimir foto:", err);
    } finally {
      setCarimbandoFoto(false);
    }
  };

  // AI Enquadramento
  const handleConsultarIA = async () => {
    if (!textoIa.trim()) return;
    setLoadingIa(true);
    setIaFeedback(null);

    try {
      const resp = await fetch("/api/ai/enquadrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: textoIa.trim(),
          nrsDisponiveis,
        }),
      });

      const data = await resp.json();
      if (data.success && data.data) {
        const itemSugerido = data.data;
        if (itemSugerido.nr_sugerida && nrsDisponiveis.includes(itemSugerido.nr_sugerida)) {
          setSelectedNr(itemSugerido.nr_sugerida);
        }
        if (itemSugerido.item_provavel) {
          setSelectedItemCode(itemSugerido.item_provavel);
        }
        if (itemSugerido.status) {
          setStatus(itemSugerido.status as StatusApontamento);
        }
        if (itemSugerido.prioridade) {
          setPrioridade(itemSugerido.prioridade as Prioridade);
        }
        if (itemSugerido.descricao_cenario) {
          setDescricaoCenario(itemSugerido.descricao_cenario);
        }
        if (itemSugerido.acao_corretiva) {
          setAcaoCorretiva(itemSugerido.acao_corretiva);
        }

        const fonteNome = data.fonte ? ` [${data.fonte}]` : "";
        setIaFeedback(`Enquadrado na ${itemSugerido.nr_sugerida} (Item ${itemSugerido.item_provavel})${fonteNome}`);
      }
    } catch (e) {
      console.error("Falha ao consultar IA:", e);
    } finally {
      setLoadingIa(false);
    }
  };

  const handleSalvarApontamento = (e: React.FormEvent) => {
    e.preventDefault();

    const novo: Apontamento = {
      id: `ap-${Date.now()}`,
      nr: selectedNr,
      itemNr: currentItem.item,
      descricao: currentItem.descricao,
      infracao: currentItem.infracao,
      tipo: currentItem.tipo,
      status,
      prioridade,
      descricaoCenario:
        descricaoCenario.trim() ||
        (status === "Conformidade"
          ? "Boa prática constatada durante vistoria pericial in loco."
          : "Irregularidade constatada durante a vistoria pericial in loco."),
      acaoCorretiva:
        status === "Conformidade"
          ? "Não aplicável — Item em conformidade técnica (Boa Prática)."
          : acaoCorretiva.trim() ||
            "Adequar a atividade/ambiente imediatamente aos preceitos da norma regulamentadora.",
      valorMin: valMin,
      valorMax: valMax,
      fotoDataUrl: fotoDataUrl || undefined,
      coordenadasGps,
      criadoEm: new Date().toLocaleTimeString("pt-BR"),
    };

    onAdicionarApontamento(novo);

    // Reset fields for next inspection item
    setTextoIa("");
    setIaFeedback(null);
    setDescricaoCenario("");
    setAcaoCorretiva("");
    setFotoDataUrl(null);
    setMetricasFoto(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Sticky Financial Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl border border-rose-200 p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Passivo em Risco
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-600 mt-1">
            {formatarBRL(passivoRiscoTotal)}
          </p>
          <span className="text-[10px] text-slate-400">
            {state.evidencias.filter((e) => e.status === "Não Conformidade").length} infrações NR 28
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Economia Gerada
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-600 mt-1">
            {formatarBRL(economiaGeradaTotal)}
          </p>
          <span className="text-[10px] text-slate-400">
            {state.evidencias.filter((e) => e.status === "Conformidade").length} boas práticas
          </span>
        </div>
      </div>

      {/* Main Register Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Registro de Apontamento Técnico</h2>
              <p className="text-xs text-slate-500">Auditoria fotográfica pericial com inteligência artificial</p>
            </div>
          </div>

          <button
            type="button"
            id="btn-salvar-rascunho-topo"
            onClick={onSalvarRascunho}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Rascunho
          </button>
        </div>

        {/* AI Enquadramento Box */}
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 border border-sky-200 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs mb-1.5">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Enquadramento Inteligente com IA (Groq Principal • Gemini Secundária)</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-2">
            Digite ou cole a situação observada (ex: <i>"trabalhadores em andaime sem linha de vida e sem cinto"</i>). A IA preencherá automaticamente a NR, o item e a medida técnica via Groq (ou Gemini em fallback).
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              id="input-relato-ia"
              value={textoIa}
              onChange={(e) => setTextoIa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConsultarIA()}
              placeholder="Descreva a situação em campo ou clique no microfone..."
              className="flex-1 h-10 px-3 bg-white border border-sky-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              id="btn-ditado-voz"
              onClick={() => handleToggleVoz("ia")}
              className={`px-3 h-10 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 border transition-all cursor-pointer ${
                gravandoCampo === "ia"
                  ? "bg-rose-600 text-white border-rose-700 animate-pulse shadow-md"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs"
              }`}
              title={gravandoCampo === "ia" ? "Parar gravação de voz" : "Ditar relato por voz (Speech-to-Text)"}
            >
              {gravandoCampo === "ia" ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-rose-600" />}
              <span className="hidden xs:inline">{gravandoCampo === "ia" ? "Ouvindo..." : "Ditar Voz"}</span>
            </button>
            <button
              type="button"
              id="btn-enquadrar-ia"
              onClick={handleConsultarIA}
              disabled={loadingIa || !textoIa.trim()}
              className="px-3.5 h-10 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
            >
              {loadingIa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loadingIa ? "Analisando..." : "Enquadrar"}</span>
            </button>
          </div>

          {iaFeedback && (
            <div className="mt-2 text-xs font-semibold text-sky-800 bg-sky-100/70 py-1 px-2.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              <span>{iaFeedback}</span>
            </div>
          )}
        </div>

        {/* Photo Forensic Stamp Section */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-600" />
              Evidência Fotográfica (Carimbo Forense SST)
            </span>
            {coordenadasGps && (
              <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                GPS Ativo ({coordenadasGps.lat.toFixed(4)}, {coordenadasGps.lng.toFixed(4)})
              </span>
            )}
          </label>

          {/* Hidden inputs for camera and gallery */}
          <input
            type="file"
            ref={fileCameraInputRef}
            id="input-camera-mobile"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoSelected(file);
            }}
          />
          <input
            type="file"
            ref={fileGalleryInputRef}
            id="input-galeria-mobile"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoSelected(file);
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-tirar-foto"
              onClick={() => fileCameraInputRef.current?.click()}
              className="h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Camera className="w-4 h-4 text-sky-400" />
              <span>Tirar Foto na Obra</span>
            </button>

            <button
              type="button"
              id="btn-carregar-galeria"
              onClick={() => fileGalleryInputRef.current?.click()}
              className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-slate-600" />
              <span>Arquivo / Galeria</span>
            </button>
          </div>

          {carimbandoFoto && (
            <div className="mt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span>Otimizando resolução (1280px • JPEG 80%) e aplicando Carimbo Forense...</span>
            </div>
          )}

          {fotoDataUrl && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950">
              <img
                src={fotoDataUrl}
                alt="Evidência Pericial Carimbada"
                className="w-full max-h-56 object-contain block mx-auto"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-anotar-foto"
                  onClick={() => setModalAnotacaoAberta(true)}
                  className="bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 border border-slate-700 backdrop-blur-xs transition-all"
                  title="Desenhar setas, círculos e caixas de destaque"
                >
                  <PenTool className="w-3.5 h-3.5 text-sky-400" />
                  <span>Destacar Irregularidade</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFotoDataUrl(null);
                  setMetricasFoto(null);
                }}
                className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg shadow-sm"
                title="Remover foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center gap-1.5">
                <div className="bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs border border-slate-700/50">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Carimbo Forense SST</span>
                </div>
                {metricasFoto && (
                  <div className="bg-emerald-950/90 text-emerald-200 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold backdrop-blur-xs border border-emerald-500/40">
                    <FileCheck2 className="w-3 h-3 text-emerald-400" />
                    <span>
                      Otimizada {metricasFoto.largura}x{metricasFoto.altura}px ({metricasFoto.tamanhoFinalKb} KB
                      {metricasFoto.reducaoPercentual ? ` • -${metricasFoto.reducaoPercentual}% dados` : ""})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Fields: NR, Item, Classification */}
        <form onSubmit={handleSalvarApontamento} className="space-y-3 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Norma Regulamentadora (NR)
              </label>
              <select
                id="select-nr"
                value={selectedNr}
                onChange={(e) => setSelectedNr(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                {nrsDisponiveis.map((nr) => (
                  <option key={nr} value={nr}>
                    {TITULOS_NR[nr] || nr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Correspondente (NR 28)
              </label>
              <select
                id="select-item-nr"
                value={selectedItemCode}
                onChange={(e) => setSelectedItemCode(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                {itensDaNr.map((it) => (
                  <option key={it.item} value={it.item}>
                    {it.item} - {it.descricao.slice(0, 48)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description of standard item */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
            <p className="font-semibold text-slate-800 mb-1">Requisito Legal ({selectedNr} Item {currentItem.item}):</p>
            <p className="text-slate-600 leading-relaxed">{currentItem.descricao}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] font-bold">
              <span className="text-slate-500">
                Grau: <b className="text-slate-900">{currentItem.infracao}</b>
              </span>
              <span className="text-slate-500">
                Tipo: <b className="text-slate-900">{currentItem.tipo === "M" ? "Medicina" : "Segurança"}</b>
              </span>
              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                Multa Estimada ({state.faixa} func.): {formatarBRL(valMin)} a {formatarBRL(valMax)}
              </span>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Classificação da Evidência
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-status-nao-conformidade"
                  onClick={() => setStatus("Não Conformidade")}
                  className={`h-9 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    status === "Não Conformidade"
                      ? "bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Não Conformidade
                </button>

                <button
                  type="button"
                  id="btn-status-conformidade"
                  onClick={() => {
                    setStatus("Conformidade");
                    setAcaoCorretiva("");
                  }}
                  className={`h-9 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    status === "Conformidade"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-500"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Conformidade (Boa Prática)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prioridade Técnica
              </label>
              <select
                id="select-prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="Alta">Alta (Risco Iminente / Multa I4)</option>
                <option value="Média">Média (Risco Moderado)</option>
                <option value="Baixa">Baixa (Melhoria Contínua)</option>
              </select>
            </div>
          </div>

          {/* Text Areas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Cenário Observado em Campo
              </label>
              <button
                type="button"
                id="btn-voz-cenario"
                onClick={() => handleToggleVoz("cenario")}
                className={`h-6.5 px-2 rounded-lg font-bold text-[11px] flex items-center gap-1 border transition-all cursor-pointer ${
                  gravandoCampo === "cenario"
                    ? "bg-rose-600 text-white border-rose-700 animate-pulse shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                }`}
                title={gravandoCampo === "cenario" ? "Parar gravação" : "Ditar cenário por voz"}
              >
                {gravandoCampo === "cenario" ? (
                  <MicOff className="w-3 h-3 text-white" />
                ) : (
                  <Mic className="w-3 h-3 text-rose-600" />
                )}
                <span>{gravandoCampo === "cenario" ? "Gravando..." : "Ditar Voz"}</span>
              </button>
            </div>
            <textarea
              id="textarea-cenario"
              rows={2}
              value={descricaoCenario}
              onChange={(e) => setDescricaoCenario(e.target.value)}
              placeholder="Descreva a condição de trabalho constatada na vistoria ou use o microfone..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Ação Corretiva Recomendada (Medida Imediata)
              </label>
              <div className="flex items-center gap-2">
                {status === "Conformidade" ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    Bloqueado (Boa Prática)
                  </span>
                ) : (
                  <button
                    type="button"
                    id="btn-voz-acao"
                    onClick={() => handleToggleVoz("acao")}
                    className={`h-6.5 px-2 rounded-lg font-bold text-[11px] flex items-center gap-1 border transition-all cursor-pointer ${
                      gravandoCampo === "acao"
                        ? "bg-rose-600 text-white border-rose-700 animate-pulse shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                    }`}
                    title={gravandoCampo === "acao" ? "Parar gravação" : "Ditar ação corretiva por voz"}
                  >
                    {gravandoCampo === "acao" ? (
                      <MicOff className="w-3 h-3 text-white" />
                    ) : (
                      <Mic className="w-3 h-3 text-rose-600" />
                    )}
                    <span>{gravandoCampo === "acao" ? "Gravando..." : "Ditar Voz"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sugestões Rápidas de Frases e Recomendações Padrão (1 toque) */}
            {status !== "Conformidade" && (
              <div className="mb-2 bg-gradient-to-r from-slate-50 to-sky-50/50 border border-sky-100 rounded-xl p-2.5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Recomendações Padrão ({selectedNr}):</span>
                  </div>
                  <button
                    type="button"
                    id="btn-catalogo-completo"
                    onClick={() => setModalFrasesAberta(true)}
                    className="text-[11px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Ver Catálogo Completo</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {frasesSugeridas.map((frase) => (
                    <button
                      key={frase.id}
                      type="button"
                      onClick={() => handleAplicarFrasePadrao(frase.texto)}
                      className="h-6.5 px-2.5 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 whitespace-nowrap shadow-2xs transition active:scale-95 cursor-pointer"
                      title={frase.texto}
                    >
                      <span className="text-amber-500">⚡</span>
                      <span>{frase.titulo}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              id="textarea-acao"
              rows={2}
              disabled={status === "Conformidade"}
              value={status === "Conformidade" ? "" : acaoCorretiva}
              onChange={(e) => setAcaoCorretiva(e.target.value)}
              placeholder={
                status === "Conformidade"
                  ? "Não aplicável — Item em conformidade legal (Boa Prática dispensada de medida corretiva)."
                  : "Descreva a orientação técnica para adequação legal ou selecione uma frase padrão acima..."
              }
              className={`w-full p-2.5 rounded-xl text-xs transition-colors ${
                status === "Conformidade"
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none placeholder:text-slate-400"
                  : "bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-sky-500"
              }`}
            />
            {status === "Conformidade" && (
              <p className="text-[10px] text-emerald-700 font-medium mt-1">
                * Para itens em conformidade (boas práticas), o Plano de Ação não exige medida corretiva.
              </p>
            )}
          </div>

          <button
            type="submit"
            id="btn-salvar-apontamento"
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Este Apontamento no Laudo</span>
          </button>
        </form>
      </div>

      {/* List of Registered Findings */}
      {state.evidencias.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Apontamentos Cadastrados</span>
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {state.evidencias.length}
              </span>
            </h3>
            <span className="text-xs text-slate-400">Clique na lixeira para excluir</span>
          </div>

          <div className="space-y-2.5">
            {state.evidencias.map((ev, index) => {
              const isNC = ev.status === "Não Conformidade";
              return (
                <div
                  key={ev.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isNC
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-emerald-50/40 border-emerald-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {ev.fotoDataUrl ? (
                        <img
                          src={ev.fotoDataUrl}
                          alt="Miniatura"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0 bg-slate-900"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 text-[10px] text-center p-1">
                          Sem foto
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              isNC ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                            }`}
                          >
                            {isNC ? `NÃO CONFORMIDADE (${ev.prioridade})` : "BOA PRÁTICA"}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            #{index + 1} {ev.nr} (Item {ev.itemNr})
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 mt-1 font-medium line-clamp-1">
                          {ev.descricaoCenario}
                        </p>

                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                          <span className="text-slate-500 font-medium">
                            Grau {ev.infracao || ev.grauInfracao || "I1"} ({ev.tipo === "M" ? "Medicina" : "Segurança"})
                          </span>
                          <span className={`font-bold ${isNC ? "text-rose-600" : "text-emerald-700"}`}>
                            {formatarBRL(ev.valorMin || 0)} a {formatarBRL(ev.valorMax || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoverApontamento(ev.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir apontamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Button to Finish Step */}
      <button
        type="button"
        id="btn-avancar-fechamento"
        onClick={onNext}
        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
      >
        <span>Concluir Campo e Ir para Fechamento &amp; Assinaturas</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Photo Annotator Modal */}
      <PhotoAnnotatorModal
        isOpen={modalAnotacaoAberta}
        onClose={() => setModalAnotacaoAberta(false)}
        imageDataUrl={fotoDataUrl || ""}
        onSaveAnnotatedImage={(newImg) => setFotoDataUrl(newImg)}
      />

      {/* Catálogo Completo de Recomendações Técnicas */}
      <ModalCatalogoFrases
        isOpen={modalFrasesAberta}
        onClose={() => setModalFrasesAberta(false)}
        selectedNrAtual={selectedNr}
        onSelectFrase={handleAplicarFrasePadrao}
      />
    </div>
  );
};
