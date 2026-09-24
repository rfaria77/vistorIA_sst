import React, { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  BarChart3,
  CalendarDays,
  Settings,
  FileCheck2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UsuarioAuditor } from "../types";

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  badge: string;
  description: string;
  tip?: string;
  icon: React.ElementType;
  position?: "bottom" | "top" | "left" | "right" | "center";
}

interface InteractiveTourProps {
  usuario: UsuarioAuditor;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  usuario,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Configuração dos passos do tour baseado no perfil do usuário
  const steps: TourStep[] = React.useMemo(() => {
    const list: TourStep[] = [
      {
        id: "nova-inspecao",
        targetId: "btn-iniciar-nova-inspecao",
        title: "Iniciar Nova Inspeção Técnica",
        badge: "Ponto de Partida",
        description:
          "Clique aqui para abrir um novo levantamento pericial em campo. Você seleciona a empresa cliente, aponta irregularidades das NRs (06, 10, 12, 18, 35) e anexa fotos com carimbo forense.",
        tip: "O sistema calcula automaticamente o enquadramento na NR 28 e os valores das multas mínimas e máximas.",
        icon: PlusCircle,
        position: "bottom",
      },
      {
        id: "dashboard-gestao",
        targetId: "btn-hero-abrir-dashboard",
        title: "Dashboard Analítico & Gráficos",
        badge: "Inteligência Estratégica",
        description:
          "Tenha uma visão executiva completa com gráficos interativos: NRs mais autuadas, valor total acumulado de multas prevenidas e volume de inspeções por empresa.",
        tip: "Ideal para apresentar relatórios e relatórios gerenciais para diretores e clientes.",
        icon: BarChart3,
        position: "bottom",
      },
      {
        id: "programacao-prazos",
        targetId: "btn-hero-abrir-programacao",
        title: "Programação & Controle de Prazos",
        badge: "Governança de Rotinas",
        description:
          "Gerencie a periodicidade de inspeções por empresa (semanal, quinzenal, mensal, etc.). O Hub avisa proativamente quando um relatório estiver próximo do vencimento ou atrasado.",
        tip: "Evita esquecimentos e mantém a conformidade legal do cronograma de SST em dia.",
        icon: CalendarDays,
        position: "bottom",
      },
    ];

    // Se for administrador, destaca o painel de governança corporativa
    if (usuario.perfil === "admin") {
      list.push({
        id: "painel-adm",
        targetId: "btn-hub-gestao-adm",
        title: "Painel de Gestão Corporativa",
        badge: "Exclusivo Administrador",
        description:
          "Área restrita de governança: cadastre novas empresas clientes (com busca de CNPJ direto da Receita Federal), gerencie perfis de auditores e insira a logomarca oficial dos laudos.",
        tip: "Apenas administradores podem cadastrar novos inspetores e excluir laudos oficiais arquivados.",
        icon: Settings,
        position: "bottom",
      });
    }

    list.push({
      id: "abas-vistorias",
      targetId: "tab-todas-inspecoes",
      title: "Gestão de Vistorias & Laudos Lacrados",
      badge: "Histórico & Segurança Jurídica",
      description:
        "Acompanhe suas vistorias em andamento, retome rascunhos onde parou e consulte laudos já emitidos. Laudos finalizados são lacrados com assinatura digital e carimbo de tempo pericial.",
      tip: "Você pode baixar o PDF oficial dos laudos a qualquer momento, inclusive com opção de ocultar multas para encarregados operacionais.",
      icon: FileCheck2,
      position: "top",
    });

    list.push({
      id: "conclusao",
      targetId: "btn-hub-tour-guiado",
      title: "Tudo Pronto para Auditar!",
      badge: "Pronto para Uso",
      description:
        "Você já conhece os pontos principais do VistorIA SST. O sistema funciona inclusive offline no tablet ou celular e sincroniza automaticamente assim que houver conexão com a internet.",
      tip: "Sempre que quiser rever este guia passo a passo, basta clicar em 'Tour Guiado' no topo da tela.",
      icon: Sparkles,
      position: "bottom",
    });

    return list;
  }, [usuario.perfil]);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Detecta se é dispositivo mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Atualiza posição do retângulo do elemento alvo
  const updateTargetRect = useCallback(() => {
    if (!isOpen) return;

    let targetEl = document.getElementById(currentStep.targetId);

    // Fallbacks inteligentes se algum botão não estiver visível
    if (!targetEl && currentStep.id === "dashboard-gestao") {
      targetEl = document.getElementById("btn-hub-dashboard");
    }
    if (!targetEl && currentStep.id === "programacao-prazos") {
      targetEl = document.getElementById("btn-hub-programacao");
    }

    if (targetEl) {
      // Scroll suave para colocar o elemento em visão se necessário
      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      const rect = targetEl.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    // Atualiza imediatamente e também após um pequeno atraso para dar tempo de render/scroll
    updateTargetRect();
    const timer = setTimeout(updateTargetRect, 200);

    const handleScrollOrResize = () => {
      updateTargetRect();
    };

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  // Navegação por teclado (ESC, setas)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onComplete();
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length, onClose, onComplete]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const StepIcon = currentStep.icon;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  // Cálculo da posição do Card flutuante
  const calculateCardStyle = (): React.CSSProperties => {
    if (isMobile || !targetRect) {
      // No mobile ou se elemento não encontrado, centraliza na parte inferior
      return {
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 460,
        zIndex: 100,
      };
    }

    const cardWidth = 440;
    const padding = 16;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    // Clamping para não vazar a tela
    left = Math.max(padding, Math.min(windowWidth - cardWidth - padding, left));

    let top: number;
    const spaceBelow = windowHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    // Se preferir em cima ou se não couber embaixo
    if (currentStep.position === "top" || (spaceBelow < 320 && spaceAbove > spaceBelow)) {
      top = Math.max(padding, targetRect.top - 330);
    } else {
      top = Math.min(windowHeight - 330, targetRect.bottom + 16);
    }

    return {
      position: "fixed",
      top: Math.max(padding, top),
      left,
      width: cardWidth,
      zIndex: 100,
    };
  };

  return (
    <div
      id="modal-interactive-tour-overlay"
      className="fixed inset-0 z-50 overflow-hidden pointer-events-auto select-none"
      aria-label="Tour interativo do Hub de Inspeção"
      role="dialog"
    >
      {/* Backdrop escuro translúcido com leve desfoque */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Caixa de Spotlight / Destaque visual sobre o elemento alvo */}
      {targetRect && (
        <div
          id="tour-spotlight-focus"
          className="fixed rounded-2xl border-2 border-sky-400 ring-4 ring-sky-500/30 shadow-[0_0_40px_rgba(56,189,248,0.5)] transition-all duration-300 pointer-events-none z-60"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        >
          {/* Efeito de pulso nos cantos do elemento destacado */}
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-sky-400 rounded-full animate-ping" />
        </div>
      )}

      {/* Card do Passo Atual do Tour */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`tour-step-${currentStep.id}`}
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={calculateCardStyle()}
          className="bg-slate-900 border border-sky-500/50 rounded-3xl shadow-2xl shadow-sky-950/60 p-5 sm:p-6 text-slate-100 flex flex-col gap-4 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra de Progresso Superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Cabeçalho do Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 font-black text-[10px] uppercase tracking-wider">
                {currentStep.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Passo {currentStepIndex + 1} de {steps.length}
              </span>
            </div>

            <button
              type="button"
              id="btn-fechar-tour"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Fechar / Pular Tour (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo Principal do Passo */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-sky-950/50">
              <StepIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Dica Profissional / Pro Tip */}
          {currentStep.tip && (
            <div className="p-3 bg-slate-950/80 border border-sky-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-sky-300">Dica Prática: </span>
                {currentStep.tip}
              </div>
            </div>
          )}

          {/* Rodapé e Botões de Ação */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? "w-6 bg-sky-400"
                      : idx < currentStepIndex
                      ? "w-2 bg-indigo-500/70 hover:bg-indigo-400"
                      : "w-2 bg-slate-700 hover:bg-slate-600"
                  }`}
                  title={`Ir para o passo ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  id="btn-tour-anterior"
                  onClick={handlePrev}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-tour-pular"
                  onClick={onClose}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Pular Tour
                </button>
              )}

              <button
                type="button"
                id="btn-tour-proximo"
                onClick={handleNext}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-sky-950 transition-all cursor-pointer"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Concluir Tour</span>
                  </>
                ) : (
                  <>
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dica de teclado sutil */}
          <div className="text-[10px] text-slate-500 text-center -mt-1 hidden sm:block">
            Navegue usando as setas ⬅️ ➡️ ou pressione <kbd className="px-1 py-0.2 bg-slate-800 rounded text-slate-400 font-mono">ESC</kbd> para fechar
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
