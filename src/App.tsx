import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { IdentificationStep } from "./components/IdentificationStep";
import { FindingsStep } from "./components/FindingsStep";
import { ClosureStep } from "./components/ClosureStep";
import { AdminModal } from "./components/AdminModal";
import { LoginScreen } from "./components/LoginScreen";
import { InspectionHub } from "./components/InspectionHub";
import { PrimeiroAcessoModal } from "./components/PrimeiroAcessoModal";
import { OfflineIndicator } from "./components/OfflineIndicator";
import {
  Empresa,
  LaudoEmitido,
  RascunhoVistoria,
  UsuarioAuditor,
  VistoriaState,
} from "./types";
import {
  getEmpresas,
  getLaudos,
  getLogoConsultoria,
  getRascunhos,
  getUsuarioAutenticado,
  getUsuarios,
  limparUsuarioAutenticado,
  removerLogoConsultoria,
  salvarEmpresa,
  salvarLogoConsultoria,
  salvarRascunho,
  salvarUsuario,
  salvarUsuarioAutenticado,
  excluirUsuario,
  excluirLaudo,
  deletarRascunho,
} from "./utils/storage";

const INITIAL_STATE: VistoriaState = {
  empresa: "",
  cnpj: "",
  faixa: "26 a 50",
  wpp: "",
  inspetor: "Eng. Roberto Vasconcelos",
  regInspetor: "CREA: 123456/D - MTE SST",
  acompNome: "",
  acompCargo: "",
  data: new Date().toLocaleDateString("pt-BR"),
  evidencias: [],
  assinaturaInspetor: "",
  assinaturaAcompanhante: "",
};

export function App() {
  // Authentication & Navigation
  const [usuario, setUsuario] = useState<UsuarioAuditor | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAuditor[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState<"login" | "hub" | "inspecao">("hub");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [state, setState] = useState<VistoriaState>(INITIAL_STATE);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [rascunhos, setRascunhos] = useState<RascunhoVistoria[]>([]);
  const [laudos, setLaudos] = useState<LaudoEmitido[]>([]);
  const [logoConsultoria, setLogoConsultoria] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data from local storage
  useEffect(() => {
    const listUsuarios = getUsuarios();
    setUsuarios(listUsuarios);

    const auth = getUsuarioAutenticado();
    if (auth) {
      setUsuario(auth);
      setModoVisualizacao("hub");
      setState((prev) => ({
        ...prev,
        inspetor: auth.nome,
        regInspetor: auth.registro,
      }));
    } else {
      setModoVisualizacao("login");
    }

    setEmpresas(getEmpresas());
    setRascunhos(getRascunhos());
    setLaudos(getLaudos());
    setLogoConsultoria(getLogoConsultoria());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLoginSuccess = (usr: UsuarioAuditor) => {
    salvarUsuarioAutenticado(usr);
    setUsuario(usr);
    setUsuarios(getUsuarios());
    setState((prev) => ({
      ...prev,
      inspetor: usr.nome,
      regInspetor: usr.registro,
    }));
    setModoVisualizacao("hub");
    showToast(`Bem-vindo(a), ${usr.nome} (${usr.perfil === "admin" ? "Administrador" : "Inspetor"})!`);
  };

  const handleLogout = () => {
    limparUsuarioAutenticado();
    setUsuario(null);
    setModoVisualizacao("login");
    showToast("Sessão encerrada com sucesso.");
  };

  const handleSenhaPrimeiroAcessoAlterada = (usrAtualizado: UsuarioAuditor) => {
    setUsuario(usrAtualizado);
    setUsuarios(getUsuarios());
    showToast("Nova senha cadastrada com sucesso! Acesso definitivo liberado.");
  };

  const handleAbrirAdmin = () => {
    if (usuario?.perfil !== "admin") {
      showToast("Acesso restrito: somente administradores têm permissão para acessar a Gestão.");
      return;
    }
    setAdminOpen(true);
  };

  const handleSalvarUsuario = (usrData: Omit<UsuarioAuditor, "id"> & { id?: string }) => {
    const salvo = salvarUsuario(usrData);
    const atualizados = getUsuarios();
    setUsuarios(atualizados);

    // Se o usuário logado editou a si mesmo, sincroniza a sessão
    if (usuario && (usuario.id === salvo.id || usuario.email.trim().toLowerCase() === salvo.email.trim().toLowerCase())) {
      setUsuario(salvo);
      salvarUsuarioAutenticado(salvo);
    }
    showToast(`Usuário "${salvo.nome}" salvo com sucesso!`);
  };

  const handleExcluirUsuario = (id: string) => {
    excluirUsuario(id);
    setUsuarios(getUsuarios());
    showToast("Usuário excluído com sucesso.");
  };

  const handleExcluirLaudo = (id: string) => {
    if (usuario?.perfil !== "admin") {
      showToast("Apenas administradores podem excluir laudos.");
      return;
    }
    excluirLaudo(id);
    setLaudos(getLaudos());
    showToast("Laudo excluído permanentemente.");
  };

  const handleIniciarNovaInspecao = () => {
    setState({
      ...INITIAL_STATE,
      inspetor: usuario?.nome || "Eng. Roberto Vasconcelos",
      regInspetor: usuario?.registro || "CREA: 123456/D - MTE SST",
      data: new Date().toLocaleDateString("pt-BR"),
    });
    setCurrentStep(1);
    setModoVisualizacao("inspecao");
    showToast("Nova inspeção técnica iniciada.");
  };

  const handleContinuarInspecao = (estadoRecuperado: VistoriaState) => {
    setState(estadoRecuperado);
    setCurrentStep(estadoRecuperado.evidencias.length > 0 ? 2 : 1);
    setModoVisualizacao("inspecao");
    showToast(`Inspeção de "${estadoRecuperado.empresa || "Sem Nome"}" carregada para edição.`);
  };

  const handleStateChange = (field: keyof VistoriaState, value: any) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCadastrarEmpresa = (novaEmpresa: Omit<Empresa, "id">) => {
    salvarEmpresa(novaEmpresa);
    setEmpresas(getEmpresas());
    showToast(`Empresa "${novaEmpresa.nome}" cadastrada com sucesso!`);
  };

  const handleSalvarRascunho = () => {
    salvarRascunho(state);
    setRascunhos(getRascunhos());
    showToast("Vistoria salva em rascunho com sucesso!");
  };

  const handleCarregarRascunho = (r: RascunhoVistoria) => {
    setState(r.estado);
    setCurrentStep(2);
    showToast(`Rascunho da empresa "${r.empresa}" carregado!`);
  };

  const handleExcluirRascunho = (id: string) => {
    deletarRascunho(id);
    setRascunhos(getRascunhos());
    showToast("Rascunho excluído.");
  };

  const handleAdicionarApontamento = (novo: any) => {
    setState((prev) => ({
      ...prev,
      evidencias: [novo, ...prev.evidencias],
    }));
    showToast("Apontamento registrado com sucesso!");
  };

  const handleRemoverApontamento = (id: string) => {
    setState((prev) => ({
      ...prev,
      evidencias: prev.evidencias.filter((e) => e.id !== id),
    }));
    showToast("Apontamento removido.");
  };

  const handleSalvarLogo = (b64: string) => {
    salvarLogoConsultoria(b64);
    setLogoConsultoria(b64);
    showToast("Logomarca atualizada!");
  };

  const handleRemoverLogo = () => {
    removerLogoConsultoria();
    setLogoConsultoria(null);
    showToast("Logomarca removida.");
  };

  const handleNovaVistoria = () => {
    if (state.evidencias.length > 0) {
      if (!confirm("Deseja iniciar uma nova vistoria? Os dados não salvos em rascunho serão reiniciados.")) {
        return;
      }
    }
    handleIniciarNovaInspecao();
  };

  const handleLaudoEmitido = () => {
    setLaudos(getLaudos());
    showToast("Laudo assinado e arquivado permanentemente.");
  };

  // 1. TELA DE LOGIN
  if (!usuario || modoVisualizacao === "login") {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. TELA DE HUB / SELEÇÃO (NOVA INSPEÇÃO OU CONTINUAR/EDITAR EXISTENTE)
  if (modoVisualizacao === "hub") {
    return (
      <>
        <InspectionHub
          usuario={usuario}
          onIniciarNovaInspecao={handleIniciarNovaInspecao}
          onContinuarInspecao={handleContinuarInspecao}
          onLogout={handleLogout}
          onAbrirAdmin={usuario.perfil === "admin" ? handleAbrirAdmin : undefined}
          onLaudoExcluido={() => setLaudos(getLaudos())}
        />

        {/* Modal de Gestão ADM acessível diretamente pelo Hub */}
        <AdminModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          empresas={empresas}
          onSalvarEmpresa={handleCadastrarEmpresa}
          logoConsultoria={logoConsultoria}
          onSalvarLogo={handleSalvarLogo}
          onRemoverLogo={handleRemoverLogo}
          laudos={laudos}
          onExcluirLaudo={usuario.perfil === "admin" ? handleExcluirLaudo : undefined}
          usuarios={usuarios}
          onSalvarUsuario={handleSalvarUsuario}
          onExcluirUsuario={handleExcluirUsuario}
          usuarioLogado={usuario}
        />

        {/* Modal Interceptador de 1º Acesso (Troca Obrigatória de Senha) */}
        {usuario && usuario.primeiroAcesso && (
          <PrimeiroAcessoModal
            usuario={usuario}
            onSenhaAlterada={handleSenhaPrimeiroAcessoAlterada}
            onLogout={handleLogout}
          />
        )}

        {toastMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 transition-all">
            {toastMessage}
          </div>
        )}

        {/* Indicador de Conexão / Modo Offline PWA */}
        <OfflineIndicator />
      </>
    );
  }

  // 3. FLUXO DE EXECUÇÃO DA INSPEÇÃO (ETAPAS 1, 2, 3)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentStep={currentStep}
        onSetStep={setCurrentStep}
        findingsCount={state.evidencias.length}
        onOpenAdmin={handleAbrirAdmin}
        onNovaVistoria={handleNovaVistoria}
        onVoltarHub={() => setModoVisualizacao("hub")}
        isAdmin={usuario.perfil === "admin"}
      />

      {/* Main Responsive Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-3 sm:p-4 pb-16">
        {currentStep === 1 && (
          <IdentificationStep
            state={state}
            onChange={handleStateChange}
            empresas={empresas}
            onCadastrarEmpresa={handleCadastrarEmpresa}
            rascunhos={rascunhos}
            onCarregarRascunho={handleCarregarRascunho}
            onExcluirRascunho={handleExcluirRascunho}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <FindingsStep
            state={state}
            onAdicionarApontamento={handleAdicionarApontamento}
            onRemoverApontamento={handleRemoverApontamento}
            onSalvarRascunho={handleSalvarRascunho}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <ClosureStep
            state={state}
            onChange={handleStateChange}
            logoBase64={logoConsultoria}
            onLaudoEmitido={handleLaudoEmitido}
          />
        )}
      </main>

      {/* Corporate Admin Modal */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        empresas={empresas}
        onSalvarEmpresa={handleCadastrarEmpresa}
        logoConsultoria={logoConsultoria}
        onSalvarLogo={handleSalvarLogo}
        onRemoverLogo={handleRemoverLogo}
        laudos={laudos}
        onExcluirLaudo={usuario.perfil === "admin" ? handleExcluirLaudo : undefined}
        usuarios={usuarios}
        onSalvarUsuario={handleSalvarUsuario}
        onExcluirUsuario={handleExcluirUsuario}
        usuarioLogado={usuario}
      />

      {/* Modal Interceptador de 1º Acesso (Troca Obrigatória de Senha) */}
      {usuario && usuario.primeiroAcesso && (
        <PrimeiroAcessoModal
          usuario={usuario}
          onSenhaAlterada={handleSenhaPrimeiroAcessoAlterada}
          onLogout={handleLogout}
        />
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 transition-all">
          {toastMessage}
        </div>
      )}

      {/* Indicador de Conexão / Modo Offline PWA */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
