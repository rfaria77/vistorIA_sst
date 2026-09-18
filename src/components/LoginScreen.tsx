import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  UserCheck,
  Shield,
  KeyRound,
} from "lucide-react";
import { UsuarioAuditor } from "../types";
import { getUsuarios, salvarUsuario } from "../utils/storage";

interface LoginScreenProps {
  onLoginSuccess: (usuario: UsuarioAuditor) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<UsuarioAuditor[]>([]);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState<string>("usr-admin-1");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const list = getUsuarios();
    setUsuariosCadastrados(list);
    if (list.length > 0) {
      setUsuarioSelecionadoId(list[0].id);
    }
  }, []);

  const usuarioSelecionado = usuariosCadastrados.find(
    (u) => u.id === usuarioSelecionadoId
  ) || usuariosCadastrados[0];

  const handleSelecionarUsuario = (id: string) => {
    setUsuarioSelecionadoId(id);
    setErro(null);
    setSenha("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSelecionado) {
      setErro("Selecione um usuário para continuar.");
      return;
    }

    if (!senha.trim()) {
      setErro("Informe a sua senha de acesso.");
      return;
    }

    // Validação de senha: se o usuário possui senha configurada, verifica a correspondência
    if (usuarioSelecionado.senha && usuarioSelecionado.senha.trim() !== senha.trim()) {
      setErro("Senha incorreta para este usuário. Verifique com o administrador.");
      return;
    }

    const usuarioAtualizado: UsuarioAuditor = {
      ...usuarioSelecionado,
      conectadoEm: new Date().toLocaleString("pt-BR"),
    };

    salvarUsuario(usuarioAtualizado);
    onLoginSuccess(usuarioAtualizado);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 selection:bg-sky-500 selection:text-white">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900/90 p-2 shadow-2xl shadow-sky-950/60 mb-3 border border-slate-700/80">
            <img
              src="/icon-192.png"
              alt="VistorIA SST"
              className="w-full h-full object-contain rounded-2xl drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            VistorIA <span className="text-sky-400 font-extrabold">SST</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plataforma Pericial de Auditoria, Gestão &amp; Laudos NR 28
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60">
          <div className="mb-5 pb-3 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Acesso ao Sistema</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecione seu usuário e digite sua senha de acesso.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
              Sessão Técnica
            </span>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. SEÇÃO DE SELEÇÃO DO USUÁRIO */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>Selecione o Usuário:</span>
                <span className="text-[10px] text-slate-500">
                  {usuariosCadastrados.length} cadastrados
                </span>
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {usuariosCadastrados.map((usr) => {
                  const isSelected = usuarioSelecionado?.id === usr.id;
                  const isAdmin = usr.perfil === "admin";

                  return (
                    <button
                      key={usr.id}
                      type="button"
                      id={`btn-selecionar-usuario-${usr.id}`}
                      onClick={() => handleSelecionarUsuario(usr.id)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/50"
                          : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                            isAdmin
                              ? "bg-indigo-600 text-white"
                              : "bg-sky-600 text-white"
                          }`}
                        >
                          {usr.nome.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span
                            className={`block text-xs font-bold truncate ${
                              isSelected ? "text-white" : "text-slate-300"
                            }`}
                          >
                            {usr.nome}
                          </span>
                          <span className="block text-[10px] text-slate-400 truncate">
                            {usr.cargo} • {usr.registro}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                            isAdmin
                              ? "bg-indigo-950 text-indigo-300 border-indigo-700"
                              : "bg-sky-950 text-sky-300 border-sky-700"
                          }`}
                        >
                          {isAdmin ? "ADM" : "INSPETOR"}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONFIRMAÇÃO VISUAL DO USUÁRIO SELECIONADO */}
            {usuarioSelecionado && (
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  {usuarioSelecionado.perfil === "admin" ? (
                    <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )}
                  <span className="text-[11px] text-slate-300 truncate">
                    Entrando como: <strong className="text-white">{usuarioSelecionado.nome}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {usuarioSelecionado.perfil === "admin" ? "Acesso Total" : "Acesso Vistorias"}
                </span>
              </div>
            )}

            {/* 2. LOCAL DE DIGITAR A SENHA */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Senha de Acesso</span>
                {usuarioSelecionado && (
                  <span className="text-[10px] text-slate-500">
                    {usuarioSelecionado.perfil === "admin" ? "Senha: admin" : "Senha: 123"}
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  id="input-login-senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha de acesso"
                  className="w-full h-11 pl-9 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                  tabIndex={-1}
                  title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* BOTÃO DE ENTRAR */}
            <button
              type="submit"
              id="btn-entrar-login"
              className="w-full h-11 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition-all cursor-pointer mt-3"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-5">
          Em conformidade com a NR 01, NR 28 e Portarias do Ministério do Trabalho e Emprego.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
