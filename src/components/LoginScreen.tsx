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
  Fingerprint,
  ScanFace,
  Sparkles,
  Smartphone,
  Trash2,
} from "lucide-react";
import { UsuarioAuditor } from "../types";
import { getUsuarios, salvarUsuario } from "../utils/storage";
import {
  isBiometriaHabilitada,
  autenticarComBiometria,
  registrarBiometria,
  desativarBiometria,
  getBiometriaRegistro,
  BiometriaRegistro,
} from "../utils/biometrics";

interface LoginScreenProps {
  onLoginSuccess: (usuario: UsuarioAuditor) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<UsuarioAuditor[]>([]);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState<string>("usr-admin-raul");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estados de autenticação biométrica
  const [biometriaHabilitada, setBiometriaHabilitada] = useState<boolean>(false);
  const [registroBiometria, setRegistroBiometria] = useState<BiometriaRegistro | null>(null);
  const [ativarBiometriaNoLogin, setAtivarBiometriaNoLogin] = useState<boolean>(true);
  const [mostrarOpcaoSenha, setMostrarOpcaoSenha] = useState<boolean>(false);
  const [autenticandoBiometria, setAutenticandoBiometria] = useState<boolean>(false);
  const [sucessoBiometria, setSucessoBiometria] = useState<boolean>(false);

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

  // Atualiza status da biometria sempre que o usuário selecionado mudar
  useEffect(() => {
    if (usuarioSelecionado) {
      const ativa = isBiometriaHabilitada(usuarioSelecionado.id);
      setBiometriaHabilitada(ativa);
      setRegistroBiometria(getBiometriaRegistro(usuarioSelecionado.id));
      setMostrarOpcaoSenha(!ativa);
      setErro(null);
      setSucessoBiometria(false);
    }
  }, [usuarioSelecionado?.id]);

  const handleSelecionarUsuario = (id: string) => {
    setUsuarioSelecionadoId(id);
    setErro(null);
    setSenha("");
    setSucessoBiometria(false);
  };

  // Login por Biometria (Face ID / Impressão Digital)
  const handleLoginBiometria = async () => {
    if (!usuarioSelecionado) return;
    setErro(null);
    setAutenticandoBiometria(true);

    try {
      const resultado = await autenticarComBiometria(usuarioSelecionado);
      if (resultado.sucesso) {
        setSucessoBiometria(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([40, 30, 40]);
        }

        setTimeout(() => {
          const usuarioAtualizado: UsuarioAuditor = {
            ...usuarioSelecionado,
            conectadoEm: new Date().toLocaleString("pt-BR"),
          };
          salvarUsuario(usuarioAtualizado);
          onLoginSuccess(usuarioAtualizado);
        }, 600);
      } else {
        setErro(resultado.mensagem || "Não foi possível validar a biometria. Digite sua senha.");
        setMostrarOpcaoSenha(true);
      }
    } catch (err: any) {
      setErro("Falha na leitura biométrica. Por favor, utilize sua senha.");
      setMostrarOpcaoSenha(true);
    } finally {
      setAutenticandoBiometria(false);
    }
  };

  // Desativação da biometria no aparelho
  const handleDesativarBiometria = () => {
    if (!usuarioSelecionado) return;
    desativarBiometria(usuarioSelecionado.id);
    setBiometriaHabilitada(false);
    setRegistroBiometria(null);
    setMostrarOpcaoSenha(true);
  };

  // Login tradicional por Senha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSelecionado) {
      setErro("Selecione um usuário para continuar.");
      return;
    }

    if (!senha.trim()) {
      setErro("Informe a sua senha de acesso.");
      return;
    }

    // Validação de senha
    if (usuarioSelecionado.senha && usuarioSelecionado.senha.trim() !== senha.trim()) {
      setErro("Senha incorreta para este usuário. Verifique com o administrador.");
      return;
    }

    // Se o usuário optou por ativar a biometria após este login
    if (ativarBiometriaNoLogin && !biometriaHabilitada) {
      try {
        await registrarBiometria(usuarioSelecionado);
      } catch (e) {
        console.warn("Aviso no registro biométrico:", e);
      }
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
                {biometriaHabilitada
                  ? "Entre rapidamente com Face ID / Digital ou senha."
                  : "Selecione seu usuário e digite sua senha de acesso."}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
              Sessão Técnica
            </span>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <KeyRound className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* 1. SEÇÃO DE SELEÇÃO DO USUÁRIO */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>Selecione o Usuário:</span>
                <span className="text-[10px] text-slate-500">
                  {usuariosCadastrados.length} cadastrados
                </span>
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {usuariosCadastrados.map((usr) => {
                  const isSelected = usuarioSelecionado?.id === usr.id;
                  const isAdmin = usr.perfil === "admin";
                  const usrTemBiometria = isBiometriaHabilitada(usr.id);

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
                            className={`block text-xs font-bold truncate flex items-center gap-1.5 ${
                              isSelected ? "text-white" : "text-slate-300"
                            }`}
                          >
                            <span>{usr.nome}</span>
                            {usrTemBiometria && (
                              <span
                                title="Biometria ativa neste dispositivo"
                                className="inline-flex items-center text-sky-400"
                              >
                                <Fingerprint className="w-3 h-3" />
                              </span>
                            )}
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
                <div className="flex items-center gap-1.5 shrink-0">
                  {biometriaHabilitada && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">
                      <Fingerprint className="w-3 h-3 text-sky-400" />
                      Biometria
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {usuarioSelecionado.perfil === "admin" ? "Acesso Total" : "Acesso Vistorias"}
                  </span>
                </div>
              </div>
            )}

            {/* 2. ÁREA DE AUTENTICAÇÃO BIOMÉTRICA (SE HABILITADA NESTE DISPOSITIVO) */}
            {biometriaHabilitada && (
              <div className="p-4 bg-gradient-to-b from-sky-950/40 via-slate-900 to-slate-950 border border-sky-500/30 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all cursor-pointer ${
                      sucessoBiometria
                        ? "bg-emerald-500/20 ring-4 ring-emerald-400 border border-emerald-500"
                        : autenticandoBiometria
                        ? "bg-sky-500/20 ring-4 ring-sky-400 animate-pulse border border-sky-500"
                        : "bg-slate-800 border border-slate-700 hover:border-sky-400 hover:scale-105 active:scale-95"
                    }`}
                    onClick={!autenticandoBiometria && !sucessoBiometria ? handleLoginBiometria : undefined}
                    title="Clique para autenticar com Face ID / Impressão Digital"
                  >
                    {sucessoBiometria ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in" />
                    ) : autenticandoBiometria ? (
                      <ScanFace className="w-8 h-8 text-sky-400 animate-spin" />
                    ) : (
                      <Fingerprint className="w-8 h-8 text-sky-400" />
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                    {sucessoBiometria ? (
                      <span className="text-emerald-400">Biometria Confirmada!</span>
                    ) : (
                      <>
                        <ScanFace className="w-4 h-4 text-sky-400" />
                        <span>Entrar com Biometria</span>
                      </>
                    )}
                  </h3>

                  <p className="text-[11px] text-slate-400 max-w-xs mb-3">
                    {sucessoBiometria
                      ? "Identidade autenticada com sucesso. Redirecionando..."
                      : "Utilize o sensor biométrico (Face ID ou Impressão Digital) do seu aparelho."}
                  </p>

                  <button
                    type="button"
                    id="btn-login-biometria"
                    onClick={handleLoginBiometria}
                    disabled={autenticandoBiometria || sucessoBiometria}
                    className="w-full h-11 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950/80 transition-all cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>
                      {autenticandoBiometria
                        ? "Validando Biometria..."
                        : sucessoBiometria
                        ? "Acesso Liberado!"
                        : "Autenticar com Face ID / Digital"}
                    </span>
                  </button>
                </div>

                {/* Opções auxiliares para biometria */}
                <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    id="btn-alternar-senha"
                    onClick={() => setMostrarOpcaoSenha(!mostrarOpcaoSenha)}
                    className="text-slate-400 hover:text-sky-400 text-[11px] font-semibold underline underline-offset-4 cursor-pointer"
                  >
                    {mostrarOpcaoSenha ? "Ocultar senha manual" : "Ou digitar senha manual"}
                  </button>

                  <button
                    type="button"
                    id="btn-remover-biometria"
                    onClick={handleDesativarBiometria}
                    className="text-slate-500 hover:text-rose-400 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Desativar autenticação biométrica para este usuário neste aparelho"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Desativar biometria</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. LOCAL DE DIGITAR A SENHA (QUANDO NÃO HOUVER BIOMETRIA OU QUANDO SOLICITADO) */}
            {(!biometriaHabilitada || mostrarOpcaoSenha) && (
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="input-login-senha">
                    Senha de Acesso
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
                      autoFocus={!biometriaHabilitada}
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

                {/* Opção para ativar biometria nos próximos acessos se ainda não estiver ativa */}
                {!biometriaHabilitada && (
                  <label className="flex items-start gap-2 text-xs text-slate-300 mt-2 select-none cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      id="chk-ativar-biometria"
                      checked={ativarBiometriaNoLogin}
                      onChange={(e) => setAtivarBiometriaNoLogin(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                        <Fingerprint className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Ativar biometria (Face ID / Digital) neste aparelho</span>
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Após este primeiro acesso, você poderá entrar instantaneamente sem digitar senha.
                      </span>
                    </div>
                  </label>
                )}

                {/* BOTÃO DE ENTRAR COM SENHA */}
                <button
                  type="submit"
                  id="btn-entrar-login"
                  className="w-full h-11 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition-all cursor-pointer mt-2"
                >
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
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

