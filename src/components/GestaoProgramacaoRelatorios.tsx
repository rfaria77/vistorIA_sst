import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Play,
  Check,
  Edit2,
  Trash2,
  FileText,
  ChevronRight,
  Printer,
  X,
  Layers,
  Timer,
  ShieldAlert,
  BarChart3,
  CalendarDays,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import {
  Empresa,
  LaudoEmitido,
  PeriodicidadeRelatorio,
  ProgramacaoRelatorio,
  UsuarioAuditor,
} from "../types";
import {
  calcularProximaData,
  calcularStatusPrazo,
  getLogoConsultoria,
} from "../utils/storage";
import { gerarLaudoPericialPDF } from "../utils/pdfGenerator";
import { formatarBRL } from "../data/nr28Data";

interface GestaoProgramacaoRelatoriosProps {
  usuario: UsuarioAuditor;
  empresas: Empresa[];
  laudos: LaudoEmitido[];
  programacoes: ProgramacaoRelatorio[];
  onSalvarProgramacao: (prog: Omit<ProgramacaoRelatorio, "id"> & { id?: string }) => void;
  onExcluirProgramacao: (id: string) => void;
  onConcluirCiclo: (id: string, dataConclusao: string) => void;
  onIniciarVistoriaParaEmpresa: (empresaNome: string, tipo?: string) => void;
  onVoltar: () => void;
  onAbrirDashboard?: () => void;
}

const PERIODICIDADES_INFO: Record<
  PeriodicidadeRelatorio,
  { label: string; sigla: string; cor: string; dias: number; desc: string }
> = {
  semanal: {
    label: "Semanal",
    sigla: "7 dias",
    cor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    dias: 7,
    desc: "Rotina toda semana (ex: Canteiros de Obras NR 18)",
  },
  quinzenal: {
    label: "Quinzenal",
    sigla: "15 dias",
    cor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    dias: 15,
    desc: "Rotina a cada 15 dias (ex: Máquinas & Empilhadeiras)",
  },
  mensal: {
    label: "Mensal",
    sigla: "30 dias",
    cor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    dias: 30,
    desc: "Vistoria mensal periódica (ex: Extintores, NR 12, CIPA)",
  },
  semestral: {
    label: "Semestral",
    sigla: "6 meses",
    cor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    dias: 180,
    desc: "Auditoria semestral (ex: Elétrica NR 10, Laudo SPDA)",
  },
  anual: {
    label: "Anual",
    sigla: "1 ano",
    cor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dias: 365,
    desc: "Revisão anual obrigatória (ex: PGR / GRO / PCMSO)",
  },
  eventual: {
    label: "Eventual",
    sigla: "Sob Demanda",
    cor: "bg-slate-500/10 text-slate-300 border-slate-500/30",
    dias: 0,
    desc: "Sem periodicidade pré-fixada (ex: Acidente, Denúncia, Reforma)",
  },
};

const SUGESTOES_TIPOS_RELATORIO = [
  "Vistoria Geral de SST & Prevenção",
  "Inspeção Mensal de NR 12 (Máquinas & Equipamentos)",
  "Vistoria Semanal de Canteiro de Obras NR 18",
  "Auditoria Elétrica & Prontuário PIE (NR 10)",
  "Auditoria Ergonômica & Postos de Trabalho (NR 17)",
  "Inspeção de Trabalho em Altura & Andaimes (NR 35)",
  "Avaliação Periódica do PGR / GRO (NR 01)",
  "Inspeção de Proteção Contra Incêndio & Extintores (NR 23)",
  "Vistoria Eventual por Demanda / Quase-Acidente",
];

export const GestaoProgramacaoRelatorios: React.FC<GestaoProgramacaoRelatoriosProps> = ({
  usuario,
  empresas,
  laudos,
  programacoes,
  onSalvarProgramacao,
  onExcluirProgramacao,
  onConcluirCiclo,
  onIniciarVistoriaParaEmpresa,
  onVoltar,
  onAbrirDashboard,
}) => {
  // Filtros de busca
  const [buscaTexto, setBuscaTexto] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "atrasado" | "atencao" | "em_dia" | "eventual">("todos");
  const [filtroPeriodicidade, setFiltroPeriodicidade] = useState<string>("todas");
  const [modoVisualizacao, setModoVisualizacao] = useState<"empresa" | "cronograma">("empresa");

  // Modais
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<ProgramacaoRelatorio | null>(null);
  const [modalConcluirAberto, setModalConcluirAberto] = useState(false);
  const [itemParaConcluir, setItemParaConcluir] = useState<ProgramacaoRelatorio | null>(null);
  const [dataConclusaoInput, setDataConclusaoInput] = useState<string>(
    new Date().toLocaleDateString("pt-BR")
  );

  // Formulário de Nova / Edição de Programação
  const [formEmpresa, setFormEmpresa] = useState("");
  const [formTipo, setFormTipo] = useState("Vistoria Geral de SST & Prevenção");
  const [formPeriodicidade, setFormPeriodicidade] = useState<PeriodicidadeRelatorio>("mensal");
  const [formDataUltimo, setFormDataUltimo] = useState("");
  const [formDataProxima, setFormDataProxima] = useState("");
  const [formAuditor, setFormAuditor] = useState(usuario.nome);
  const [formObservacoes, setFormObservacoes] = useState("");

  // Modal de visualização do último laudo
  const [laudoDetalhe, setLaudoDetalhe] = useState<LaudoEmitido | null>(null);

  // Abre modal para cadastrar nova programação
  const handleAbrirNova = (empresaPre?: string) => {
    setItemEdicao(null);
    const emp = empresaPre || (empresas.length > 0 ? empresas[0].nome : "");
    setFormEmpresa(emp);
    setFormTipo("Inspeção Mensal de NR 12 (Máquinas & Equipamentos)");
    setFormPeriodicidade("mensal");
    
    // Tenta obter último laudo desta empresa
    const ultimo = laudos.find(
      (l) => l.empresa.toLowerCase().trim() === emp.toLowerCase().trim()
    );
    const dataUlt = ultimo ? ultimo.data : new Date().toLocaleDateString("pt-BR");
    setFormDataUltimo(dataUlt);
    setFormDataProxima(calcularProximaData(dataUlt, "mensal"));
    setFormAuditor(usuario.nome);
    setFormObservacoes("");
    setModalNovaAberto(true);
  };

  // Abre modal para editar programação existente
  const handleAbrirEdicao = (prog: ProgramacaoRelatorio) => {
    setItemEdicao(prog);
    setFormEmpresa(prog.empresaNome);
    setFormTipo(prog.tipoRelatorio);
    setFormPeriodicidade(prog.periodicidade);
    setFormDataUltimo(prog.dataUltimoRelatorio || "");
    setFormDataProxima(prog.dataProximaProgramada || "");
    setFormAuditor(prog.auditorResponsavel || usuario.nome);
    setFormObservacoes(prog.observacoes || "");
    setModalNovaAberto(true);
  };

  // Quando muda empresa no formulário, tenta sugerir data do último laudo
  const handleMudarEmpresaForm = (nomeEmp: string) => {
    setFormEmpresa(nomeEmp);
    const ultimo = laudos.find(
      (l) => l.empresa.toLowerCase().trim() === nomeEmp.toLowerCase().trim()
    );
    if (ultimo) {
      setFormDataUltimo(ultimo.data);
      if (formPeriodicidade !== "eventual") {
        setFormDataProxima(calcularProximaData(ultimo.data, formPeriodicidade));
      }
    }
  };

  // Quando muda periodicidade no formulário, recalcula data prevista
  const handleMudarPeriodicidadeForm = (per: PeriodicidadeRelatorio) => {
    setFormPeriodicidade(per);
    if (per === "eventual") {
      setFormDataProxima("");
    } else {
      const base = formDataUltimo || new Date().toLocaleDateString("pt-BR");
      setFormDataProxima(calcularProximaData(base, per));
    }
  };

  // Salvar programação
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpresa.trim()) {
      alert("Por favor, selecione ou informe o nome da empresa.");
      return;
    }
    if (!formTipo.trim()) {
      alert("Por favor, informe o tipo ou título do relatório.");
      return;
    }

    onSalvarProgramacao({
      id: itemEdicao ? itemEdicao.id : undefined,
      empresaNome: formEmpresa.trim(),
      tipoRelatorio: formTipo.trim(),
      periodicidade: formPeriodicidade,
      dataUltimoRelatorio: formDataUltimo,
      dataProximaProgramada: formDataProxima,
      auditorResponsavel: formAuditor,
      observacoes: formObservacoes,
    });

    setModalNovaAberto(false);
  };

  // Abre modal para dar baixa / concluir ciclo
  const handleAbrirConcluir = (prog: ProgramacaoRelatorio) => {
    setItemParaConcluir(prog);
    setDataConclusaoInput(new Date().toLocaleDateString("pt-BR"));
    setModalConcluirAberto(true);
  };

  const handleConfirmarConclusao = () => {
    if (!itemParaConcluir) return;
    onConcluirCiclo(itemParaConcluir.id, dataConclusaoInput);
    setModalConcluirAberto(false);
    setItemParaConcluir(null);
  };

  // Agrupamento e cálculo de status das programações
  const programacoesProcessadas = useMemo(() => {
    return programacoes.map((prog) => {
      const { status, diasDiferenca, label } = calcularStatusPrazo(
        prog.dataProximaProgramada,
        prog.periodicidade
      );
      return {
        ...prog,
        statusCalculado: status,
        diasDiferenca,
        statusLabel: label,
      };
    });
  }, [programacoes]);

  // Contadores globais para os cards de métricas
  const contadores = useMemo(() => {
    let atrasados = 0;
    let atencao = 0;
    let emDia = 0;
    let eventuais = 0;

    programacoesProcessadas.forEach((p) => {
      if (p.statusCalculado === "atrasado") atrasados++;
      else if (p.statusCalculado === "atencao") atencao++;
      else if (p.statusCalculado === "em_dia") emDia++;
      else if (p.statusCalculado === "eventual") eventuais++;
    });

    const empresasUnicas = new Set<string>();
    empresas.forEach((e) => empresasUnicas.add(e.nome.toLowerCase().trim()));
    programacoes.forEach((p) => empresasUnicas.add(p.empresaNome.toLowerCase().trim()));

    return {
      total: programacoes.length,
      empresasTotal: empresasUnicas.size,
      atrasados,
      atencao,
      emDia,
      eventuais,
    };
  }, [programacoesProcessadas, empresas, programacoes]);

  // Agrupamento por Empresa
  const empresasAgrupadas = useMemo(() => {
    // Coleta todas as empresas cadastradas e empresas que possuem programações
    const mapaEmpresas = new Map<
      string,
      {
        nome: string;
        cnpj?: string;
        grauRisco?: number;
        laudosEmitidos: LaudoEmitido[];
        ultimoLaudo?: LaudoEmitido;
        rotinas: typeof programacoesProcessadas;
        temAtraso: boolean;
        temAtencao: boolean;
      }
    >();

    // Primeiro inclui as empresas do cadastro
    empresas.forEach((emp) => {
      const chave = emp.nome.toLowerCase().trim();
      if (!mapaEmpresas.has(chave)) {
        const laudosEmp = laudos.filter(
          (l) => l.empresa.toLowerCase().trim() === chave
        );
        mapaEmpresas.set(chave, {
          nome: emp.nome,
          cnpj: emp.cnpj,
          grauRisco: emp.grauRisco,
          laudosEmitidos: laudosEmp,
          ultimoLaudo: laudosEmp[0] || undefined,
          rotinas: [],
          temAtraso: false,
          temAtencao: false,
        });
      }
    });

    // Em seguida adiciona as programações processadas
    programacoesProcessadas.forEach((prog) => {
      const chave = prog.empresaNome.toLowerCase().trim();
      let entrada = mapaEmpresas.get(chave);
      if (!entrada) {
        const laudosEmp = laudos.filter(
          (l) => l.empresa.toLowerCase().trim() === chave
        );
        entrada = {
          nome: prog.empresaNome,
          laudosEmitidos: laudosEmp,
          ultimoLaudo: laudosEmp[0] || undefined,
          rotinas: [],
          temAtraso: false,
          temAtencao: false,
        };
        mapaEmpresas.set(chave, entrada);
      }
      entrada.rotinas.push(prog);
      if (prog.statusCalculado === "atrasado") entrada.temAtraso = true;
      if (prog.statusCalculado === "atencao") entrada.temAtencao = true;
    });

    // Converte para array e aplica filtros
    let lista = Array.from(mapaEmpresas.values());

    if (filtroEmpresa !== "todas") {
      lista = lista.filter((e) => e.nome.toLowerCase().trim() === filtroEmpresa.toLowerCase().trim());
    }

    if (buscaTexto.trim()) {
      const t = buscaTexto.toLowerCase().trim();
      lista = lista.filter(
        (e) =>
          e.nome.toLowerCase().includes(t) ||
          e.rotinas.some((r) => r.tipoRelatorio.toLowerCase().includes(t))
      );
    }

    if (filtroStatus !== "todos") {
      lista = lista.filter((e) =>
        e.rotinas.some((r) => r.statusCalculado === filtroStatus)
      );
    }

    if (filtroPeriodicidade !== "todas") {
      lista = lista.filter((e) =>
        e.rotinas.some((r) => r.periodicidade === filtroPeriodicidade)
      );
    }

    // Ordena: empresas com atraso primeiro, depois atenção, depois as demais
    lista.sort((a, b) => {
      if (a.temAtraso && !b.temAtraso) return -1;
      if (!a.temAtraso && b.temAtraso) return 1;
      if (a.temAtencao && !b.temAtencao) return -1;
      if (!a.temAtencao && b.temAtencao) return 1;
      return a.nome.localeCompare(b.nome);
    });

    return lista;
  }, [empresas, laudos, programacoesProcessadas, filtroEmpresa, buscaTexto, filtroStatus, filtroPeriodicidade]);

  // Lista plana de programações filtradas para a visão de Cronograma
  const programacoesFiltradasPlanas = useMemo(() => {
    let lista = [...programacoesProcessadas];

    if (filtroEmpresa !== "todas") {
      lista = lista.filter((p) => p.empresaNome.toLowerCase().trim() === filtroEmpresa.toLowerCase().trim());
    }

    if (buscaTexto.trim()) {
      const t = buscaTexto.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          p.empresaNome.toLowerCase().includes(t) ||
          p.tipoRelatorio.toLowerCase().includes(t) ||
          (p.auditorResponsavel && p.auditorResponsavel.toLowerCase().includes(t))
      );
    }

    if (filtroStatus !== "todos") {
      lista = lista.filter((p) => p.statusCalculado === filtroStatus);
    }

    if (filtroPeriodicidade !== "todas") {
      lista = lista.filter((p) => p.periodicidade === filtroPeriodicidade);
    }

    // Ordenação da mais crítica para a menos crítica
    const prioridadeStatus: Record<string, number> = {
      atrasado: 1,
      atencao: 2,
      em_dia: 3,
      eventual: 4,
    };

    lista.sort((a, b) => {
      const pA = prioridadeStatus[a.statusCalculado] || 5;
      const pB = prioridadeStatus[b.statusCalculado] || 5;
      if (pA !== pB) return pA - pB;
      const dataA = a.dataProximaProgramada || "9999-99-99";
      const dataB = b.dataProximaProgramada || "9999-99-99";
      return dataA.localeCompare(dataB);
    });

    return lista;
  }, [programacoesProcessadas, filtroEmpresa, buscaTexto, filtroStatus, filtroPeriodicidade]);

  // Exportar/Imprimir Cronograma em formato limpo
  const handleImprimirCronograma = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white pb-20">
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-voltar-hub-programacao"
            onClick={onVoltar}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
            title="Voltar ao Painel Principal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-lg text-white shadow-md shadow-indigo-950">
                <CalendarDays className="w-4 h-4" />
              </span>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Gestão & Programação de Relatórios por Empresa
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Acompanhamento de prazos periódicos (semanal, quinzenal, mensal, semestral, anual e eventual)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onAbrirDashboard && (
            <button
              type="button"
              id="btn-prog-ir-dashboard"
              onClick={onAbrirDashboard}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Ver Dashboard com Gráficos por NR e Multas"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Dashboard de Gestão</span>
            </button>
          )}

          <button
            type="button"
            id="btn-imprimir-programacao"
            onClick={handleImprimirCronograma}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Imprimir ou Salvar PDF do Cronograma"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir Cronograma</span>
          </button>

          <button
            type="button"
            id="btn-nova-programacao"
            onClick={() => handleAbrirNova()}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-950 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Programação</span>
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* CARDS DE INDICADORES / METRICAS RÁPIDAS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* ATRASADOS */}
          <button
            type="button"
            onClick={() => setFiltroStatus(filtroStatus === "atrasado" ? "todos" : "atrasado")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-md ${
              filtroStatus === "atrasado"
                ? "bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/50"
                : "bg-slate-800/80 border-slate-700/80 hover:border-rose-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Em Atraso
              </span>
              <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{contadores.atrasados}</span>
              <span className="text-xs text-slate-400">rotinas</span>
            </div>
            <p className="text-[11px] text-rose-300/80 mt-1 font-medium">
              {contadores.atrasados > 0 ? "Requer vistoria urgente" : "Nenhum atrasado"}
            </p>
          </button>

          {/* VENCEM EM BREVE (≤ 7 DIAS) */}
          <button
            type="button"
            onClick={() => setFiltroStatus(filtroStatus === "atencao" ? "todos" : "atencao")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-md ${
              filtroStatus === "atencao"
                ? "bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50"
                : "bg-slate-800/80 border-slate-700/80 hover:border-amber-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Vencem em Breve
              </span>
              <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{contadores.atencao}</span>
              <span className="text-xs text-slate-400">em até 7 dias</span>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-1 font-medium">
              Agendamentos na semana
            </p>
          </button>

          {/* NO PRAZO (EM DIA) */}
          <button
            type="button"
            onClick={() => setFiltroStatus(filtroStatus === "em_dia" ? "todos" : "em_dia")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-md ${
              filtroStatus === "em_dia"
                ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50"
                : "bg-slate-800/80 border-slate-700/80 hover:border-emerald-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                No Prazo (Em Dia)
              </span>
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{contadores.emDia}</span>
              <span className="text-xs text-slate-400">rotinas</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1 font-medium">
              Conformidade regular
            </p>
          </button>

          {/* EVENTUAIS (SOB DEMANDA) */}
          <button
            type="button"
            onClick={() => setFiltroStatus(filtroStatus === "eventual" ? "todos" : "eventual")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-md ${
              filtroStatus === "eventual"
                ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50"
                : "bg-slate-800/80 border-slate-700/80 hover:border-indigo-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Eventuais
              </span>
              <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{contadores.eventuais}</span>
              <span className="text-xs text-slate-400">sob demanda</span>
            </div>
            <p className="text-[11px] text-indigo-300/80 mt-1 font-medium">
              Sem periodicidade fixa
            </p>
          </button>

          {/* TOTAL DE EMPRESAS MONITORADAS */}
          <div className="p-4 rounded-2xl border bg-slate-800/80 border-slate-700/80 text-left shadow-md col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Empresas
              </span>
              <span className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
                <Building2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{contadores.empresasTotal}</span>
              <span className="text-xs text-slate-400">monitoradas</span>
            </div>
            <p className="text-[11px] text-sky-300/80 mt-1 font-medium">
              {contadores.total} rotinas cadastradas
            </p>
          </div>
        </div>

        {/* BARRA DE FILTROS E MODO DE VISUALIZAÇÃO */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Campo de Busca */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-busca-programacoes"
                placeholder="Buscar por empresa, tipo de relatório ou auditor..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {buscaTexto && (
                <button
                  type="button"
                  onClick={() => setBuscaTexto("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Alternância de Modo: Por Empresa vs Cronograma Pleno */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 self-stretch sm:self-auto">
              <button
                type="button"
                id="btn-modo-por-empresa"
                onClick={() => setModoVisualizacao("empresa")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modoVisualizacao === "empresa"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Por Empresa</span>
              </button>
              <button
                type="button"
                id="btn-modo-cronograma"
                onClick={() => setModoVisualizacao("cronograma")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modoVisualizacao === "cronograma"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Cronograma Cronológico</span>
              </button>
            </div>
          </div>

          {/* Filtros Secundários: Periodicidade e Empresa */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Periodicidade:
            </span>

            {(["todas", "semanal", "quinzenal", "mensal", "semestral", "anual", "eventual"] as const).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFiltroPeriodicidade(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    filtroPeriodicidade === p
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/60"
                      : "bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white"
                  }`}
                >
                  {p === "todas" ? "Todas" : PERIODICIDADES_INFO[p].label}
                </button>
              )
            )}

            {empresas.length > 1 && (
              <div className="ml-auto w-full sm:w-auto">
                <select
                  id="select-filtro-empresa"
                  value={filtroEmpresa}
                  onChange={(e) => setFiltroEmpresa(e.target.value)}
                  className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500"
                >
                  <option value="todas">Todas as Empresas ({empresasAgrupadas.length})</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.nome}>
                      {emp.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* VISÃO 1: AGRUPADA POR EMPRESA (COM ÚLTIMO LAUDO, PRÓXIMAS ROTINAS E STATUS) */}
        {modoVisualizacao === "empresa" && (
          <div className="space-y-4">
            {empresasAgrupadas.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Nenhuma empresa encontrada</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Ajuste os filtros de pesquisa ou cadastre uma nova programação periódica de relatórios.
                </p>
                <button
                  type="button"
                  onClick={() => handleAbrirNova()}
                  className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Programação</span>
                </button>
              </div>
            ) : (
              empresasAgrupadas.map((emp) => {
                return (
                  <div
                    key={emp.nome}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-md transition-all hover:border-slate-600"
                  >
                    {/* CABEÇALHO DA EMPRESA */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-800 to-slate-850 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                            <Building2 className="w-5 h-5" />
                          </span>
                          <h2 className="text-base sm:text-lg font-black text-white">
                            {emp.nome}
                          </h2>

                          {/* BADGES DE STATUS GERAL DA EMPRESA */}
                          {emp.temAtraso ? (
                            <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-xs font-black flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Relatório Atrasado</span>
                            </span>
                          ) : emp.temAtencao ? (
                            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Vencimento Próximo</span>
                            </span>
                          ) : emp.rotinas.length > 0 ? (
                            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Programação em Dia</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-slate-700/60 text-slate-300 rounded-full text-xs font-medium">
                              Sem rotinas agendadas
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {emp.cnpj && <span>CNPJ: {emp.cnpj}</span>}
                          {emp.grauRisco && <span>• Grau de Risco {emp.grauRisco}</span>}
                          <span>• {emp.laudosEmitidos.length} laudos emitidos</span>
                        </div>
                      </div>

                      {/* AÇÕES DA EMPRESA */}
                      <div className="flex items-center gap-2 self-start md:self-center">
                        <button
                          type="button"
                          onClick={() => handleAbrirNova(emp.nome)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-600 transition-all cursor-pointer"
                          title="Adicionar rotina para esta empresa"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Rotina</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onIniciarVistoriaParaEmpresa(emp.nome)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          title="Iniciar uma vistoria imediata em campo para esta empresa"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Iniciar Vistoria</span>
                        </button>
                      </div>
                    </div>

                    {/* CORPO: ÚLTIMO RELATÓRIO & ROTINAS PROGRAMADAS */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* CARD DO ÚLTIMO RELATÓRIO REALIZADO */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="p-2 bg-slate-800 text-sky-400 rounded-lg shrink-0 mt-0.5 sm:mt-0">
                            <FileCheck2 className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-300">
                                Último Relatório / Laudo Emitido:
                              </span>
                              {emp.ultimoLaudo ? (
                                <span className="text-xs font-bold text-sky-400">
                                  Laudo #{emp.ultimoLaudo.numero} ({emp.ultimoLaudo.data})
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 italic">
                                  Nenhum laudo finalizado ainda
                                </span>
                              )}
                            </div>
                            {emp.ultimoLaudo && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Auditor: {emp.ultimoLaudo.inspetor} • {emp.ultimoLaudo.totalNaoConformidades} apontamentos
                                {emp.ultimoLaudo.mostrarMultas !== false && (
                                  <span> • Passivo Máx: {formatarBRL(emp.ultimoLaudo.passivoRiscoMax || 0)}</span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {emp.ultimoLaudo && (
                          <button
                            type="button"
                            onClick={() => setLaudoDetalhe(emp.ultimoLaudo!)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all cursor-pointer self-end sm:self-auto"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Visualizar Laudo</span>
                          </button>
                        )}
                      </div>

                      {/* LISTAGEM DE ROTINAS PROGRAMADAS */}
                      {emp.rotinas.length === 0 ? (
                        <div className="text-center py-4 bg-slate-850/50 rounded-xl border border-dashed border-slate-700/60 text-slate-400 text-xs">
                          Nenhuma rotina programada para esta empresa.
                          <button
                            type="button"
                            onClick={() => handleAbrirNova(emp.nome)}
                            className="ml-2 text-sky-400 hover:underline font-bold"
                          >
                            Criar primeira programação
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Cronograma de Vistorias Programadas ({emp.rotinas.length})
                          </h4>

                          <div className="grid grid-cols-1 gap-2.5">
                            {emp.rotinas.map((rotina) => {
                              const perInfo = PERIODICIDADES_INFO[rotina.periodicidade];
                              return (
                                <div
                                  key={rotina.id}
                                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                    rotina.statusCalculado === "atrasado"
                                      ? "bg-rose-950/20 border-rose-500/40"
                                      : rotina.statusCalculado === "atencao"
                                      ? "bg-amber-950/20 border-amber-500/40"
                                      : rotina.statusCalculado === "em_dia"
                                      ? "bg-slate-850 border-slate-700"
                                      : "bg-slate-850 border-slate-700/70"
                                  }`}
                                >
                                  {/* INFO DA ROTINA */}
                                  <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${perInfo.cor}`}
                                      >
                                        {perInfo.label} ({perInfo.sigla})
                                      </span>

                                      <h3 className="text-sm font-bold text-white">
                                        {rotina.tipoRelatorio}
                                      </h3>

                                      {/* BADGE DE STATUS DO PRAZO */}
                                      {rotina.statusCalculado === "atrasado" && (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" />
                                          {rotina.statusLabel}
                                        </span>
                                      )}

                                      {rotina.statusCalculado === "atencao" && (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {rotina.statusLabel}
                                        </span>
                                      )}

                                      {rotina.statusCalculado === "em_dia" && (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          {rotina.statusLabel}
                                        </span>
                                      )}

                                      {rotina.statusCalculado === "eventual" && (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-700/60 text-slate-300 border border-slate-600">
                                          {rotina.statusLabel}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                      {rotina.dataUltimoRelatorio && (
                                        <span>
                                          Último:{" "}
                                          <strong className="text-slate-300">
                                            {rotina.dataUltimoRelatorio}
                                          </strong>
                                        </span>
                                      )}

                                      {rotina.dataProximaProgramada && (
                                        <span>
                                          Próximo Previsto:{" "}
                                          <strong
                                            className={
                                              rotina.statusCalculado === "atrasado"
                                                ? "text-rose-400 font-bold"
                                                : rotina.statusCalculado === "atencao"
                                                ? "text-amber-400 font-bold"
                                                : "text-emerald-400 font-bold"
                                            }
                                          >
                                            {rotina.dataProximaProgramada.includes("-")
                                              ? rotina.dataProximaProgramada
                                                  .split("-")
                                                  .reverse()
                                                  .join("/")
                                              : rotina.dataProximaProgramada}
                                          </strong>
                                        </span>
                                      )}

                                      {rotina.auditorResponsavel && (
                                        <span>• Responsável: {rotina.auditorResponsavel}</span>
                                      )}
                                    </div>

                                    {rotina.observacoes && (
                                      <p className="text-[11px] text-slate-400 italic">
                                        Obs: {rotina.observacoes}
                                      </p>
                                    )}
                                  </div>

                                  {/* BOTÕES DE AÇÃO POR ROTINA */}
                                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onIniciarVistoriaParaEmpresa(
                                          rotina.empresaNome,
                                          rotina.tipoRelatorio
                                        )
                                      }
                                      className="px-2.5 py-1.5 bg-sky-600/90 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                      title="Iniciar vistoria agora com este escopo pré-configurado"
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>Vistoriar</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleAbrirConcluir(rotina)}
                                      className="px-2.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                      title="Dar baixa / Registrar que o relatório foi concluído e calcular o próximo ciclo"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Dar Baixa</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleAbrirEdicao(rotina)}
                                      className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                                      title="Editar programação"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Deseja realmente remover a rotina "${rotina.tipoRelatorio}" de ${rotina.empresaNome}?`
                                          )
                                        ) {
                                          onExcluirProgramacao(rotina.id);
                                        }
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                                      title="Excluir rotina"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VISÃO 2: TABELA CRONOLÓGICA (VISÃO GERAL ORDENADA POR URGÊNCIA) */}
        {modoVisualizacao === "cronograma" && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-sky-400" />
                Cronograma Geral de Prazos (Ordenado por Urgência)
              </h3>
              <span className="text-xs text-slate-400">
                {programacoesFiltradasPlanas.length} rotinas exibidas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Status / Prazo</th>
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">Tipo de Relatório</th>
                    <th className="py-3 px-4">Periodicidade</th>
                    <th className="py-3 px-4">Próxima Data</th>
                    <th className="py-3 px-4">Último Relatório</th>
                    <th className="py-3 px-4">Auditor</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {programacoesFiltradasPlanas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Nenhuma programação corresponde aos filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    programacoesFiltradasPlanas.map((prog) => {
                      const perInfo = PERIODICIDADES_INFO[prog.periodicidade];
                      return (
                        <tr
                          key={prog.id}
                          className={`hover:bg-slate-750/50 transition-colors ${
                            prog.statusCalculado === "atrasado"
                              ? "bg-rose-950/15"
                              : prog.statusCalculado === "atencao"
                              ? "bg-amber-950/10"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-4 whitespace-nowrap">
                            {prog.statusCalculado === "atrasado" && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/50 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {prog.statusLabel}
                              </span>
                            )}
                            {prog.statusCalculado === "atencao" && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/50 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {prog.statusLabel}
                              </span>
                            )}
                            {prog.statusCalculado === "em_dia" && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {prog.statusLabel}
                              </span>
                            )}
                            {prog.statusCalculado === "eventual" && (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-700/60 text-slate-300">
                                {prog.statusLabel}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                            {prog.empresaNome}
                          </td>
                          <td className="py-3 px-4 text-slate-200">{prog.tipoRelatorio}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${perInfo.cor}`}
                            >
                              {perInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <strong
                              className={
                                prog.statusCalculado === "atrasado"
                                  ? "text-rose-400 font-black"
                                  : prog.statusCalculado === "atencao"
                                  ? "text-amber-400 font-bold"
                                  : "text-emerald-400 font-semibold"
                              }
                            >
                              {prog.dataProximaProgramada
                                ? prog.dataProximaProgramada.includes("-")
                                  ? prog.dataProximaProgramada.split("-").reverse().join("/")
                                  : prog.dataProximaProgramada
                                : "Sob demanda"}
                            </strong>
                          </td>
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            {prog.dataUltimoRelatorio || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                            {prog.auditorResponsavel || "—"}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onIniciarVistoriaParaEmpresa(
                                    prog.empresaNome,
                                    prog.tipoRelatorio
                                  )
                                }
                                className="p-1.5 text-sky-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Iniciar vistoria agora"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAbrirConcluir(prog)}
                                className="p-1.5 text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Dar baixa / Concluir ciclo"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAbrirEdicao(prog)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Excluir rotina "${prog.tipoRelatorio}" de ${prog.empresaNome}?`
                                    )
                                  ) {
                                    onExcluirProgramacao(prog.id);
                                  }
                                }}
                                className="p-1.5 text-rose-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: NOVA / EDITAR PROGRAMAÇÃO DE RELATÓRIO */}
      {modalNovaAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <CalendarDays className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-white">
                  {itemEdicao ? "Editar Programação de Vistoria" : "Nova Programação de Relatório"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovaAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 text-xs">
              {/* EMPRESA */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Empresa Auditada <span className="text-rose-400">*</span>
                </label>
                {empresas.length > 0 ? (
                  <div className="flex gap-2">
                    <select
                      id="select-form-empresa"
                      value={formEmpresa}
                      onChange={(e) => handleMudarEmpresaForm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Selecione uma empresa...</option>
                      {empresas.map((e) => (
                        <option key={e.id} value={e.nome}>
                          {e.nome} {e.cnpj ? `(CNPJ: ${e.cnpj})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    type="text"
                    id="input-form-empresa-manual"
                    value={formEmpresa}
                    onChange={(e) => setFormEmpresa(e.target.value)}
                    placeholder="Nome da empresa..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                )}
              </div>

              {/* TIPO / ESCOPO DO RELATÓRIO */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Tipo / Título do Relatório <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="input-form-tipo"
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  placeholder="Ex: Auditoria Mensal NR 12, Vistoria de Canteiro NR 18..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-semibold"
                  required
                />

                {/* SUGESTÕES RÁPIDAS DE CHIPS */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Sugestões comuns:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGESTOES_TIPOS_RELATORIO.slice(0, 5).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setFormTipo(sug)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PERIODICIDADE (SEMANAL, QUINZENAL, MENSAL, SEMESTRAL, ANUAL, EVENTUAL) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Periodicidade do Relatório <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    ["semanal", "quinzenal", "mensal", "semestral", "anual", "eventual"] as PeriodicidadeRelatorio[]
                  ).map((p) => {
                    const info = PERIODICIDADES_INFO[p];
                    const selecionado = formPeriodicidade === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleMudarPeriodicidadeForm(p)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selecionado
                            ? "bg-sky-600/30 border-sky-500 text-white font-bold ring-1 ring-sky-500"
                            : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{info.label}</span>
                          <span className="text-[10px] text-slate-400">{info.sigla}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {info.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DATAS (ÚLTIMO E PRÓXIMO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">
                    Data do Último Relatório
                  </label>
                  <input
                    type="text"
                    id="input-form-data-ultimo"
                    value={formDataUltimo}
                    onChange={(e) => setFormDataUltimo(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Pode ser preenchido a partir do último laudo.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">
                    Próxima Data Prevista{" "}
                    {formPeriodicidade !== "eventual" && <span className="text-rose-400">*</span>}
                  </label>
                  <input
                    type="date"
                    id="input-form-data-proxima"
                    value={formDataProxima}
                    onChange={(e) => setFormDataProxima(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                    disabled={formPeriodicidade === "eventual"}
                  />
                  <p className="text-[10px] text-slate-400">
                    {formPeriodicidade === "eventual"
                      ? "Desativado para relatórios eventuais (sob demanda)."
                      : "Calculado automaticamente ou ajustável."}
                  </p>
                </div>
              </div>

              {/* AUDITOR RESPONSÁVEL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Auditor Responsável</label>
                <input
                  type="text"
                  id="input-form-auditor"
                  value={formAuditor}
                  onChange={(e) => setFormAuditor(e.target.value)}
                  placeholder="Nome do Auditor / Inspetor de SST"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* OBSERVAÇÕES */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Observações / Escopo</label>
                <textarea
                  id="textarea-form-obs"
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Instruções específicas para o auditor (ex: verificar laudo de compressor, testar botoeiras...)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* BOTÕES DO FORMULÁRIO */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalNovaAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-salvar-programacao-modal"
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  {itemEdicao ? "Salvar Alterações" : "Criar Programação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAR BAIXA / REGISTRAR CONCLUSÃO DE CICLO */}
      {modalConcluirAberto && itemParaConcluir && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Check className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-white">Dar Baixa / Concluir Ciclo</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalConcluirAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Você está registrando a realização da vistoria:
              </p>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                <strong className="text-white text-sm block">
                  {itemParaConcluir.tipoRelatorio}
                </strong>
                <p className="text-slate-400">
                  Empresa: <span className="text-slate-200">{itemParaConcluir.empresaNome}</span>
                </p>
                <p className="text-slate-400">
                  Periodicidade:{" "}
                  <span className="text-sky-400 font-bold">
                    {PERIODICIDADES_INFO[itemParaConcluir.periodicidade].label}
                  </span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Data em que a Vistoria foi Realizada:
                </label>
                <input
                  type="text"
                  id="input-data-conclusao-baixa"
                  value={dataConclusaoInput}
                  onChange={(e) => setDataConclusaoInput(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {itemParaConcluir.periodicidade !== "eventual" && (
                <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl text-sky-200 text-[11px] leading-relaxed">
                  🔄 O sistema atualizará a data do último relatório para{" "}
                  <strong>{dataConclusaoInput}</strong> e calculará automaticamente a próxima data
                  com base no ciclo {itemParaConcluir.periodicidade}.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setModalConcluirAberto(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirmar-baixa-ciclo"
                onClick={handleConfirmarConclusao}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md"
              >
                Confirmar Conclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO ÚLTIMO LAUDO */}
      {laudoDetalhe && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Laudo Técnico Pericial #{laudoDetalhe.numero}
                  </h3>
                  <p className="text-slate-400 text-[11px]">{laudoDetalhe.empresa}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLaudoDetalhe(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Data</span>
                <span className="text-white font-bold">{laudoDetalhe.data}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Não Conformidades
                </span>
                <span className="text-rose-400 font-black">
                  {laudoDetalhe.totalNaoConformidades}
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Passivo Máx. (NR 28)
                </span>
                <span className="text-amber-400 font-bold">
                  {formatarBRL(laudoDetalhe.passivoRiscoMax || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Economia Gerada
                </span>
                <span className="text-emerald-400 font-bold">
                  {formatarBRL(laudoDetalhe.economiaGeradaMax || 0)}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Inspetor Responsável:</span>
                <span className="text-white font-bold">{laudoDetalhe.inspetor}</span>
              </div>
              {laudoDetalhe.regInspetor && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Registro Profissional:</span>
                  <span className="text-slate-300">{laudoDetalhe.regInspetor}</span>
                </div>
              )}
              {laudoDetalhe.acompNome && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Acompanhante da Empresa:</span>
                  <span className="text-slate-300">
                    {laudoDetalhe.acompNome} ({laudoDetalhe.acompCargo || "Representante"})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setLaudoDetalhe(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                Fechar
              </button>
              {laudoDetalhe.estado && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const logo = getLogoConsultoria();
                      const blob = await gerarLaudoPericialPDF({
                        estado: laudoDetalhe.estado!,
                        logoBase64: logo,
                        assinaturaInspetor: laudoDetalhe.estado!.assinaturaInspetor,
                        assinaturaAcompanhante: laudoDetalhe.estado!.assinaturaAcompanhante,
                        mostrarMultas: laudoDetalhe.mostrarMultas !== false,
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      const safeName = laudoDetalhe.empresa.replace(/[^a-zA-Z0-9]/g, "_");
                      a.href = url;
                      a.download = `Laudo_SST_${safeName}_${laudoDetalhe.data.replace(/\//g, "-")}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error("Erro ao gerar PDF:", err);
                      alert("Erro ao gerar o arquivo PDF.");
                    }
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Baixar PDF Oficial</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
