import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, X, ShieldCheck, FileText, CheckCircle2, Building2, Camera, Award } from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Bem-vindo ao VistorIA SST 🛡️",
    subtitle: "Sua plataforma pericial de inteligência em Segurança do Trabalho",
    description: "Este tour rápido vai guiá-lo pelas principais funcionalidades para realizar vistorias técnicas completas, gerar laudos em PDF e calcular multas da NR 28 com precisão.",
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    badge: "Passo 1 de 5",
    color: "from-indigo-900 to-slate-900",
  },
  {
    title: "1. Identificação da Empresa 🏢",
    subtitle: "Consulta automática de CNPJ, CNAE e Grau de Risco",
    description: "Inicie uma nova vistoria preenchendo os dados do estabelecimento. O sistema consulta automaticamente a base pública de CNPJs para preencher razão social, CNAE e o Grau de Risco da atividade conforme a NR 4.",
    icon: <Building2 className="w-6 h-6 text-sky-400" />,
    badge: "Passo 2 de 5",
    color: "from-sky-900 to-slate-900",
  },
  {
    title: "2. Apontamentos & Evidências (NRs) 📋",
    subtitle: "Inspeção por Norma Regulamentadora com fotos e multas",
    description: "Navegue pelas NRs, adicione apontamentos (Conforme, Não Conformidade ou Não Aplicável), tire ou envie fotos com evidências visuais e defina os prazos corretivos e graus de infração.",
    icon: <Camera className="w-6 h-6 text-emerald-400" />,
    badge: "Passo 3 de 5",
    color: "from-emerald-900 to-slate-900",
  },
  {
    title: "3. Cálculo de Passivo (NR 28) 💰",
    subtitle: "Apuração automática de penalidades e multas fiscais",
    description: "Com base no quadro de funcionários (faixas) e no grau da infração (I1 a I4), o VistorIA SST calcula automaticamente o passivo trabalhista potencial e a multa máxima baseada no valor oficial da UFIR.",
    icon: <Award className="w-6 h-6 text-amber-400" />,
    badge: "Passo 4 de 5",
    color: "from-amber-950 to-slate-900",
  },
  {
    title: "4. Assinatura Remota & Laudo PDF ✍️",
    subtitle: "Fechamento pericial profissional com QR Code",
    description: "Colete a assinatura do acompanhante de forma presencial ou envie um QR Code seguro para que o responsável assine pelo próprio celular. Em seguida, emita o Laudo Pericial em PDF completo e assinado!",
    icon: <FileText className="w-6 h-6 text-indigo-400" />,
    badge: "Passo 5 de 5",
    color: "from-violet-950 to-slate-900",
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const totalSteps = TOUR_STEPS.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header com gradiente dinâmico */}
        <div className={`bg-gradient-to-br ${step.color} text-white p-6 relative flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-md">
              {step.badge}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
              title="Fechar tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3.5 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
              {step.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {step.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {step.description}
          </p>

          {/* Indicadores de progresso (dots) */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? "w-8 bg-indigo-600"
                    : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
                title={`Ir para o passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botões de navegação */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer py-2 px-1"
              >
                Pular tour
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-200 cursor-pointer ml-auto"
            >
              <span>{currentStep === totalSteps - 1 ? "Concluir & Começar" : "Próximo"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
