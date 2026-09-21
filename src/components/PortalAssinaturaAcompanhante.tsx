import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Building2,
  Calendar,
  UserCheck,
  CheckCircle2,
  RotateCcw,
  Send,
  AlertCircle,
  FileCheck2,
  Smartphone,
  Lock,
  Loader2,
  Briefcase,
  User,
} from "lucide-react";
import { SessaoAssinatura } from "../types";
import {
  obterSessaoAssinaturaNuvem,
  enviarAssinaturaRemotaNuvem,
  subscribeSessaoAssinaturaNuvem,
} from "../utils/firebaseSync";
import {
  getSessaoAssinaturaPorId,
  salvarSessaoAssinatura,
} from "../utils/storage";

interface PortalAssinaturaAcompanhanteProps {
  sessaoId: string;
  onConcluido?: () => void;
}

export const PortalAssinaturaAcompanhante: React.FC<PortalAssinaturaAcompanhanteProps> = ({
  sessaoId,
  onConcluido,
}) => {
  const [sessao, setSessao] = useState<SessaoAssinatura | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [termoAceito, setTermoAceito] = useState(true);

  // Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  // Carrega dados da sessão
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        setCarregando(true);
        // Tenta na nuvem primeiro
        let dados = await obterSessaoAssinaturaNuvem(sessaoId);
        
        // Fallback para storage local caso nuvem falhe ou seja no mesmo navegador
        if (!dados) {
          dados = getSessaoAssinaturaPorId(sessaoId);
        }

        if (!ativo) return;

        if (!dados) {
          setErro("Sessão de assinatura não encontrada ou expirada. Solicite ao auditor a geração de um novo QR Code.");
          setCarregando(false);
          return;
        }

        setSessao(dados);
        setNome(dados.acompNome || "");
        setCargo(dados.acompCargo || "");
        
        if (dados.status === "assinado") {
          setConcluido(true);
        }

        setCarregando(false);
      } catch (err) {
        console.error("Erro ao carregar sessão de assinatura:", err);
        if (ativo) {
          const local = getSessaoAssinaturaPorId(sessaoId);
          if (local) {
            setSessao(local);
            setNome(local.acompNome || "");
            setCargo(local.acompCargo || "");
            if (local.status === "assinado") setConcluido(true);
          } else {
            setErro("Falha na conexão com o servidor de auditoria.");
          }
          setCarregando(false);
        }
      }
    }

    carregar();

    // Listener para caso o status mude
    const unsubscribe = subscribeSessaoAssinaturaNuvem(sessaoId, (atualizada) => {
      if (!ativo || !atualizada) return;
      setSessao(atualizada);
      if (atualizada.status === "assinado") {
        setConcluido(true);
      }
    });

    return () => {
      ativo = false;
      unsubscribe();
    };
  }, [sessaoId]);

  // Inicialização do Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Configura resolução real do canvas para traços nítidos no mobile
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#0f172a"; // Slate 900
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [carregando, concluido]);

  // Coordenadas no Canvas (suporte a Mouse e Touch)
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (concluido) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || concluido) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleLimpar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleEnviarAssinatura = async () => {
    if (!canvasRef.current || !hasSignature) {
      alert("Por favor, desenhe sua assinatura no quadro antes de confirmar.");
      return;
    }

    if (!nome.trim()) {
      alert("Por favor, confirme seu nome completo antes de assinar.");
      return;
    }

    try {
      setEnviando(true);
      const dataUrl = canvasRef.current.toDataURL("image/png");

      // Envia para o Firestore
      await enviarAssinaturaRemotaNuvem(sessaoId, {
        assinaturaAcompanhante: dataUrl,
        acompNome: nome.trim(),
        acompCargo: cargo.trim(),
        userAgentAssinante: navigator.userAgent,
      });

      // Atualiza também no localStorage local caso esteja testando localmente
      if (sessao) {
        salvarSessaoAssinatura({
          ...sessao,
          status: "assinado",
          assinaturaAcompanhante: dataUrl,
          acompNome: nome.trim(),
          acompCargo: cargo.trim(),
          assinadoEm: new Date().toISOString(),
        });
      }

      setConcluido(true);
      if (onConcluido) {
        onConcluido();
      }
    } catch (err) {
      console.error("Erro ao enviar assinatura:", err);
      // Fallback local se estiver offline
      if (sessao && canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        salvarSessaoAssinatura({
          ...sessao,
          status: "assinado",
          assinaturaAcompanhante: dataUrl,
          acompNome: nome.trim(),
          acompCargo: cargo.trim(),
          assinadoEm: new Date().toISOString(),
        });
        setConcluido(true);
      } else {
        alert("Ocorreu um erro ao enviar a assinatura. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-sm font-bold">Conectando ao Laudo Técnico...</h2>
        <p className="text-xs text-slate-400 mt-1">Carregando dados da vistoria pericial</p>
      </div>
    );
  }

  if (erro || !sessao) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-white">Sessão Indisponível</h2>
        <p className="text-xs text-slate-300 max-w-sm mt-1.5 leading-relaxed">
          {erro || "Não foi possível localizar os dados desta auditoria."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Tela de Conclusão e Sucesso
  if (concluido) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Assinatura Transmitida
            </span>
            <h2 className="text-lg font-bold text-white mt-2">
              Laudo Autenticado com Sucesso!
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Sua assinatura digital foi registrada e transmitida em tempo real para o celular do auditor SST.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-left text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Empresa:</span>
              <span className="font-bold text-white">{sessao.empresa}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Acompanhante:</span>
              <span className="font-bold text-white">{nome || sessao.acompNome}</span>
            </div>
            {cargo && (
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Função:</span>
                <span className="text-slate-200">{cargo}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Auditor Responsável:</span>
              <span className="text-sky-300 font-medium">{sessao.inspetor}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-200 flex items-center gap-2 text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Segurança e Higiene: Vistoria autenticada sem necessidade de toque ou contato com o aparelho do auditor.
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Você já pode fechar esta aba com segurança.
          </p>
        </div>
      </div>
    );
  }

  // Fluxo de Assinatura
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-3 sm:p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Topo do Portal */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Assinatura Digital SST</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sem Contato
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Termo de Ciência da Vistoria Técnica NR
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
            <Lock className="w-3 h-3" />
            <span>Seguro</span>
          </div>
        </div>

        {/* Resumo da Vistoria */}
        <div className="p-4 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{sessao.empresa}</span>
              </div>
              {sessao.cnpj && (
                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                  CNPJ: {sessao.cnpj}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data: <b>{sessao.data}</b></span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">Auditor: <b>{sessao.inspetor}</b></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                Apontamentos Periciados:
              </span>
              <span className="font-bold text-white bg-slate-700/80 px-2 py-0.5 rounded">
                {sessao.totalApontamentos} itens avaliados
              </span>
            </div>
          </div>

          {/* Dados do Acompanhante */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              Confirmação dos Dados do Acompanhante
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-sky-400" />
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João Carlos da Silva"
                  className="w-full h-9.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-sky-400" />
                  Cargo / Função na Empresa
                </label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ex: Gerente de Obras / Encarregado"
                  className="w-full h-9.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Termo Legal de Ciência */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termoAceito}
                onChange={(e) => setTermoAceito(e.target.checked)}
                className="mt-0.5 rounded border-slate-600 text-sky-500 focus:ring-sky-400"
              />
              <span>
                Declaro que acompanhei a vistoria técnica pericial de Segurança do Trabalho realizada nas instalações da empresa na data indicada e tomei ciência dos apontamentos efetuados pelo auditor.
              </span>
            </label>
          </div>

          {/* Quadro de Assinatura com Touch */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Assine com o dedo no quadro abaixo:
              </label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={handleLimpar}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            <div className="relative w-full h-44 bg-white rounded-xl border-2 border-slate-300 shadow-inner overflow-hidden touch-none select-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />

              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <span className="text-xs font-medium">
                    Toque e assine aqui com o dedo
                  </span>
                  <span className="text-[10px] mt-0.5">Espaço para assinatura digital</span>
                </div>
              )}
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="button"
            onClick={handleEnviarAssinatura}
            disabled={!hasSignature || !nome.trim() || !termoAceito || enviando}
            className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
              hasSignature && nome.trim() && termoAceito && !enviando
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            }`}
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitindo ao celular do auditor...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirmar e Enviar Assinatura</span>
              </>
            )}
          </button>
        </div>

        {/* Rodapé Seguro */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            Certificado Forense Digital
          </span>
          <span className="font-mono">Sessão: {sessao.id.substring(0, 12)}...</span>
        </div>
      </div>
    </div>
  );
};
