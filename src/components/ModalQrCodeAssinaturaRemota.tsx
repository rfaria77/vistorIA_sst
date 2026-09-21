import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  X,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { SessaoAssinatura, VistoriaState } from "../types";
import { salvarSessaoAssinatura, getSessaoAssinaturaPorId } from "../utils/storage";
import {
  subscribeSessaoAssinaturaNuvem,
  obterSessaoAssinaturaNuvem,
} from "../utils/firebaseSync";

interface ModalQrCodeAssinaturaRemotaProps {
  isOpen: boolean;
  onClose: () => void;
  state: VistoriaState;
  onAssinaturaRecebida: (
    assinaturaDataUrl: string,
    acompNome?: string,
    acompCargo?: string
  ) => void;
}

export const ModalQrCodeAssinaturaRemota: React.FC<ModalQrCodeAssinaturaRemotaProps> = ({
  isOpen,
  onClose,
  state,
  onAssinaturaRecebida,
}) => {
  const [sessao, setSessao] = useState<SessaoAssinatura | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [assinaturaRecebida, setAssinaturaRecebida] = useState<boolean>(false);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [linkAssinatura, setLinkAssinatura] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Inicializa sessão quando o modal abre
  useEffect(() => {
    if (!isOpen) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    setCarregando(true);
    setAssinaturaRecebida(false);
    setErro(null);

    // Gera ID único para a sessão
    const sessionId = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Constrói URL completa com o parâmetro ?assinar=ID
    const baseUrl = window.location.origin + window.location.pathname;
    const urlAssinatura = `${baseUrl}?assinar=${sessionId}`;
    setLinkAssinatura(urlAssinatura);

    const novaSessao: SessaoAssinatura = {
      id: sessionId,
      empresa: state.empresa || "Empresa Auditada",
      cnpj: state.cnpj || "",
      data: state.data || new Date().toLocaleDateString("pt-BR"),
      inspetor: state.inspetor || "Auditor SST",
      regInspetor: state.regInspetor || "",
      acompNome: state.acompNome || "",
      acompCargo: state.acompCargo || "",
      totalApontamentos: state.evidencias.length,
      status: "pendente",
      criadoEm: new Date().toISOString(),
    };

    // Salva local e na nuvem Firestore
    salvarSessaoAssinatura(novaSessao);
    setSessao(novaSessao);

    // Gera o QR Code com alta resolução
    QRCode.toDataURL(urlAssinatura, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0f172a", // Slate 900
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        setQrCodeDataUrl(dataUrl);
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro ao gerar QR Code:", err);
        setErro("Não foi possível gerar a imagem do QR Code.");
        setCarregando(false);
      });

    // Subscrição em tempo real via Firestore
    const unsub = subscribeSessaoAssinaturaNuvem(sessionId, (sessaoAtualizada) => {
      if (!sessaoAtualizada) return;

      if (sessaoAtualizada.status === "assinado" && sessaoAtualizada.assinaturaAcompanhante) {
        processarAssinaturaRecebida(sessaoAtualizada);
      }
    });
    unsubscribeRef.current = unsub;

    // Fallback local: verifica a cada 2.5 segundos se foi assinado localmente (ex: outra aba)
    const intervalLocal = setInterval(() => {
      const local = getSessaoAssinaturaPorId(sessionId);
      if (local && local.status === "assinado" && local.assinaturaAcompanhante) {
        processarAssinaturaRecebida(local);
      }
    }, 2500);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      clearInterval(intervalLocal);
    };
  }, [isOpen]);

  const processarAssinaturaRecebida = (sessaoPronta: SessaoAssinatura) => {
    if (assinaturaRecebida) return;
    setAssinaturaRecebida(true);
    setSessao(sessaoPronta);

    // Notifica após 1 segundo para o auditor visualizar a confirmação
    setTimeout(() => {
      onAssinaturaRecebida(
        sessaoPronta.assinaturaAcompanhante!,
        sessaoPronta.acompNome,
        sessaoPronta.acompCargo
      );
      onClose();
    }, 1800);
  };

  const handleCopiarLink = async () => {
    if (!linkAssinatura) return;
    try {
      await navigator.clipboard.writeText(linkAssinatura);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleVerificarStatus = async () => {
    if (!sessao) return;
    try {
      const cloud = await obterSessaoAssinaturaNuvem(sessao.id);
      if (cloud && cloud.status === "assinado" && cloud.assinaturaAcompanhante) {
        processarAssinaturaRecebida(cloud);
      } else {
        const local = getSessaoAssinaturaPorId(sessao.id);
        if (local && local.status === "assinado" && local.assinaturaAcompanhante) {
          processarAssinaturaRecebida(local);
        }
      }
    } catch (e) {
      console.warn("Erro ao checar status manualmente:", e);
    }
  };

  const linkWhatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Olá! Segue o link para assinatura digital sem contato da vistoria técnica da empresa ${state.empresa || ""}: ${linkAssinatura}`
  )}`;

  if (!isOpen) return null;

  return (
    <div
      id="modal-qrcode-assinatura"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Assinatura Remota via QR Code</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sem Contato
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                O acompanhante assina direto no próprio smartphone
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Fechar janela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-center">
          {assinaturaRecebida ? (
            /* Estado de Sucesso - Assinatura Confirmada */
            <div className="py-6 space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Assinatura Digital Recebida com Sucesso!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Transmitida em tempo real do celular do acompanhante.
                </p>
              </div>

              {sessao?.assinaturaAcompanhante && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-inner mx-auto max-w-[260px]">
                  <img
                    src={sessao.assinaturaAcompanhante}
                    alt="Assinatura capturada"
                    className="max-h-20 object-contain mx-auto"
                  />
                </div>
              )}

              <div className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 max-w-sm mx-auto">
                <p>
                  <strong className="text-white">Acompanhante:</strong>{" "}
                  {sessao?.acompNome || state.acompNome || "Não especificado"}
                </p>
                {sessao?.acompCargo && (
                  <p className="mt-0.5 text-slate-400">
                    <strong>Cargo:</strong> {sessao.acompCargo}
                  </p>
                )}
                <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                  Sessão Forense Autenticada • ID: {sessao?.id}
                </p>
              </div>

              <p className="text-[11px] text-sky-400 animate-pulse font-medium">
                Inserindo assinatura no laudo pericial...
              </p>
            </div>
          ) : (
            /* Estado Normal - Exibição do QR Code */
            <>
              {/* Card do QR Code com Borda de Contraste */}
              <div className="bg-white p-3 rounded-2xl border-4 border-sky-500/30 inline-block shadow-xl shadow-slate-950 mx-auto">
                {carregando ? (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-600 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                    <span className="text-xs font-semibold">Gerando QR Code seguro...</span>
                  </div>
                ) : erro ? (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-rose-600 gap-2 p-4 text-center">
                    <AlertCircle className="w-8 h-8" />
                    <span className="text-xs font-semibold">{erro}</span>
                  </div>
                ) : (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code de Assinatura"
                    className="w-64 h-64 object-contain rounded-lg"
                  />
                )}
              </div>

              {/* Status ao vivo */}
              <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-sky-950/60 border border-sky-500/30 rounded-xl text-sky-200 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Aguardando escaneamento e assinatura do acompanhante...</span>
              </div>

              {/* Instruções passo a passo */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-left space-y-2 text-xs">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  Instruções para o Auditor & Acompanhante:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Peça para o acompanhante abrir a <b>câmera do celular dele</b>.</li>
                  <li>Aponte para o QR Code acima para abrir a tela de assinatura.</li>
                  <li>Ele confere o resumo da vistoria e assina com o dedo na tela dele.</li>
                  <li>A assinatura aparece aqui automaticamente em segundos!</li>
                </ol>
              </div>

              {/* Opções alternativas de compartilhamento (caso a câmera falhe) */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Ou envie o link direto para o celular do acompanhante:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopiarLink}
                    className="flex-1 h-9 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiado ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-sky-400" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={linkWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition no-underline cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleVerificarStatus}
                    className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs flex items-center justify-center transition cursor-pointer"
                    title="Verificar se já foi assinado"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Certificação Digital SST
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
