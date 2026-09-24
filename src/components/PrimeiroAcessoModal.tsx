import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
  User,
  FileBadge,
} from "lucide-react";
import { UsuarioAuditor } from "../types";
import { salvarUsuario, salvarUsuarioAutenticado } from "../utils/storage";

interface PrimeiroAcessoModalProps {
  usuario: UsuarioAuditor;
  onSenhaAlterada: (usuarioAtualizado: UsuarioAuditor) => void;
  onLogout: () => void;
}

export const PrimeiroAcessoModal: React.FC<PrimeiroAcessoModalProps> = ({
  usuario,
  onSenhaAlterada,
  onLogout,
}) => {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [novoRegistro, setNovoRegistro] = useState(usuario.registro || "");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    // Validações
    if (usuario.senha && usuario.senha !== "••••••••" && senhaAtual.trim() !== usuario.senha.trim()) {
      setErro("A senha temporária atual informada não confere.");
      return;
    }

    if (novaSenha.trim().length < 6) {
      setErro("A nova senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErro("A confirmação não coincide com a nova senha digitada.");
      return;
    }

    if (usuario.senha && novaSenha.trim() === usuario.senha.trim()) {
      setErro("A nova senha deve ser diferente da senha temporária básica.");
      return;
    }

    // Atualiza usuário
    const usuarioAtualizado: UsuarioAuditor = {
      ...usuario,
      senha: novaSenha.trim(),
      registro: novoRegistro.trim() ? novoRegistro.trim() : usuario.registro,
      primeiroAcesso: false,
    };

    salvarUsuario(usuarioAtualizado);
    salvarUsuarioAutenticado(usuarioAtualizado);
    setSucesso(true);

    setTimeout(() => {
      onSenhaAlterada(usuarioAtualizado);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              1º Acesso Obrigatório
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Definição de Senha Pessoal
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Olá, <span className="font-bold text-white">{usuario.nome}</span>. Para garantir a integridade jurídica dos laudos técnicos e assinaturas periciais, você deve substituir a senha temporária por uma senha pessoal definitiva.
          </p>

          {/* User Badge Info */}
          <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              <div className="text-xs">
                <span className="font-bold text-white block">{usuario.email}</span>
                <span className="text-[10px] text-slate-400">{usuario.cargo} • {usuario.registro}</span>
              </div>
            </div>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
              usuario.perfil === "admin" ? "bg-indigo-900 text-indigo-200" : "bg-sky-900 text-sky-200"
            }`}>
              {usuario.perfil === "admin" ? "ADM" : "INSPETOR"}
            </span>
          </div>

          {erro && (
            <div className="mt-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso ? (
            <div className="mt-6 p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-emerald-200">Senha Alterada com Sucesso!</h4>
              <p className="text-xs text-emerald-400/80 mt-1">
                Acesso liberado. Redirecionando para o painel de vistorias...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {/* Senha Temporária / Atual */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha Temporária Recebida
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarSenhas ? "text" : "password"}
                    id="input-primeiro-senha-atual"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite a senha temporária básica"
                    className="w-full h-10 pl-9 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nova Senha Definitiva (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarSenhas ? "text" : "password"}
                    id="input-primeiro-nova-senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Crie sua nova senha segura"
                    className="w-full h-10 pl-9 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarSenhas ? "text" : "password"}
                    id="input-primeiro-confirma-senha"
                    value={confirmaSenha}
                    onChange={(e) => setConfirmaSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full h-10 pl-9 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Registro Profissional (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Nº de Registro Profissional (MTE, CREA ou CRM)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Opcional</span>
                </label>
                <div className="relative">
                  <FileBadge className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-primeiro-registro-profissional"
                    value={novoRegistro}
                    onChange={(e) => setNovoRegistro(e.target.value)}
                    placeholder="Ex: CREA 123456/D-SP ou MTE 000123"
                    className="w-full h-10 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Atualize seu número oficial para constar nos laudos e relatórios de vistoria.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setMostrarSenhas(!mostrarSenhas)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {mostrarSenhas ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{mostrarSenhas ? "Ocultar senhas" : "Ver senhas digitadas"}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="submit"
                  id="btn-salvar-nova-senha-primeiro-acesso"
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cadastrar Nova Senha &amp; Acessar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Voltar / Trocar de Usuário</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
