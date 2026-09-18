import React, { useState } from "react";
import { Download, Smartphone, X, Check } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA (standalone mode), hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        id="btn-instalar-pwa"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition cursor-pointer"
        title="Instalar VistorIA SST no Dispositivo para uso offline"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App Offline</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          id="btn-instalar-ios-pwa"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition cursor-pointer"
          title="Instalar no iPhone ou iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  Instalar VistorIA no iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Abra esta página no <strong>Safari</strong> do iOS e toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta).</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Role o menu para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Toque em <strong>Adicionar</strong> no canto superior. Pronto! O app funcionará em tela cheia e 100% offline em campo.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition cursor-pointer"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
