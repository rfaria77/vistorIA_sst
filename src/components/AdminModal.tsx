import React, { useState } from "react";
import {
  Building2,
  Image as ImageIcon,
  History,
  Info,
  Trash2,
  Upload,
  Download,
  Send,
  PlusCircle,
  CheckCircle2,
  X,
  FileText,
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  Edit2,
  Lock,
  Mail,
  Award,
  KeyRound,
  Copy,
  MailCheck,
  AlertCircle,
  Search,
  Loader2,
  Sparkles,
  RotateCcw,
  Clock,
  Activity,
} from "lucide-react";
import { Empresa, FaixaFuncionarios, LaudoEmitido, PerfilUsuario, ProgramacaoRelatorio, RascunhoVistoria, TipoInscricao, UsuarioAuditor } from "../types";
import { FAIXAS_FUNCIONARIOS, formatarBRL } from "../data/nr28Data";
import { LISTA_CNAE_NR04, buscarCNAEPorCodigoOuDescricao } from "../data/cnaeData";
import { CnaeSelector } from "./CnaeSelector";
import { gerarLinkWhatsApp, gerarLinkEmailBoasVindas } from "../utils/storage";
import {
  consultarCNPJ,
  formatarCNPJ,
  formatarCAEPF,
  formatarCEI,
  formatarDocumentoInscricao,
} from "../utils/cnpjLookup";
import {
  exportarBackupJson,
  exportarEmpresasCsv,
  exportarRascunhosCsv,
  exportarLaudosCsv,
} from "../utils/exportUtils";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresas: Empresa[];
  onSalvarEmpresa: (empresa: Omit<Empresa, "id">) => void;
  logoConsultoria: string | null;
  onSalvarLogo: (base64: string) => void;
  onRemoverLogo: () => void;
  laudos: LaudoEmitido[];
  onExcluirLaudo?: (id: string) => void;
  usuarios: UsuarioAuditor[];
  onSalvarUsuario: (usuario: Omit<UsuarioAuditor, "id"> & { id?: string }) => void;
  onExcluirUsuario: (id: string) => void;
  usuarioLogado?: UsuarioAuditor | null;
  onLimparDadosDeTeste?: () => Promise<void> | void;
  rascunhos?: RascunhoVistoria[];
  programacoes?: ProgramacaoRelatorio[];
}

interface CredenciaisModalState {
  nome: string;
  email: string;
  senhaTemp: string;
  perfil: PerfilUsuario;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  empresas,
  onSalvarEmpresa,
  logoConsultoria,
  onSalvarLogo,
  onRemoverLogo,
  laudos,
  onExcluirLaudo,
  usuarios,
  onSalvarUsuario,
  onExcluirUsuario,
  usuarioLogado,
  onLimparDadosDeTeste,
  rascunhos = [],
  programacoes = [],
}) => {
  const [activeTab, setActiveTab] = useState<"usuarios" | "empresas" | "identidade" | "historico" | "norma" | "backup">("usuarios");

  // Empresa form state
  const [tipoInscricaoEmpresa, setTipoInscricaoEmpresa] = useState<TipoInscricao>("CNPJ");
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [faixa, setFaixa] = useState<FaixaFuncionarios>("26 a 50");
  const [wpp, setWpp] = useState("");
  const [cnae, setCnae] = useState("41.20-4");
  const [cnaeDescricao, setCnaeDescricao] = useState("");
  const [cnaesSecundariosAdmin, setCnaesSecundariosAdmin] = useState<{ codigo: string; descricao: string }[]>([]);
  const [grauRisco, setGrauRisco] = useState<1 | 2 | 3 | 4>(3);
  const [buscandoCnpjAdmin, setBuscandoCnpjAdmin] = useState(false);
  const [msgCnpjAdmin, setMsgCnpjAdmin] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  const handleBuscarCnpjAdmin = async (cnpjParaBuscar?: string) => {
    const valor = (cnpjParaBuscar !== undefined ? cnpjParaBuscar : cnpj).replace(/\D/g, "");
    if (valor.length !== 14) {
      setMsgCnpjAdmin({ tipo: "erro", texto: "Digite os 14 dígitos do CNPJ para buscar os dados." });
      return;
    }

    try {
      setBuscandoCnpjAdmin(true);
      setMsgCnpjAdmin(null);
      const dados = await consultarCNPJ(valor);

      setCnpj(dados.cnpjFormatado);
      if (dados.razaoSocial) setNome(dados.razaoSocial);
      if (dados.cnaeCodigo) setCnae(dados.cnaeCodigo);
      if (dados.cnaeDescricao) setCnaeDescricao(dados.cnaeDescricao);
      if (dados.grauRisco) setGrauRisco(dados.grauRisco);
      if (dados.cnaesSecundarios) setCnaesSecundariosAdmin(dados.cnaesSecundarios);
      if (dados.telefone && !wpp) setWpp(dados.telefone);

      setMsgCnpjAdmin({
        tipo: "sucesso",
        texto: `✓ CNPJ localizado: ${dados.razaoSocial} | CNAE ${dados.cnaeCodigo} (Grau de Risco ${dados.grauRisco})`,
      });
    } catch (err: any) {
      setMsgCnpjAdmin({
        tipo: "erro",
        texto: err?.message || "Erro ao consultar CNPJ na base pública.",
      });
    } finally {
      setBuscandoCnpjAdmin(false);
    }
  };

  const handleCnpjAdminChange = (val: string) => {
    const formatado = formatarDocumentoInscricao(val, tipoInscricaoEmpresa);
    setCnpj(formatado);
    setMsgCnpjAdmin(null);

    const digitos = val.replace(/\D/g, "");
    if (tipoInscricaoEmpresa === "CNPJ" && digitos.length === 14) {
      handleBuscarCnpjAdmin(digitos);
    }
  };

  // Usuário form state
  const [userEditandoId, setUserEditandoId] = useState<string | null>(null);
  const [userNome, setUserNome] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRegistro, setUserRegistro] = useState("");
  const [userCargo, setUserCargo] = useState("Engenheiro de Segurança do Trabalho");
  const [userPerfil, setUserPerfil] = useState<PerfilUsuario>("inspetor");
  const [userSenha, setUserSenha] = useState("");
  const [userPrimeiroAcesso, setUserPrimeiroAcesso] = useState(true);
  const [enviarEmailAoSalvar, setEnviarEmailAoSalvar] = useState(true);

  const [credenciaisModal, setCredenciaisModal] = useState<CredenciaisModalState | null>(null);
  const [subTabHistorico, setSubTabHistorico] = useState<"atividades" | "laudos">("atividades");

  const [msgSucesso, setMsgSucesso] = useState<string | null>(null);
  const [msgErro, setMsgErro] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCadastrarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onSalvarEmpresa({
      nome: nome.trim(),
      cnpj: cnpj.trim() || "00.000.000/0001-00",
      tipoInscricao: tipoInscricaoEmpresa,
      faixaFuncionarios: faixa,
      contatoWpp: wpp.trim() || "34999990000",
      cnae,
      cnaeDescricao: cnaeDescricao || undefined,
      grauRisco,
    });

    setNome("");
    setCnpj("");
    setWpp("");
    setCnae("41.20-4");
    setCnaeDescricao("");
    setCnaesSecundariosAdmin([]);
    setTipoInscricaoEmpresa("CNPJ");
    setMsgCnpjAdmin(null);
    setMsgSucesso("Empresa cadastrada com sucesso!");
    setTimeout(() => setMsgSucesso(null), 3000);
  };

  const handleCadastrarOuEditarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNome.trim()) {
      setMsgErro("Informe o nome completo do usuário.");
      setTimeout(() => setMsgErro(null), 3000);
      return;
    }
    if (!userEmail.trim() || !userEmail.includes("@")) {
      setMsgErro("Informe um e-mail válido.");
      setTimeout(() => setMsgErro(null), 3000);
      return;
    }
    if (!userRegistro.trim()) {
      setMsgErro("Informe o registro profissional (CREA, CRM ou MTE).");
      setTimeout(() => setMsgErro(null), 3000);
      return;
    }

    // Se senha vazia, gera automática
    const senhaFinal = userSenha.trim() || `SST-${Math.floor(1000 + Math.random() * 9000)}`;

    onSalvarUsuario({
      id: userEditandoId || undefined,
      nome: userNome.trim(),
      email: userEmail.trim(),
      registro: userRegistro.trim(),
      cargo: userCargo,
      perfil: userPerfil,
      senha: senhaFinal,
      primeiroAcesso: userPrimeiroAcesso,
      ativo: true,
    });

    // Se for novo cadastro ou o admin optou por enviar email, abre modal com credenciais
    if (!userEditandoId || userPrimeiroAcesso) {
      setCredenciaisModal({
        nome: userNome.trim(),
        email: userEmail.trim(),
        senhaTemp: senhaFinal,
        perfil: userPerfil,
      });
    }

    // Reset user form
    setUserEditandoId(null);
    setUserNome("");
    setUserEmail("");
    setUserRegistro("");
    setUserCargo("Engenheiro de Segurança do Trabalho");
    setUserPerfil("inspetor");
    setUserSenha("");
    setUserPrimeiroAcesso(true);
    setMsgSucesso(userEditandoId ? "Usuário atualizado com sucesso!" : "Novo usuário cadastrado com sucesso!");
    setTimeout(() => setMsgSucesso(null), 3000);
  };

  const handleIniciarEdicaoUsuario = (u: UsuarioAuditor) => {
    setUserEditandoId(u.id);
    setUserNome(u.nome);
    setUserEmail(u.email);
    setUserRegistro(u.registro);
    setUserCargo(u.cargo);
    setUserPerfil(u.perfil || "inspetor");
    setUserSenha(u.senha || "");
    setUserPrimeiroAcesso(u.primeiroAcesso ?? false);
  };

  const handleCancelarEdicaoUsuario = () => {
    setUserEditandoId(null);
    setUserNome("");
    setUserEmail("");
    setUserRegistro("");
    setUserCargo("Engenheiro de Segurança do Trabalho");
    setUserPerfil("inspetor");
    setUserSenha("");
    setUserPrimeiroAcesso(true);
  };

  const handleResetarSenhaUsuario = (u: UsuarioAuditor) => {
    const novaSenhaTemp = `SST-${Math.floor(1000 + Math.random() * 9000)}`;
    onSalvarUsuario({
      ...u,
      senha: novaSenhaTemp,
      primeiroAcesso: true,
    });

    setCredenciaisModal({
      nome: u.nome,
      email: u.email,
      senhaTemp: novaSenhaTemp,
      perfil: u.perfil,
    });

    setMsgSucesso(`Senha de "${u.nome}" resetada com sucesso! Envie o e-mail de acesso.`);
    setTimeout(() => setMsgSucesso(null), 3500);
  };

  const handleExcluirUsuario = (id: string, nomeUsr: string) => {
    if (usuarioLogado && usuarioLogado.id === id) {
      alert("Você não pode excluir o seu próprio usuário conectado.");
      return;
    }
    if (window.confirm(`Deseja realmente remover o usuário "${nomeUsr}"?`)) {
      onExcluirUsuario(id);
      setMsgSucesso("Usuário removido com sucesso!");
      setTimeout(() => setMsgSucesso(null), 3000);
    }
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onSalvarLogo(event.target.result as string);
        setMsgSucesso("Logomarca da consultoria salva!");
        setTimeout(() => setMsgSucesso(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Painel de Gestão &amp; Governança</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Exclusivo ADM
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Gerenciamento corporativo de usuários, empresas, laudos e identidade visual
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-fechar-admin"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - Estilo Pill Bar com shrink-0 e sem sobreposição de barra de rolagem */}
        <div className="shrink-0 p-2 sm:p-2.5 bg-slate-100/90 border-b border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              type="button"
              id="tab-admin-usuarios"
              onClick={() => setActiveTab("usuarios")}
              className={`shrink-0 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "usuarios"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>1. Usuários &amp; Perfis</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === "usuarios" ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {usuarios.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-admin-empresas"
              onClick={() => setActiveTab("empresas")}
              className={`shrink-0 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "empresas"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>2. Empresas &amp; Clientes</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === "empresas" ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-700"
                }`}
              >
                {empresas.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-admin-identidade"
              onClick={() => setActiveTab("identidade")}
              className={`shrink-0 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "identidade"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>3. Logomarca do Laudo</span>
            </button>

            <button
              type="button"
              id="tab-admin-historico"
              onClick={() => setActiveTab("historico")}
              className={`shrink-0 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "historico"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <History className="w-4 h-4 text-amber-600" />
              <span>4. Histórico ({laudos.length})</span>
            </button>

            <button
              type="button"
              id="tab-admin-norma"
              onClick={() => setActiveTab("norma")}
              className={`shrink-0 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "norma"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Info className="w-4 h-4 text-purple-600" />
              <span>5. Regras NR 28</span>
            </button>

            <button
              type="button"
              id="tab-admin-backup"
              onClick={() => setActiveTab("backup")}
              className={`shrink-0 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "backup"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Download className="w-4 h-4 text-rose-600" />
              <span>6. Backup &amp; Exportação (JSON/CSV)</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Feedbacks */}
          {msgSucesso && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{msgSucesso}</span>
            </div>
          )}

          {msgErro && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{msgErro}</span>
            </div>
          )}

          {/* TAB 1: GESTÃO DE USUÁRIOS & PERFIS (ADM VS INSPETOR) */}
          {activeTab === "usuarios" && (
            <div className="space-y-6">
              {/* Form de Cadastro / Edição de Usuário */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>{userEditandoId ? "Editar Cadastro de Usuário" : "Cadastrar Novo Usuário"}</span>
                  </h3>
                  {userEditandoId && (
                    <button
                      type="button"
                      onClick={handleCancelarEdicaoUsuario}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <form onSubmit={handleCadastrarOuEditarUsuario} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nome Completo do Profissional *
                      </label>
                      <input
                        type="text"
                        id="input-user-nome"
                        value={userNome}
                        onChange={(e) => setUserNome(e.target.value)}
                        placeholder="Ex: Dra. Camila Siqueira"
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>

                    {/* E-mail */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        E-mail de Login *
                      </label>
                      <input
                        type="email"
                        id="input-user-email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="camila@sst.com.br"
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>

                    {/* Registro Profissional */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Registro Profissional (CREA / CRM / MTE) *
                      </label>
                      <input
                        type="text"
                        id="input-user-registro"
                        value={userRegistro}
                        onChange={(e) => setUserRegistro(e.target.value)}
                        placeholder="Ex: CRM/SP 987654 - Médica do Trabalho"
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>

                    {/* Cargo */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Cargo / Qualificação
                      </label>
                      <select
                        id="select-user-cargo"
                        value={userCargo}
                        onChange={(e) => setUserCargo(e.target.value)}
                        className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Engenheiro de Segurança do Trabalho">
                          Engenheiro(a) de Segurança do Trabalho
                        </option>
                        <option value="Técnica em Segurança do Trabalho">
                          Técnico(a) em Segurança do Trabalho
                        </option>
                        <option value="Médico do Trabalho">Médico(a) do Trabalho</option>
                        <option value="Perito Judicial do Trabalho">Perito(a) Judicial do Trabalho</option>
                        <option value="Auditor Fiscal do Trabalho">Auditor(a) de Conformidade SST</option>
                      </select>
                    </div>
                  </div>

                  {/* Seleção de Perfil (ADM vs INSPETOR) */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-800 mb-1.5">
                      Perfil de Acesso ao Sistema *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Opção ADM */}
                      <label
                        className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                          userPerfil === "admin"
                            ? "bg-indigo-50 border-indigo-600 text-indigo-950"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="perfilUsuario"
                          value="admin"
                          checked={userPerfil === "admin"}
                          onChange={() => setUserPerfil("admin")}
                          className="mt-1 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="block text-xs font-black flex items-center gap-1.5 text-indigo-900">
                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                            Administrador (Acesso Total)
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Tem acesso à tela de <b>Gestão ADM</b>, cadastra empresas, cadastra e gerencia usuários, altera logomarca e visualiza todos os laudos.
                          </span>
                        </div>
                      </label>

                      {/* Opção Inspetor */}
                      <label
                        className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                          userPerfil === "inspetor"
                            ? "bg-sky-50 border-sky-600 text-sky-950"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="perfilUsuario"
                          value="inspetor"
                          checked={userPerfil === "inspetor"}
                          onChange={() => setUserPerfil("inspetor")}
                          className="mt-1 text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <span className="block text-xs font-black flex items-center gap-1.5 text-sky-900">
                            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                            Inspetor (Auditor de Campo)
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Realiza inspeções de campo, aponta itens das NRs, coleta fotos e assina laudos. <b>Sem acesso à tela de Gestão ADM</b>.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Senha Básica e Configurações de Primeiro Acesso */}
                  <div className="pt-2 p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Senha Básica Inicial / Temporária</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setUserSenha(`SST-${Math.floor(1000 + Math.random() * 9000)}`)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Gerar Senha Básica Automática</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        id="input-user-senha"
                        value={userSenha}
                        onChange={(e) => setUserSenha(e.target.value)}
                        placeholder="Ex: SST-2026 (ou clique em Gerar Senha Básica)"
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono font-semibold focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={userPrimeiroAcesso}
                          onChange={(e) => setUserPrimeiroAcesso(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                          <b>Exigir troca obrigatória de senha no 1º acesso</b> (bloqueia o uso até a nova senha ser cadastrada)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={enviarEmailAoSalvar}
                          onChange={(e) => setEnviarEmailAoSalvar(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                          Abrir tela para <b>enviar as credenciais por e-mail</b> imediatamente após salvar
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      id="btn-salvar-usuario"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{userEditandoId ? "Atualizar Usuário" : "Cadastrar & Gerar Acesso"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Usuários Cadastrados */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
                  <span>Usuários Ativos no Sistema ({usuarios.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Somente administradores podem gerenciar estas contas
                  </span>
                </h4>

                <div className="space-y-2">
                  {usuarios.map((u) => {
                    const isAdmin = u.perfil === "admin";
                    const isSelf = Boolean(usuarioLogado && usuarioLogado.id === u.id);
                    const temPrimeiroAcesso = Boolean(u.primeiroAcesso);

                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                          isAdmin
                            ? "bg-indigo-50/40 border-indigo-200/80"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                              isAdmin
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-sky-600 text-white shadow-xs"
                            }`}
                          >
                            {u.nome.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">
                                {u.nome}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  VOCÊ (SESSÃO ATUAL)
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                  isAdmin
                                    ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                                    : "bg-sky-100 text-sky-800 border-sky-300"
                                }`}
                              >
                                {isAdmin ? "ADMINISTRADOR" : "INSPETOR"}
                              </span>

                              {temPrimeiroAcesso && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                                  1º ACESSO PENDENTE
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {u.cargo} • <span className="font-mono text-slate-700">{u.registro}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{u.email}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {/* Resetar Senha / Enviar Acesso */}
                          <button
                            type="button"
                            id={`btn-reset-user-${u.id}`}
                            onClick={() => handleResetarSenhaUsuario(u)}
                            className="p-1.5 text-amber-800 hover:bg-amber-100/70 bg-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-300 cursor-pointer"
                            title="Gerar nova senha básica e reenviar credenciais por e-mail"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[11px]">Enviar Acesso</span>
                          </button>

                          <button
                            type="button"
                            id={`btn-editar-user-${u.id}`}
                            onClick={() => handleIniciarEdicaoUsuario(u)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
                            title="Editar usuário"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Editar</span>
                          </button>

                          <button
                            type="button"
                            id={`btn-excluir-user-${u.id}`}
                            onClick={() => handleExcluirUsuario(u.id, u.nome)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                              isSelf
                                ? "text-slate-300 border-slate-200 cursor-not-allowed"
                                : "text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300 cursor-pointer"
                            }`}
                            title={isSelf ? "Não é possível excluir o usuário em uso" : "Excluir usuário"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Excluir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMPRESAS CLIENTES */}
          {activeTab === "empresas" && (
            <div className="space-y-4">
              <form onSubmit={handleCadastrarEmpresa} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-indigo-600" />
                    <span>Cadastrar Empresa / Produtor para Vistorias Rápidas</span>
                  </h3>

                  {/* Seletor de Tipo de Documento */}
                  <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg border border-slate-300">
                    <button
                      type="button"
                      id="btn-admin-tipo-cnpj"
                      onClick={() => {
                        setTipoInscricaoEmpresa("CNPJ");
                        setMsgCnpjAdmin(null);
                        if (cnpj) setCnpj(formatarDocumentoInscricao(cnpj, "CNPJ"));
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        tipoInscricaoEmpresa === "CNPJ"
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🏢 CNPJ
                    </button>
                    <button
                      type="button"
                      id="btn-admin-tipo-caepf"
                      onClick={() => {
                        setTipoInscricaoEmpresa("CAEPF");
                        setMsgCnpjAdmin(null);
                        if (cnpj) setCnpj(formatarDocumentoInscricao(cnpj, "CAEPF"));
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        tipoInscricaoEmpresa === "CAEPF"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🌾 CAEPF (Rural / PF)
                    </button>
                    <button
                      type="button"
                      id="btn-admin-tipo-cei"
                      onClick={() => {
                        setTipoInscricaoEmpresa("CEI/CNO");
                        setMsgCnpjAdmin(null);
                        if (cnpj) setCnpj(formatarDocumentoInscricao(cnpj, "CEI/CNO"));
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        tipoInscricaoEmpresa === "CEI/CNO"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🏗️ CEI / CNO
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Campo de Documento de Inscrição */}
                  <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {tipoInscricaoEmpresa === "CAEPF"
                            ? "Número do CAEPF (14 dígitos - Produtor Rural / PF)"
                            : tipoInscricaoEmpresa === "CEI/CNO"
                            ? "Matrícula CEI / CNO (12 dígitos - Obras)"
                            : "CNPJ da Empresa (Consulta Automática Receita Federal)"}
                        </span>
                      </label>
                      {tipoInscricaoEmpresa === "CNPJ" && (
                        <span className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" /> Consulta Receita Federal
                        </span>
                      )}
                      {tipoInscricaoEmpresa === "CAEPF" && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          Produtor Rural / PF
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        id="admin-input-cnpj"
                        value={cnpj}
                        onChange={(e) => handleCnpjAdminChange(e.target.value)}
                        placeholder={
                          tipoInscricaoEmpresa === "CAEPF"
                            ? "000.000.000/000-00"
                            : tipoInscricaoEmpresa === "CEI/CNO"
                            ? "00.000.00000/00"
                            : "00.000.000/0001-00 (Digite ou cole o CNPJ)"
                        }
                        className="flex-1 h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium tracking-wide shadow-2xs"
                      />
                      {tipoInscricaoEmpresa === "CNPJ" && (
                        <button
                          type="button"
                          id="btn-admin-buscar-cnpj"
                          onClick={() => handleBuscarCnpjAdmin()}
                          disabled={buscandoCnpjAdmin}
                          className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60 shrink-0"
                          title="Puxar Razão Social, CNAE, Grau de Risco e Telefone da Receita Federal"
                        >
                          {buscandoCnpjAdmin ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              <span>Consultando Receita...</span>
                            </>
                          ) : (
                            <>
                              <Search className="w-3.5 h-3.5 text-white" />
                              <span>Puxar Dados da Receita</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {tipoInscricaoEmpresa === "CNPJ" && !msgCnpjAdmin && (
                      <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                        <span>💡 Digite ou cole o CNPJ e clique em <strong>Puxar Dados da Receita</strong> para preencher Razão Social, CNAE oficial, Grau de Risco e Telefone em 1 segundo.</span>
                      </p>
                    )}

                    {/* Dica para CAEPF */}
                    {tipoInscricaoEmpresa === "CAEPF" && (
                      <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[10.5px] text-emerald-900">
                        <p className="font-semibold mb-1">🌾 Atalhos Rápidos CNAE Rural (NR-31 e NR-04):</p>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCnae("01.11-3");
                              setCnaeDescricao("Cultivo de cereais (soja, milho, trigo, arroz)");
                              setGrauRisco(3);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded text-[9.5px] font-bold hover:bg-emerald-100 cursor-pointer"
                          >
                            🌾 Soja/Milho (01.11-3)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCnae("01.51-2");
                              setCnaeDescricao("Criação de bovinos para corte e leite (pecuária)");
                              setGrauRisco(3);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded text-[9.5px] font-bold hover:bg-emerald-100 cursor-pointer"
                          >
                            🐄 Pecuária (01.51-2)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCnae("01.31-8");
                              setCnaeDescricao("Cultivo de café (cafeicultura)");
                              setGrauRisco(3);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded text-[9.5px] font-bold hover:bg-emerald-100 cursor-pointer"
                          >
                            ☕ Café (01.31-8)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCnae("01.61-0");
                              setCnaeDescricao("Atividades de apoio à agricultura");
                              setGrauRisco(3);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded text-[9.5px] font-bold hover:bg-emerald-100 cursor-pointer"
                          >
                            🚜 Apoio Agrícola (01.61-0)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dica para CEI/CNO */}
                    {tipoInscricaoEmpresa === "CEI/CNO" && (
                      <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10.5px] text-amber-900">
                        <p className="font-semibold mb-1">🏗️ Atalhos Obras / Construção:</p>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCnae("41.20-4");
                              setCnaeDescricao("Construção de edifícios residenciais e comerciais");
                              setGrauRisco(3);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-amber-300 text-amber-800 rounded text-[9.5px] font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            🏗️ Edifícios (41.20-4)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCnae("43.99-1");
                              setCnaeDescricao("Serviços especializados para construção (andaimes)");
                              setGrauRisco(4);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-amber-300 text-amber-800 rounded text-[9.5px] font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            🪜 Serviços Especiais (43.99-1)
                          </button>
                        </div>
                      </div>
                    )}

                    {msgCnpjAdmin && (
                      <div
                        className={`mt-1.5 p-1.5 rounded-lg text-[10.5px] flex items-center gap-1.5 ${
                          msgCnpjAdmin.tipo === "sucesso"
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : "bg-amber-50 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {msgCnpjAdmin.tipo === "sucesso" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span className="truncate">{msgCnpjAdmin.texto}</span>
                      </div>
                    )}
                  </div>

                  {/* Razão Social / Nome do Produtor */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>
                        {tipoInscricaoEmpresa === "CAEPF"
                          ? "Nome do Produtor / Fazenda / PF *"
                          : tipoInscricaoEmpresa === "CEI/CNO"
                          ? "Nome da Obra / Construtora *"
                          : "Razão Social / Nome Fantasia *"}
                      </span>
                      {nome && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Preenchido
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      id="admin-input-nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder={
                        tipoInscricaoEmpresa === "CAEPF"
                          ? "Ex: Fazenda Santa Maria - João da Silva"
                          : tipoInscricaoEmpresa === "CEI/CNO"
                          ? "Ex: Obra Residencial Parque das Flores"
                          : "Ex: Frigorífico Boi Gordo S/A"
                      }
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 font-medium"
                      required
                    />
                  </div>

                  {/* CNAE e Grau de Risco com Catálogo Completo */}
                  <div className="sm:col-span-2">
                    <CnaeSelector
                      id="admin-cnae-selector"
                      value={cnae}
                      descricao={cnaeDescricao}
                      grauRisco={grauRisco}
                      cnaesSecundarios={cnaesSecundariosAdmin}
                      puxadoReceita={Boolean(msgCnpjAdmin && msgCnpjAdmin.tipo === "sucesso")}
                      onChange={(novoCod, novaDesc, novoGr) => {
                        setCnae(novoCod);
                        setCnaeDescricao(novaDesc);
                        setGrauRisco(novoGr);
                      }}
                    />
                  </div>

                  {/* Quadro de Funcionários */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Quadro de Funcionários (NR 28)
                    </label>
                    <select
                      id="admin-select-faixa"
                      value={faixa}
                      onChange={(e) => setFaixa(e.target.value as FaixaFuncionarios)}
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    >
                      {FAIXAS_FUNCIONARIOS.map((f) => (
                        <option key={f} value={f}>
                          {f} colaboradores
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WhatsApp */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      WhatsApp do Responsável
                    </label>
                    <input
                      type="text"
                      id="admin-input-wpp"
                      value={wpp}
                      onChange={(e) => setWpp(e.target.value)}
                      placeholder="Ex: 11999998888"
                      className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Salvar Empresa / Produtor</span>
                  </button>
                </div>
              </form>

              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-700">Empresas e Produtores Cadastrados ({empresas.length})</h4>
                  {onLimparDadosDeTeste && (
                    <button
                      type="button"
                      id="btn-admin-limpar-dados-teste"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "ATENÇÃO: Deseja redefinir o cadastro para apenas as 3 empresas padrão de teste interno (CNPJ, CAEPF e CEI/CNO) e limpar laudos/rascunhos de teste?\n\n🔒 SEUS USUÁRIOS CADASTRADOS SERÃO 100% PRESERVADOS (nenhum usuário será apagado)."
                          )
                        ) {
                          await onLimparDadosDeTeste();
                          setMsgSucesso("Dados de teste limpos! Mantidas apenas as 3 empresas de teste interno. Usuários preservados.");
                          setTimeout(() => setMsgSucesso(null), 4000);
                        }
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Redefinir cadastro para as 3 empresas de teste interno (Mantém todos os Usuários)"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-700" />
                      <span>Redefinir para 3 Empresas de Teste</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {empresas.map((emp) => {
                    const tipoDoc = emp.tipoInscricao || (emp.cnpj.includes(".00000/") ? "CEI/CNO" : (emp.cnpj.split("/")[0]?.length === 11 ? "CAEPF" : "CNPJ"));
                    const isCaepf = tipoDoc === "CAEPF";
                    const isCei = tipoDoc === "CEI/CNO";

                    return (
                      <div
                        key={emp.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-900">{emp.nome}</h5>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                isCaepf
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : isCei
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-sky-100 text-sky-800 border-sky-300"
                              }`}
                            >
                              {tipoDoc}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            <span className="font-mono text-slate-700">{emp.cnpj}</span> • Faixa: {emp.faixaFuncionarios} funcionários
                            {emp.cnae && ` • CNAE ${emp.cnae}${emp.cnaeDescricao ? ` - ${emp.cnaeDescricao}` : ""}`}
                            {emp.grauRisco && ` (Grau ${emp.grauRisco})`}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {emp.contatoWpp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGOMARCA */}
          {activeTab === "identidade" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Logomarca da Consultoria Pericial</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Esta imagem será inserida automaticamente no cabeçalho de todos os Laudos Periciais em PDF emitidos no sistema, conferindo autoridade técnica e identidade visual profissional.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <div className="w-40 h-24 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-2 overflow-hidden shadow-xs">
                    {logoConsultoria ? (
                      <img src={logoConsultoria} alt="Logo Consultoria" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[11px] text-slate-400 text-center font-medium">
                        Nenhuma logomarca cadastrada
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Selecionar Imagem</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleUploadLogo}
                        className="hidden"
                      />
                    </label>

                    {logoConsultoria && (
                      <button
                        type="button"
                        onClick={onRemoverLogo}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover Logo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTÓRICO DE ATIVIDADES & LAUDOS */}
          {activeTab === "historico" && (
            <div className="space-y-4">
              {/* Sub-Header & Sub-Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-600" />
                    <span>Rastreabilidade &amp; Histórico da Equipe</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Acompanhe o log de atividades (criação e modificação de rascunhos e emissão de laudos por inspetor).
                  </p>
                </div>

                <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg border border-slate-300 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSubTabHistorico("atividades")}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                      subTabHistorico === "atividades"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Log de Atividades ({ (laudos?.length || 0) + (rascunhos?.length || 0) })</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTabHistorico("laudos")}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                      subTabHistorico === "laudos"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Laudos Emitidos ({laudos.length})</span>
                  </button>
                </div>
              </div>

              {/* SubTab 1: Log de Atividades Unificadas */}
              {subTabHistorico === "atividades" && (
                <div className="space-y-2.5">
                  {(() => {
                    const atividadesUnificadas = [
                      ...(laudos || []).map((l) => ({
                        id: `laudo-${l.id}`,
                        tipo: "laudo" as const,
                        empresa: l.empresa,
                        data: l.data || new Date().toISOString(),
                        usuario: l.inspetor || "Inspetor Técnico",
                        titulo: `Laudo Pericial Emitido #${l.numero}`,
                        detalhes: `${l.totalItens} itens • Passivo: ${formatarBRL(l.passivoRiscoMax)}`,
                        badgeTexto: "Laudo Emitido",
                        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
                        icon: <FileText className="w-4 h-4 text-emerald-600" />,
                      })),
                      ...(rascunhos || []).map((r) => ({
                        id: `rascunho-${r.id}`,
                        tipo: "rascunho" as const,
                        empresa: r.empresa || r.estado?.empresa || "Empresa Não Informada",
                        data: r.dataAtualizacao || new Date().toISOString(),
                        usuario: r.estado?.inspetor || r.estado?.auditorNome || "Inspetor Técnico",
                        titulo: `Rascunho Salvo / Atualizado`,
                        detalhes: `${r.estado?.evidencias?.length || 0} apontamentos em andamento`,
                        badgeTexto: "Rascunho",
                        badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
                        icon: <Clock className="w-4 h-4 text-amber-600" />,
                      })),
                    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

                    if (atividadesUnificadas.length === 0) {
                      return (
                        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                          Nenhuma atividade ou rascunho registrado até o momento.
                        </div>
                      );
                    }

                    return atividadesUnificadas.map((atv) => (
                      <div
                        key={atv.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {atv.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">
                                {atv.empresa}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${atv.badgeClass}`}>
                                {atv.badgeTexto}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                • {atv.data}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-700 mt-0.5">
                              {atv.titulo}
                            </p>
                            <p className="text-[10.5px] text-slate-500 mt-0.5">
                              Responsável / Auditor: <strong className="text-slate-800">{atv.usuario}</strong> • {atv.detalhes}
                            </p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              {/* SubTab 2: Laudos Emitidos */}
              {subTabHistorico === "laudos" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Laudos Periciais Arquivados ({laudos.length})</span>
                    <span className="text-[10px] text-slate-400">Exclusão permitida apenas para Administradores</span>
                  </div>

                  {laudos.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      Nenhum laudo emitido até o momento.
                    </div>
                  ) : (
                    laudos.map((laudo) => (
                      <div
                        key={laudo.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              #{laudo.numero} — {laudo.empresa}
                            </span>
                            <span className="text-[10px] text-slate-400">({laudo.data})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Auditor: {laudo.inspetor} • {laudo.totalItens} itens • Passivo: {formatarBRL(laudo.passivoRiscoMax)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={gerarLinkWhatsApp(
                              "11999999999",
                              laudo.empresa,
                              laudo.passivoRiscoMax,
                              laudo.economiaGeradaMax || 0,
                              laudo.totalNaoConformidades
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Reenviar pelo WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </a>

                          {onExcluirLaudo && (
                            <button
                              type="button"
                              id={`btn-admin-excluir-laudo-${laudo.id}`}
                              onClick={() => {
                                if (window.confirm(`ATENÇÃO: Deseja realmente excluir permanentemente o Laudo #${laudo.numero} da empresa "${laudo.empresa}"?\n\nEsta operação é irreversível e permitida apenas para Administradores.`)) {
                                  onExcluirLaudo(laudo.id);
                                  setMsgSucesso(`Laudo #${laudo.numero} excluído do banco de dados.`);
                                  setTimeout(() => setMsgSucesso(null), 3000);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg cursor-pointer transition-colors"
                              title="Excluir Laudo Permanentemente (ADM)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: METODOLOGIA NR 28 */}
          {activeTab === "norma" && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900">
                <h4 className="font-bold text-sm mb-1">Como Funciona o Cálculo Oficial da NR 28?</h4>
                <p>
                  A Norma Regulamentadora nº 28 (Fiscalização e Penalidades) do Ministério do Trabalho estipula que o valor das multas fiscais é apurado pelo cruzamento entre:
                </p>
              </div>

              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><b>Grau da Infração:</b> Varia de I1 (infração leve) a I4 (infração gravíssima).</li>
                <li><b>Tipo da Norma:</b> Segurança do Trabalho (S) ou Medicina do Trabalho (M).</li>
                <li><b>Quadro de Funcionários:</b> O porte da empresa graduado em faixas (de 1-10 até mais de 1000 empregados).</li>
                <li><b>Valor Base da UFIR:</b> Base de conversão monetária oficializada pelo Ministério do Trabalho em R$ 1,0641.</li>
              </ul>
            </div>
          )}

          {/* TAB 6: BACKUP & EXPORTAÇÃO EM LOTE (JSON / CSV) */}
          {activeTab === "backup" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/80 flex items-center justify-center text-white shadow-inner">
                    <Download className="w-5 h-5 text-indigo-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <span>Central de Backup &amp; Exportação Pericial</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        Segurança Extra
                      </span>
                    </h3>
                    <p className="text-xs text-indigo-200/80">
                      Exportação manual em lote de todos os rascunhos em andamento, empresas cadastradas e laudos ativos para segurança pericial e auditoria.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-indigo-800/60 text-center">
                  <div className="bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800/40">
                    <span className="block text-lg font-black text-white">{rascunhos?.length || 0}</span>
                    <span className="text-[10px] text-indigo-300 font-medium">Rascunhos</span>
                  </div>
                  <div className="bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800/40">
                    <span className="block text-lg font-black text-white">{empresas.length}</span>
                    <span className="text-[10px] text-indigo-300 font-medium">Empresas</span>
                  </div>
                  <div className="bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800/40">
                    <span className="block text-lg font-black text-white">{laudos.length}</span>
                    <span className="text-[10px] text-indigo-300 font-medium">Laudos Ativos</span>
                  </div>
                  <div className="bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800/40">
                    <span className="block text-lg font-black text-white">{usuarios.length}</span>
                    <span className="text-[10px] text-indigo-300 font-medium">Usuários</span>
                  </div>
                </div>
              </div>

              {/* CARD 1: BACKUP COMPLETO JSON */}
              <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Backup Pericial Completo (Formato JSON)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Gera e baixa instantaneamente um arquivo JSON consolidado contendo toda a base de dados (empresas, rascunhos, laudos assinados, perfis de usuários e programações). Ideal para arquivamento externo e segurança pericial.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="btn-exportar-json-geral"
                    onClick={() => {
                      exportarBackupJson(empresas, rascunhos || [], laudos, usuarios, programacoes || []);
                      setMsgSucesso("Backup pericial completo em JSON gerado e baixado com sucesso!");
                      setTimeout(() => setMsgSucesso(null), 3500);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Backup JSON</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: EXPORTAÇÃO EM CSV (EXCEL) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Exportação Individual em Lote para Planilhas (CSV / Excel)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Selecione o módulo específico para exportar os registros formatados em CSV com codificação UTF-8 compatível com Microsoft Excel e LibreOffice.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Botão Rascunhos CSV */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Rascunhos / Em Andamento</span>
                      <span className="text-[10px] text-slate-500">{rascunhos?.length || 0} rascunhos salvos</span>
                    </div>
                    <button
                      type="button"
                      id="btn-export-rascunhos-csv"
                      onClick={() => {
                        exportarRascunhosCsv(rascunhos || []);
                        setMsgSucesso("Planilha CSV de rascunhos exportada com sucesso!");
                        setTimeout(() => setMsgSucesso(null), 3000);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-300"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Exportar Rascunhos (CSV)</span>
                    </button>
                  </div>

                  {/* Botão Empresas CSV */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Empresas &amp; Clientes</span>
                      <span className="text-[10px] text-slate-500">{empresas.length} empresas cadastradas</span>
                    </div>
                    <button
                      type="button"
                      id="btn-export-empresas-csv"
                      onClick={() => {
                        exportarEmpresasCsv(empresas);
                        setMsgSucesso("Planilha CSV de empresas exportada com sucesso!");
                        setTimeout(() => setMsgSucesso(null), 3000);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-300"
                    >
                      <Building2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Exportar Empresas (CSV)</span>
                    </button>
                  </div>

                  {/* Botão Laudos Ativos CSV */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs">
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Laudos Ativos / Emitidos</span>
                      <span className="text-[10px] text-slate-500">{laudos.length} laudos arquivados</span>
                    </div>
                    <button
                      type="button"
                      id="btn-export-laudos-csv"
                      onClick={() => {
                        exportarLaudosCsv(laudos);
                        setMsgSucesso("Planilha CSV de laudos ativos exportada com sucesso!");
                        setTimeout(() => setMsgSucesso(null), 3000);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-300"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>Exportar Laudos (CSV)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Credenciais Geradas & Envio de E-mail */}
      {credenciaisModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MailCheck className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setCredenciaisModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Credenciais de Acesso Geradas!
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              O usuário foi configurado com sucesso e receberá a exigência de troca obrigatória de senha logo no 1º acesso.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Profissional:</span>
                <span className="font-bold text-slate-800">{credenciaisModal.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Perfil:</span>
                <span className={`font-black uppercase text-[10px] px-1.5 py-0.5 rounded ${
                  credenciaisModal.perfil === "admin" ? "bg-indigo-100 text-indigo-800" : "bg-sky-100 text-sky-800"
                }`}>
                  {credenciaisModal.perfil === "admin" ? "Administrador (ADM)" : "Inspetor"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">E-mail de Login:</span>
                <span className="font-bold text-slate-800">{credenciaisModal.email}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Senha Básica Temporária:</span>
                <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                  {credenciaisModal.senhaTemp}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={gerarLinkEmailBoasVindas(
                  credenciaisModal.email,
                  credenciaisModal.nome,
                  credenciaisModal.senhaTemp,
                  credenciaisModal.perfil
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar Credenciais por E-mail (Abrir Aplicativo)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const texto = `Olá ${credenciaisModal.nome}!\n\nSeu acesso ao sistema VistorIA SST foi criado com sucesso:\n• Perfil: ${
                    credenciaisModal.perfil === "admin" ? "Administrador (Acesso Total)" : "Inspetor Técnico"
                  }\n• E-mail de Login: ${credenciaisModal.email}\n• Senha Temporária: ${credenciaisModal.senhaTemp}\n\nIMPORTANTE: No seu primeiro acesso ao sistema, será solicitada a criação obrigatória da sua nova senha pessoal.\nAcesse em: ${window.location.origin}`;
                  navigator.clipboard.writeText(texto);
                  alert("Mensagem copiada para a área de transferência! Você pode colar no WhatsApp, e-mail ou chat corporativo.");
                }}
                className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Mensagem Pronta</span>
              </button>

              <button
                type="button"
                onClick={() => setCredenciaisModal(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold text-center cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
