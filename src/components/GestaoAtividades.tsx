import React, { useState } from "react";
import {
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  Building2,
  User,
  X,
  Search,
  Filter,
  Download,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { Empresa, UsuarioAuditor } from "../types";
import {
  AtividadeTecnica,
  getAtividadesTecnicas,
  salvarAtividadeTecnica,
  excluirAtividadeTecnica,
  gerarRelatorioPdfAtividades,
} from "../utils/atividadesService";
import { getLogoConsultoria } from "../utils/storage";

interface GestaoAtividadesProps {
  usuario: UsuarioAuditor;
  empresas: Empresa[];
  usuarios: UsuarioAuditor[];
  onBack: () => void;
}

export const GestaoAtividades: React.FC<GestaoAtividadesProps> = ({
  usuario,
  empresas,
  usuarios,
  onBack,
}) => {
  const [atividades, setAtividades] = useState<AtividadeTecnica[]>(getAtividadesTecnicas());
  
  // Modal de cadastro/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [atividadeEditandoId, setAtividadeEditandoId] = useState<string | null>(null);

  // Form states
  const [empresaNome, setEmpresaNome] = useState(empresas[0]?.nome || "");
  const [dataAtv, setDataAtv] = useState(new Date().toISOString().split("T")[0]);
  const [turno, setTurno] = useState<AtividadeTecnica["turno"]>("Turno A");
  const [tipoAtv, setTipoAtv] = useState<AtividadeTecnica["tipoAtividade"]>("Inspeção de Rotina");
  const [descricao, setDescricao] = useState("");
  const [horasGastas, setHorasGastas] = useState<number>(2);
  const [statusAtv, setStatusAtv] = useState<AtividadeTecnica["status"]>("Concluído");
  const [obs, setObs] = useState("");
  const [tecnicoSelecionadoId, setTecnicoSelecionadoId] = useState(usuario.id);

  // Filtros
  const [filtroTecnico, setFiltroTecnico] = useState<string>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("mes"); // "todos" | "semana" | "mes"
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Meta Semanal state
  const [metaSemanal, setMetaSemanal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`vistorias_meta_semanal_${usuario.id}`);
      return saved ? Number(saved) : 5; // Padrão: 5 vistorias/atividades por semana
    } catch {
      return 5;
    }
  });
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [novaMetaInput, setNovaMetaInput] = useState(metaSemanal.toString());

  const handleSalvarMeta = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(novaMetaInput);
    if (val > 0) {
      setMetaSemanal(val);
      try {
        localStorage.setItem(`vistorias_meta_semanal_${usuario.id}`, val.toString());
      } catch {}
      setEditandoMeta(false);
      showToast(`Meta semanal atualizada para ${val} atividades!`);
    }
  };

  // Cálculo de vistorias/atividades realizadas nos últimos 7 dias para o técnico logado (ou filtro atual)
  const atividadesUltimos7Dias = atividades.filter((a) => {
    if (filtroTecnico !== "todos" && a.tecnicoId !== filtroTecnico) return false;
    const dataAtvObj = new Date(a.data);
    const hoje = new Date();
    const diffDias = Math.abs(hoje.getTime() - dataAtvObj.getTime()) / (1000 * 60 * 60 * 24);
    return diffDias <= 7;
  });

  const progressoRealizado = atividadesUltimos7Dias.length;
  const porcentagemMeta = Math.min(100, Math.round((progressoRealizado / (metaSemanal || 1)) * 100));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAbrirNovo = () => {
    setAtividadeEditandoId(null);
    setEmpresaNome(empresas[0]?.nome || "");
    setDataAtv(new Date().toISOString().split("T")[0]);
    setTurno("Turno A");
    setTipoAtv("Inspeção de Rotina");
    setDescricao("");
    setHorasGastas(2);
    setStatusAtv("Concluído");
    setObs("");
    setTecnicoSelecionadoId(usuario.id);
    setModalAberto(true);
  };

  const handleEditar = (at: AtividadeTecnica) => {
    setAtividadeEditandoId(at.id);
    setEmpresaNome(at.empresaNome);
    setDataAtv(at.data);
    setTurno(at.turno);
    setTipoAtv(at.tipoAtividade);
    setDescricao(at.descricao);
    setHorasGastas(at.horasGastas);
    setStatusAtv(at.status);
    setObs(at.observacoes || "");
    setTecnicoSelecionadoId(at.tecnicoId);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      alert("Informe a descrição da atividade realizada.");
      return;
    }

    const techObj = usuarios.find((u) => u.id === tecnicoSelecionadoId) || usuario;

    salvarAtividadeTecnica({
      id: atividadeEditandoId || undefined,
      tecnicoId: techObj.id,
      tecnicoNome: techObj.nome,
      registroTecnico: techObj.registro,
      empresaNome,
      data: dataAtv,
      turno,
      tipoAtividade: tipoAtv,
      descricao: descricao.trim(),
      horasGastas: Number(horasGastas) || 1,
      status: statusAtv,
      observacoes: obs.trim() || undefined,
    });

    setAtividades(getAtividadesTecnicas());
    setModalAberto(false);
    showToast(atividadeEditandoId ? "Atividade atualizada com sucesso!" : "Atividade lançada com sucesso!");
  };

  const handleExcluir = (id: string) => {
    if (window.confirm("Deseja realmente excluir este lançamento de atividade?")) {
      excluirAtividadeTecnica(id);
      setAtividades(getAtividadesTecnicas());
      showToast("Atividade excluída.");
    }
  };

  // Filtragem
  const atividadesFiltradas = atividades.filter((a) => {
    if (filtroTecnico !== "todos" && a.tecnicoId !== filtroTecnico) return false;
    
    if (filtroPeriodo === "semana") {
      // Últimos 7 dias
      const dataAtvObj = new Date(a.data);
      const hoje = new Date();
      const diffDias = Math.abs(hoje.getTime() - dataAtvObj.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDias > 7) return false;
    } else if (filtroPeriodo === "mes") {
      // Mês atual
      const dataAtvObj = new Date(a.data);
      const hoje = new Date();
      if (dataAtvObj.getMonth() !== hoje.getMonth() || dataAtvObj.getFullYear() !== hoje.getFullYear()) {
        return false;
      }
    }
    return true;
  });

  const totalHorasGerais = atividadesFiltradas.reduce((acc, curr) => acc + (Number(curr.horasGastas) || 0), 0);

  const handleGerarPdf = () => {
    const tecnicoObj = usuarios.find((u) => u.id === filtroTecnico);
    const nomeTecnicoFiltro = filtroTecnico === "todos" ? "Todos os Técnicos (Consolidado)" : tecnicoObj?.nome;
    const periodoLabel = filtroPeriodo === "semana" ? "Última Semana (7 Dias)" : filtroPeriodo === "mes" ? "Mês Atual" : "Todo o Período Histórico";
    const logo = getLogoConsultoria();

    gerarRelatorioPdfAtividades(atividadesFiltradas, nomeTecnicoFiltro, periodoLabel, logo);
    showToast("Relatório PDF de atividades gerado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Voltar ao Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Lançamento de Atividades &amp; Relatório para Gestores</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Gestão de Equipe
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Lançamento diário de tarefas dos técnicos para emissão consolidada de relatórios semanais e mensais em PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleGerarPdf}
              disabled={atividadesFiltradas.length === 0}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Gerar Relatório PDF ({atividadesFiltradas.length})</span>
            </button>

            <button
              type="button"
              onClick={handleAbrirNovo}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Atividade</span>
            </button>
          </div>
        </div>

        {/* Filters & Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total de Lançamentos</span>
              <h3 className="text-xl font-black text-white">{atividadesFiltradas.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-slate-400 font-medium">Horas Trabalhadas (Filtro)</span>
              <h3 className="text-xl font-black text-emerald-400">{totalHorasGerais.toFixed(1)}h</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] text-slate-400 font-medium mb-1">Filtrar por Técnico</label>
              <select
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
                className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todos">👥 Todos os Técnicos</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] text-slate-400 font-medium mb-1">Período</label>
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="mes">Mês Atual</option>
                <option value="semana">Últimos 7 Dias</option>
                <option value="todos">Todo o Histórico</option>
              </select>
            </div>
          </div>
        </div>

        {/* COMPONENTE: METAS SEMANAIS & PROGRESSO */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-ping"></span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Metas Semanais de Atividades / Vistorias</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Últimos 7 Dias
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Acompanhe o cumprimento do seu objetivo semanal de vistorias e atendimento aos clientes.
              </p>
            </div>

            {!editandoMeta ? (
              <button
                type="button"
                onClick={() => {
                  setNovaMetaInput(metaSemanal.toString());
                  setEditandoMeta(true);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
              >
                ⚙️ Ajustar Meta ({metaSemanal})
              </button>
            ) : (
              <form onSubmit={handleSalvarMeta} className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={novaMetaInput}
                  onChange={(e) => setNovaMetaInput(e.target.value)}
                  className="w-20 h-9 px-3 bg-slate-950 border border-indigo-500 rounded-xl text-xs text-white font-bold text-center"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoMeta(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>

          {/* Barra de Progresso Visual */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">
                Realizado: <strong className="text-white">{progressoRealizado}</strong> de <strong className="text-white">{metaSemanal}</strong> atividades concluídas
              </span>
              <span className={`font-mono font-bold ${porcentagemMeta >= 100 ? "text-emerald-400" : "text-indigo-400"}`}>
                {porcentagemMeta}% da Meta Semanal
              </span>
            </div>

            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  porcentagemMeta >= 100
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-900/50"
                    : "bg-gradient-to-r from-indigo-600 to-sky-500 shadow-md shadow-indigo-900/50"
                }`}
                style={{ width: `${porcentagemMeta}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{porcentagemMeta >= 100 ? "🎉 Parabéns! Meta semanal atingida com sucesso." : `Faltam ${Math.max(0, metaSemanal - progressoRealizado)} atividades para atingir a meta da semana.`}</span>
              <span className="font-mono">Período de contagem: Últimos 7 dias</span>
            </div>
          </div>
        </div>

        {/* Lista de Atividades */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Atividades Realizadas e Lançadas ({atividadesFiltradas.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Ordenado por data recente</span>
          </div>

          {atividadesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <p>Nenhuma atividade encontrada com os filtros selecionados.</p>
              <button
                type="button"
                onClick={handleAbrirNovo}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-500 transition cursor-pointer"
              >
                Lançar Primeira Atividade
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {atividadesFiltradas.map((at) => (
                <div key={at.id} className="p-4 sm:p-5 hover:bg-slate-850 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{at.empresaNome}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {at.tipoAtividade}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {at.data} • {at.turno}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {at.horasGastas}h trabalhadas
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {at.descricao}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>Técnico: <strong className="text-slate-200">{at.tecnicoNome}</strong></span>
                      {at.observacoes && <span>• Obs: {at.observacoes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditar(at)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Editar atividade"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExcluir(at.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Excluir atividade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CADASTRO / EDIÇÃO DE ATIVIDADE */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>{atividadeEditandoId ? "Editar Atividade Técnica" : "Novo Lançamento de Atividade"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-5 space-y-4 overflow-y-auto flex-1">
              {usuario.perfil === "admin" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Técnico Executor</label>
                  <select
                    value={tecnicoSelecionadoId}
                    onChange={(e) => setTecnicoSelecionadoId(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nome} ({u.cargo})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa / Cliente</label>
                  <select
                    value={empresaNome}
                    onChange={(e) => setEmpresaNome(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.nome}>{emp.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Atividade</label>
                  <input
                    type="date"
                    value={dataAtv}
                    onChange={(e) => setDataAtv(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Atividade</label>
                  <select
                    value={tipoAtv}
                    onChange={(e) => setTipoAtv(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Inspeção de Rotina">Inspeção de Rotina</option>
                    <option value="Treinamento / Integração">Treinamento / Integração</option>
                    <option value="Investigação de Incidente">Investigação de Incidente</option>
                    <option value="Reunião CIPA">Reunião CIPA</option>
                    <option value="Auditoria de EPI">Auditoria de EPI</option>
                    <option value="Acompanhamento de OS Crítica">Acompanhamento de OS Crítica</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Turno</label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Turno A">Turno A</option>
                    <option value="Turno B">Turno B</option>
                    <option value="Turno C">Turno C</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horas Gastas (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={horasGastas}
                    onChange={(e) => setHorasGastas(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição Detalhada da Tarefa Realizada</label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Realizada inspeção de rotina nas colhedoras da frente agrícola, verificação de extintores e orientação sobre APR..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações Adicionais (Opcional)</label>
                <input
                  type="text"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Ex: Acompanhado pelo líder da frente"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {atividadeEditandoId ? "Salvar Alterações" : "Salvar Lançamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 transition-all">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
