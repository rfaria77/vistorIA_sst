import React, { useState } from "react";
import { Download, Smartphone, X, Check, Apple, Globe } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA (standalone mode), hide the button
  if (isInstalled) {
    return null;
  }

  const handleMainClick = async () => {
    // Tenta instalação automática direta se disponível (Chrome/Android/Desktop)
    if (isInstallable) {
      const success = await install();
      if (success) return;
    }
    // Caso contrário, abre o modal com opções para Android e iOS
    setShowOptionsModal(true);
  };

  return (
    <>
      <button
        type="button"
        id="btn-instalar-pwa"
        onClick={handleMainClick}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-4 py-2 text-xs font-black text-white shadow-md shadow-sky-950 transition cursor-pointer"
        title="Instalar VistorIA SST no Android ou iOS para uso offline"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Instalar App (Android / iOS)</span>
      </button>

      {/* Modal de Escolha de Sistema (Android vs iOS) */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Instalar VistorIA SST</h3>
                  <p className="text-[11px] text-slate-400">Escolha seu sistema operacional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOptionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Botão Android / Chrome */}
              <button
                type="button"
                onClick={async () => {
                  setShowOptionsModal(false);
                  const success = await install();
                  if (!success) {
                    setShowAndroidGuide(true);
                  }
                }}
                className="p-4 bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-600/40 hover:border-emerald-500 rounded-2xl flex flex-col items-center text-center gap-2.5 transition group cursor-pointer shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-emerald-300">Android / PC</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Google Chrome, Edge ou Samsung Internet</p>
                </div>
              </button>

              {/* Botão iOS / iPhone / iPad */}
              <button
                type="button"
                onClick={() => {
                  setShowOptionsModal(false);
                  setShowIOSGuide(true);
                }}
                className="p-4 bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-600/40 hover:border-sky-500 rounded-2xl flex flex-col items-center text-center gap-2.5 transition group cursor-pointer shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:scale-110 transition">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-sky-300">iOS (iPhone / iPad)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Navegador Safari do Apple iOS</p>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowOptionsModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Guia Android */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Instalar no Android
              </h3>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0">1</span>
                <span>Toque no menu de três pontos <strong>(⋮)</strong> no canto superior direito do Google Chrome.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0">2</span>
                <span>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela inicial"</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0">3</span>
                <span>Confirme em <strong>"Instalar"</strong>. O ícone aparecerá no seu celular para uso offline!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAndroidGuide(false)}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-black text-slate-950 transition cursor-pointer shadow-md"
            >
              Entendi, Fechar
            </button>
          </div>
        </div>
      )}

      {/* Guia iOS */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-sky-400" />
                Instalar no iPhone / iPad (iOS)
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
              <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0">1</span>
                <span>Abra este link no navegador <strong>Safari</strong> do seu iPhone ou iPad.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0">2</span>
                <span>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima na barra inferior).</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0">3</span>
                <span>Role o menu para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>. Pronto!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 py-3 text-xs font-black text-slate-950 transition cursor-pointer shadow-md"
            >
              Entendi, Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

