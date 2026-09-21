import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  Building2,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
  Layers,
  ChevronDown,
  RotateCcw,
  CalendarDays,
} from "lucide-react";
import { LaudoEmitido, RascunhoVistoria, UsuarioAuditor, Apontamento } from "../types";
import { TITULOS_NR, formatarBRL } from "../data/nr28Data";

interface DashboardGestaoProps {
  usuario: UsuarioAuditor;
  laudos: LaudoEmitido[];
  rascunhos: RascunhoVistoria[];
  onVoltar: () => void;
  onNovaVistoria?: () => void;
  onAbrirProgramacao?: () => void;
}

// Cores sofisticadas e de alto contraste para as NRs
const PALETA_CORES = [
  "#0284c7", // Sky 600
  "#059669", // Emerald 600
  "#d97706", // Amber 600
  "#dc2626", // Red 600
  "#6366f1", // Indigo 500
  "#8b5cf6", // Violet 500
  "#0d9488", // Teal 600
  "#ea580c", // Orange 600
  "#475569", // Slate 600
  "#ec4899", // Pink 500
  "#0891b2", // Cyan 600
  "#84cc16", // Lime 500
];

// Dados demonstrativos realistas caso o usuário não tenha laudos emitidos ainda
const DADOS_DEMO_APONTAMENTOS: Apontamento[] = [
  {
    id: "demo-1",
    nr: "NR 12",
    itemNr: "12.38.1",
    descricao: "Zonas de perigo de máquinas e equipamentos sem proteções móveis com intertravamento.",
    infracao: "I4",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Alta",
    descricaoCenario: "Torno mecânico e fresadora operando sem proteção física de cavacos e parada de emergência.",
    acaoCorretiva: "Instalar chave de segurança intertravada de ruptura positiva categoria 4.",
    valorMin: 4481,
    valorMax: 5600,
    criadoEm: "15/08/2026",
  },
  {
    id: "demo-2",
    nr: "NR 12",
    itemNr: "12.56.1",
    descricao: "Dispositivos de parada de emergência não instalados nos postos de trabalho.",
    infracao: "I3",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Alta",
    descricaoCenario: "Bancada de prensagem sem botão tipo cogumelo.",
    acaoCorretiva: "Instalar botoeiras de emergência monitoradas por relé de segurança.",
    valorMin: 3361,
    valorMax: 4480,
    criadoEm: "18/08/2026",
  },
  {
    id: "demo-3",
    nr: "NR 10",
    itemNr: "10.2.8.2",
    descricao: "Quadros de distribuição elétrica desprovidos de barreira física ou tampa isolante.",
    infracao: "I3",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Alta",
    descricaoCenario: "Painel QGBT com barramentos vivos expostos no galpão principal.",
    acaoCorretiva: "Inserir placa de acrílico de proteção e sinalização de advertência de alta tensão.",
    valorMin: 3361,
    valorMax: 4480,
    criadoEm: "22/08/2026",
  },
  {
    id: "demo-4",
    nr: "NR 10",
    itemNr: "10.4.1",
    descricao: "Instalações elétricas sem laudo atualizado de conformidade das instalações (PIE).",
    infracao: "I2",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Média",
    descricaoCenario: "Prontuário de instalações elétricas desatualizado há mais de 2 anos.",
    acaoCorretiva: "Elaborar laudo técnico das instalações com ART assinada por Eng. Eletricista.",
    valorMin: 2521,
    valorMax: 3360,
    criadoEm: "25/08/2026",
  },
  {
    id: "demo-5",
    nr: "NR 35",
    itemNr: "35.5.1",
    descricao: "Trabalho em altura executado sem sistema de proteção contra quedas (SPQ).",
    infracao: "I4",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Alta",
    descricaoCenario: "Manutenção em telhado a 6m de altura sem linha de vida ou talabarte ancorado.",
    acaoCorretiva: "Implantar linha de vida horizontal projetada e aprovada por profissional legalmente habilitado.",
    valorMin: 4481,
    valorMax: 5600,
    criadoEm: "02/09/2026",
  },
  {
    id: "demo-6",
    nr: "NR 35",
    itemNr: "35.3.2",
    descricao: "Colaboradores sem treinamento bienal de NR 35 (capacitação e aptidão médica no ASO).",
    infracao: "I2",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Média",
    descricaoCenario: "Dois colaboradores operando plataforma elevatória sem registro de treinamento de 8 horas.",
    acaoCorretiva: "Ministrar treinamento teórico/prático de NR 35 e atualizar ASO com aptidão para altura.",
    valorMin: 2521,
    valorMax: 3360,
    criadoEm: "05/09/2026",
  },
  {
    id: "demo-7",
    nr: "NR 06",
    itemNr: "6.5.1",
    descricao: "Não fornecimento de EPI adequado ao risco ou falta de registro em ficha de entrega.",
    infracao: "I2",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Média",
    descricaoCenario: "Operadores sem protetor auricular tipo concha em ambiente com 88 dBA.",
    acaoCorretiva: "Fornecer protetor auditivo com CA válido e registrar a entrega formalmente.",
    valorMin: 2521,
    valorMax: 3360,
    criadoEm: "10/09/2026",
  },
  {
    id: "demo-8",
    nr: "NR 01",
    itemNr: "1.5.3.1",
    descricao: "Inventário de Riscos Ocupacionais (PGR) omitindo riscos ergonômicos e mecânicos.",
    infracao: "I3",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Alta",
    descricaoCenario: "PGR da unidade fabril não contemplava os novos equipamentos instalados no setor de usinagem.",
    acaoCorretiva: "Atualizar inventário de riscos e plano de ação do PGR conforme NR 01.",
    valorMin: 3361,
    valorMax: 4480,
    criadoEm: "14/09/2026",
  },
  {
    id: "demo-9",
    nr: "NR 18",
    itemNr: "18.9.1",
    descricao: "Aberturas no piso desprovidas de fechamento provisório resistente ou guarda-corpo.",
    infracao: "I3",
    tipo: "S",
    status: "Não Conformidade",
    prioridade: "Alta",
    descricaoCenario: "Vão de escada no 2º pavimento desprovido de corrimão e rodapé.",
    acaoCorretiva: "Instalar sistema de guarda-corpo rígido com altura de 1,20m e rodapé de 20cm.",
    valorMin: 3361,
    valorMax: 4480,
    criadoEm: "18/09/2026",
  },
];

export const DashboardGestao: React.FC<DashboardGestaoProps> = ({
  usuario,
  laudos,
  rascunhos,
  onVoltar,
  onNovaVistoria,
  onAbrirProgramacao,
}) => {
  // Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState<"todos" | "30d" | "90d" | "ano" | "custom">("todos");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [filtroOrigem, setFiltroOrigem] = useState<"todos" | "laudos" | "rascunhos">("todos");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");
  const [modoGraficoBarras, setModoGraficoBarras] = useState<"periodo" | "nr">("periodo");
  const [usarDemoSeVazio, setUsarDemoSeVazio] = useState<boolean>(true);

  // Lista de empresas únicas encontradas nos dados
  const listaEmpresas = useMemo(() => {
    const nomes = new Set<string>();
    laudos.forEach((l) => l.empresa && nomes.add(l.empresa.trim()));
    rascunhos.forEach((r) => r.empresa && nomes.add(r.empresa.trim()));
    return Array.from(nomes).sort();
  }, [laudos, rascunhos]);

  // Função auxiliar para parsear data brasileira DD/MM/YYYY ou ISO
  const parseData = (str?: string): Date | null => {
    if (!str) return null;
    try {
      if (str.includes("/")) {
        const partes = str.split(/[\s,]+/)[0].split("/").map(Number);
        if (partes.length === 3) {
          const [d, m, y] = partes;
          return new Date(y, m - 1, d);
        }
      }
      const iso = new Date(str);
      if (!isNaN(iso.getTime())) return iso;
    } catch {}
    return null;
  };

  // Coleta e filtra todos os apontamentos
  const { apontamentosFiltrados, totalVistoriasAnalisadas, dadosSaoDemo } = useMemo(() => {
    interface ItemComOrigem {
      apontamento: Apontamento;
      empresa: string;
      data: Date;
      dataStr: string;
      origem: "laudo" | "rascunho";
    }

    let itens: ItemComOrigem[] = [];

    // Inclui laudos emitidos
    if (filtroOrigem === "todos" || filtroOrigem === "laudos") {
      laudos.forEach((laudo) => {
        const dataDoc = parseData(laudo.data) || new Date();
        const evs = laudo.estado?.evidencias || [];
        evs.forEach((ev) => {
          if (ev.status === "Não Conformidade") {
            itens.push({
              apontamento: ev,
              empresa: laudo.empresa,
              data: dataDoc,
              dataStr: laudo.data,
              origem: "laudo",
            });
          }
        });
      });
    }

    // Inclui rascunhos em andamento
    if (filtroOrigem === "todos" || filtroOrigem === "rascunhos") {
      rascunhos.forEach((rasc) => {
        const dataDoc = parseData(rasc.dataAtualizacao) || parseData(rasc.estado?.data) || new Date();
        const evs = rasc.estado?.evidencias || [];
        evs.forEach((ev) => {
          if (ev.status === "Não Conformidade") {
            itens.push({
              apontamento: ev,
              empresa: rasc.empresa,
              data: dataDoc,
              dataStr: rasc.dataAtualizacao || rasc.estado?.data || "",
              origem: "rascunho",
            });
          }
        });
      });
    }

    let isDemo = false;
    // Se a base estiver sem apontamentos e a opção demo estiver ativa, utiliza os dados de benchmark
    if (itens.length === 0 && usarDemoSeVazio) {
      isDemo = true;
      const agora = new Date();
      itens = DADOS_DEMO_APONTAMENTOS.map((d, index) => {
        const dOffset = new Date(agora);
        dOffset.setDate(agora.getDate() - (index * 6));
        return {
          apontamento: d,
          empresa: "Indústria Metalmecânica Modelo S.A.",
          data: dOffset,
          dataStr: dOffset.toLocaleDateString("pt-BR"),
          origem: "laudo",
        };
      });
    }

    // Aplica filtro de Empresa
    if (filtroEmpresa !== "todas") {
      itens = itens.filter(
        (it) => it.empresa.trim().toLowerCase() === filtroEmpresa.trim().toLowerCase()
      );
    }

    // Aplica filtro de Período
    const agora = new Date();
    if (filtroPeriodo === "30d") {
      const limite = new Date();
      limite.setDate(agora.getDate() - 30);
      itens = itens.filter((it) => it.data >= limite);
    } else if (filtroPeriodo === "90d") {
      const limite = new Date();
      limite.setDate(agora.getDate() - 90);
      itens = itens.filter((it) => it.data >= limite);
    } else if (filtroPeriodo === "ano") {
      const anoAtual = agora.getFullYear();
      itens = itens.filter((it) => it.data.getFullYear() === anoAtual);
    } else if (filtroPeriodo === "custom" && (dataInicio || dataFim)) {
      const dtInicio = dataInicio ? new Date(`${dataInicio}T00:00:00`) : null;
      const dtFim = dataFim ? new Date(`${dataFim}T23:59:59`) : null;

      itens = itens.filter((it) => {
        if (dtInicio && it.data < dtInicio) return false;
        if (dtFim && it.data > dtFim) return false;
        return true;
      });
    }

    // Conta vistorias no escopo
    const vistoriasUnicas = new Set<string>();
    itens.forEach((it) => vistoriasUnicas.add(`${it.empresa}-${it.dataStr}`));

    return {
      apontamentosFiltrados: itens,
      totalVistoriasAnalisadas: vistoriasUnicas.size,
      dadosSaoDemo: isDemo,
    };
  }, [
    laudos,
    rascunhos,
    filtroOrigem,
    filtroEmpresa,
    filtroPeriodo,
    dataInicio,
    dataFim,
    usarDemoSeVazio,
  ]);

  // Agrupamento por NR (Gráfico de Pizza e Estatísticas)
  const dadosPorNR = useMemo(() => {
    const mapa: Record<
      string,
      {
        nr: string;
        nomeCompleto: string;
        quantidade: number;
        passivoMin: number;
        passivoMax: number;
        graus: Record<string, number>;
      }
    > = {};

    apontamentosFiltrados.forEach(({ apontamento }) => {
      const nr = (apontamento.nr || "Outras").trim().toUpperCase();
      if (!mapa[nr]) {
        mapa[nr] = {
          nr,
          nomeCompleto: TITULOS_NR[nr] || `${nr} - Segurança e Saúde no Trabalho`,
          quantidade: 0,
          passivoMin: 0,
          passivoMax: 0,
          graus: { I1: 0, I2: 0, I3: 0, I4: 0 },
        };
      }
      mapa[nr].quantidade += 1;
      mapa[nr].passivoMin += apontamento.valorMin || 0;
      mapa[nr].passivoMax += apontamento.valorMax || 0;
      if (apontamento.infracao) {
        mapa[nr].graus[apontamento.infracao] = (mapa[nr].graus[apontamento.infracao] || 0) + 1;
      }
    });

    const lista = Object.values(mapa).sort((a, b) => b.quantidade - a.quantidade);
    const totalItens = apontamentosFiltrados.length;

    return lista.map((item, idx) => ({
      ...item,
      porcentagem: totalItens > 0 ? ((item.quantidade / totalItens) * 100).toFixed(1) : "0",
      cor: PALETA_CORES[idx % PALETA_CORES.length],
    }));
  }, [apontamentosFiltrados]);

  // Agrupamento por Mês / Período (Gráfico de Barras Cronológico)
  const dadosPorPeriodo = useMemo(() => {
    const mesesNomes = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ];

    const mapa: Record<
      string,
      {
        chave: string;
        label: string;
        timestamp: number;
        totalMultasMin: number;
        totalMultasMax: number;
        apontamentosCount: number;
      }
    > = {};

    apontamentosFiltrados.forEach(({ apontamento, data }) => {
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const chave = `${ano}-${String(mes + 1).padStart(2, "0")}`;
      const label = `${mesesNomes[mes]}/${String(ano).slice(2)}`;

      if (!mapa[chave]) {
        mapa[chave] = {
          chave,
          label,
          timestamp: new Date(ano, mes, 1).getTime(),
          totalMultasMin: 0,
          totalMultasMax: 0,
          apontamentosCount: 0,
        };
      }

      mapa[chave].totalMultasMin += apontamento.valorMin || 0;
      mapa[chave].totalMultasMax += apontamento.valorMax || 0;
      mapa[chave].apontamentosCount += 1;
    });

    return Object.values(mapa).sort((a, b) => a.timestamp - b.timestamp);
  }, [apontamentosFiltrados]);

  // Agrupamento de Multas por NR (Gráfico de Barras por NR)
  const dadosMultasPorNR = useMemo(() => {
    return dadosPorNR.map((d) => ({
      nr: d.nr,
      totalMultasMax: d.passivoMax,
      totalMultasMin: d.passivoMin,
      quantidade: d.quantidade,
      cor: d.cor,
    }));
  }, [dadosPorNR]);

  // KPIs Totais
  const kpis = useMemo(() => {
    const totalApontamentos = apontamentosFiltrados.length;
    const totalPassivoMin = apontamentosFiltrados.reduce(
      (acc, cur) => acc + (cur.apontamento.valorMin || 0),
      0
    );
    const totalPassivoMax = apontamentosFiltrados.reduce(
      (acc, cur) => acc + (cur.apontamento.valorMax || 0),
      0
    );
    // Economia projetada (evitando reincidências e multas teto)
    const economiaProjetada = totalPassivoMax * 0.85;

    // NR mais recorrente
    const nrMaisCritica = dadosPorNR.length > 0 ? dadosPorNR[0] : null;

    // Contagem de infrações graves (I3 e I4)
    const totalGravesI3I4 = apontamentosFiltrados.filter(
      (i) => i.apontamento.infracao === "I3" || i.apontamento.infracao === "I4"
    ).length;

    return {
      totalApontamentos,
      totalPassivoMin,
      totalPassivoMax,
      economiaProjetada,
      nrMaisCritica,
      totalGravesI3I4,
    };
  }, [apontamentosFiltrados, dadosPorNR]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Bar / Header */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-voltar-do-dashboard"
              onClick={onVoltar}
              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
              title="Voltar ao Painel de Inspeções"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Dashboard de Gestão
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                    Inteligência Pericial
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Análise Quantitativa por NR &amp; Exposição Financeira NR 28
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAbrirProgramacao && (
              <button
                type="button"
                id="btn-dashboard-abrir-programacao"
                onClick={onAbrirProgramacao}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Gestão de Programação e Prazos por Empresa"
              >
                <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Programação de Relatórios</span>
              </button>
            )}

            <button
              type="button"
              id="btn-imprimir-dashboard"
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir ou Salvar PDF Executivo do Dashboard"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            {onNovaVistoria && (
              <button
                type="button"
                id="btn-nova-vistoria-do-dashboard"
                onClick={onNovaVistoria}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-950 transition-colors cursor-pointer"
              >
                <span>Nova Vistoria</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner informativo caso esteja exibindo dados demonstrativos */}
        {dadosSaoDemo && (
          <div className="bg-sky-950/60 border border-sky-600/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sky-100 animate-fade-in shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white text-sm">
                  Modo de Demonstração Interativo Ativo
                </p>
                <p className="text-sky-200/80 text-[11px] leading-relaxed">
                  Como ainda não foram finalizados laudos ou rascunhos suficientes nesta sessão, estamos exibindo um conjunto padrão de apontamentos técnicos para demonstrar os gráficos de NR e multas.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUsarDemoSeVazio(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-700 transition cursor-pointer shrink-0"
            >
              Exibir apenas dados reais (0)
            </button>
          </div>
        )}

        {/* Filtros Executivos e Seletor de Período */}
        <section
          id="filtros-dashboard-gestao"
          className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Filtros e Recorte de Análise
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Auditor Ativo:</span>
              <span className="font-semibold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {usuario.nome}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Seletor de Período Rápido */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Período de Vistoria</span>
              </label>
              <select
                id="select-periodo-dashboard"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition cursor-pointer"
              >
                <option value="todos">Todo o Histórico</option>
                <option value="30d">Últimos 30 Dias</option>
                <option value="90d">Últimos 90 Dias</option>
                <option value="ano">Ano Vigente (2026)</option>
                <option value="custom">Data Personalizada (De / Até)</option>
              </select>
            </div>

            {/* Origem dos Dados (Laudos vs Rascunhos) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Origem dos Registros</span>
              </label>
              <select
                id="select-origem-dashboard"
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="todos">Consolidado (Laudos + Rascunhos)</option>
                <option value="laudos">Apenas Laudos Emitidos</option>
                <option value="rascunhos">Apenas Rascunhos em Andamento</option>
              </select>
            </div>

            {/* Filtro por Empresa */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Empresa Auditada</span>
              </label>
              <select
                id="select-empresa-dashboard"
                value={filtroEmpresa}
                onChange={(e) => setFiltroEmpresa(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="todas">Todas as Empresas ({listaEmpresas.length})</option>
                {listaEmpresas.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicador de Resumo do Recorte */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Amostra Selecionada
                </span>
                <span className="text-white font-bold text-sm">
                  {apontamentosFiltrados.length} irregularidade(s)
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <span>{totalVistoriasAnalisadas} auditoria(s)</span>
              </div>
            </div>
          </div>

          {/* Seletores de Data Personalizada caso selecionado */}
          {filtroPeriodo === "custom" && (
            <div className="pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Data Inicial (De):
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Data Final (Até):
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}
        </section>

        {/* Linha de KPIs Executivos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Apontamentos */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total de Apontamentos
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {kpis.totalApontamentos}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
              <span>{kpis.totalGravesI3I4} de Risco Severo (I3/I4)</span>
            </div>
          </div>

          {/* Passivo Máximo Estimado NR 28 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Passivo Máximo NR 28
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
              {formatarBRL(kpis.totalPassivoMax)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Piso Mínimo Estimado: <strong className="text-slate-300">{formatarBRL(kpis.totalPassivoMin)}</strong>
            </div>
          </div>

          {/* Economia Potencial com Adequações */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Economia Projetada
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {formatarBRL(kpis.economiaProjetada)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Blindagem com saneamento preventivo
            </div>
          </div>

          {/* Norma Mais Crítica */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                NR de Maior Incidência
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {kpis.nrMaisCritica ? kpis.nrMaisCritica.nr : "N/A"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate" title={kpis.nrMaisCritica?.nomeCompleto}>
              {kpis.nrMaisCritica ? `${kpis.nrMaisCritica.quantidade} apontamentos (${kpis.nrMaisCritica.porcentagem}%)` : "Nenhum registro"}
            </div>
          </div>
        </section>

        {/* Gráficos Principais (Recharts: Pizza e Barras) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gráfico de Pizza: Volume de Apontamentos por NR */}
          <div
            id="grafico-pizza-volume-nr"
            className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Volume de Apontamentos por NR
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {dadosPorNR.length} NRs detectadas
              </span>
            </div>

            {dadosPorNR.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                <AlertTriangle className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-xs font-semibold">Nenhum apontamento encontrado no período selecionado.</p>
                <p className="text-[11px] text-slate-500 mt-1">Ajuste os filtros acima para ampliar a pesquisa.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosPorNR}
                        dataKey="quantidade"
                        nameKey="nr"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {dadosPorNR.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs text-white max-w-xs">
                                <div className="font-bold flex items-center gap-2 mb-1">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                    style={{ backgroundColor: data.cor }}
                                  />
                                  <span>{data.nr}</span>
                                  <span className="text-slate-400 font-normal">({data.porcentagem}%)</span>
                                </div>
                                <p className="text-slate-300 text-[11px] mb-2 leading-tight">
                                  {data.nomeCompleto}
                                </p>
                                <div className="space-y-0.5 pt-1.5 border-t border-slate-800 text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Irregularidades:</span>
                                    <span className="font-bold text-white">{data.quantidade} itens</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Passivo Máx:</span>
                                    <span className="font-bold text-rose-400">{formatarBRL(data.passivoMax)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legenda Customizada em Lista Escaneável */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {dadosPorNR.map((item) => (
                    <div
                      key={item.nr}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.cor }}
                        />
                        <span className="font-bold text-white shrink-0">{item.nr}</span>
                        <span className="text-[11px] text-slate-400 truncate hidden sm:inline" title={item.nomeCompleto}>
                          {item.nomeCompleto.replace(`${item.nr} - `, "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="font-semibold text-slate-300">{item.quantidade} apont.</span>
                        <span className="text-[11px] font-bold text-sky-400 w-12 text-right">
                          {item.porcentagem}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gráfico de Barras: Total Estimado de Multas no Período */}
          <div
            id="grafico-barras-total-multas"
            className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Total Estimado de Multas NR 28
                </h3>
              </div>

              {/* Alternância de Agrupamento das Barras */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setModoGraficoBarras("periodo")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    modoGraficoBarras === "periodo"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Evolução no Tempo
                </button>
                <button
                  type="button"
                  onClick={() => setModoGraficoBarras("nr")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    modoGraficoBarras === "nr"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Impacto por NR (R$)
                </button>
              </div>
            </div>

            {/* Renderização do Gráfico de Barras */}
            <div className="flex-1 flex flex-col">
              <div className="w-full h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {modoGraficoBarras === "periodo" ? (
                    <BarChart
                      data={dadosPorPeriodo}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs text-white">
                                <p className="font-bold text-sky-400 mb-1">Mês: {data.label}</p>
                                <div className="space-y-1 text-[11px]">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-slate-400">Total Apontamentos:</span>
                                    <span className="font-bold">{data.apontamentosCount}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-slate-400">Multa Máxima:</span>
                                    <span className="font-bold text-rose-400">
                                      {formatarBRL(data.totalMultasMax)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-slate-400">Multa Mínima:</span>
                                    <span className="font-bold text-amber-300">
                                      {formatarBRL(data.totalMultasMin)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
                      />
                      <Bar
                        name="Multa Máxima (R$)"
                        dataKey="totalMultasMax"
                        fill="#f43f5e"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        name="Multa Mínima (R$)"
                        dataKey="totalMultasMin"
                        fill="#0284c7"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <BarChart
                      data={dadosMultasPorNR}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="nr"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs text-white">
                                <p className="font-bold text-emerald-400 mb-1">{data.nr}</p>
                                <div className="space-y-1 text-[11px]">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-slate-400">Irregularidades:</span>
                                    <span className="font-bold">{data.quantidade}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-slate-400">Passivo Máximo:</span>
                                    <span className="font-bold text-rose-400">
                                      {formatarBRL(data.totalMultasMax)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        name="Passivo Máx por NR"
                        dataKey="totalMultasMax"
                        fill="#059669"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span>
                  💡 <strong>Interpretação NR 28:</strong> Os valores correspondem à tabela oficial de infrações em função do porte de colaboradores e gravidade (I1 a I4).
                </span>
                <span className="font-bold text-slate-300 shrink-0 ml-2">
                  Total: {formatarBRL(kpis.totalPassivoMax)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tabela Analítica Detalhada por Norma Regulamentadora */}
        <section className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Detalhamento Analítico por Norma Regulamentadora
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Total de NRs Afetadas: <strong className="text-white">{dadosPorNR.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[11px] text-slate-400 uppercase tracking-wider font-bold border-y border-slate-800">
                <tr>
                  <th className="py-3 px-3">Norma</th>
                  <th className="py-3 px-3">Tema Regulatório</th>
                  <th className="py-3 px-3 text-center">Volume Apontamentos</th>
                  <th className="py-3 px-3 text-center">% do Total</th>
                  <th className="py-3 px-3 text-right">Multa Mínima</th>
                  <th className="py-3 px-3 text-right">Passivo Máximo NR 28</th>
                  <th className="py-3 px-3 text-center">Severidade Dominante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dadosPorNR.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      Nenhum registro encontrado para a combinação de filtros.
                    </td>
                  </tr>
                ) : (
                  dadosPorNR.map((nrItem) => {
                    // Descobre a infração mais frequente
                    const maiorGrau = Object.entries(nrItem.graus).sort(
                      (a, b) => b[1] - a[1]
                    )[0];

                    return (
                      <tr key={nrItem.nr} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: nrItem.cor }}
                          />
                          <span>{nrItem.nr}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={nrItem.nomeCompleto}>
                          {nrItem.nomeCompleto.replace(`${nrItem.nr} - `, "")}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white">
                          {nrItem.quantidade}
                        </td>
                        <td className="py-3 px-3 text-center text-sky-400 font-semibold">
                          {nrItem.porcentagem}%
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400 font-mono">
                          {formatarBRL(nrItem.passivoMin)}
                        </td>
                        <td className="py-3 px-3 text-right text-rose-400 font-bold font-mono">
                          {formatarBRL(nrItem.passivoMax)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              maiorGrau && (maiorGrau[0] === "I4" || maiorGrau[0] === "I3")
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            Grau {maiorGrau ? maiorGrau[0] : "I2"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
