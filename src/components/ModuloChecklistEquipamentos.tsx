import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Printer, Download, Plus, Trash2, Wrench, FileText, Share2, Sparkles, Truck, ShieldAlert, Search, History, Calendar } from "lucide-react";
import { UsuarioAuditor } from "../types";

interface EquipamentoChecklistProps {
  usuario: UsuarioAuditor;
  onVoltar: () => void;
  empresas: Array<{ id: string; nome: string; cnpj?: string }>;
}

interface ItemChecklist {
  id: string;
  pergunta: string;
  categoriaItem?: string;
  status: "conforme" | "nao_conforme" | "na_aplicavel";
  observacao: string;
}

interface CategoriaEquipamento {
  titulo: string;
  itens: string[];
}

const CATEGORIAS_EQUIPAMENTOS: Record<string, CategoriaEquipamento> = {
  empilhadeira: {
    titulo: "Checklist de Empilhadeira (NR 11 / NR 12)",
    itens: [
      "Freio de serviço e freio de estacionamento (freio de mão) operantes",
      "Buzina, alarme de ré e faróis/luzes de posição funcionando",
      "Pneus, rodas e calotas em bom estado de conservação (sem cortes ou desgaste excessivo)",
      "Sistema hidráulico sem vazamentos (mangueiras, cilindros e conexões)",
      "Garfos sem trincas, desgaste excessivo ou desalinhamento",
      "Cinto de segurança e assento com regulagem em perfeito estado",
      "Giroflex e sinal sonoro de ré ativos e audíveis",
      "Extintor de incêndio dentro da validade (quando aplicável)",
      "Proteção superior (teto de proteção do operador) íntegra e sem amassados severos",
      "Inspeção diária do nível de óleo, água/bateria e vazamentos sob o equipamento"
    ]
  },
  caminhao_munck: {
    titulo: "Checklist de Caminhão Munk / Guindauto (NR 11 / NR 12 / NR 18)",
    itens: [
      "Patolas / Sapatas estabilizadoras com sapatas de apoio e travas de segurança",
      "Lança do guindauto sem trincas, amassados ou corrosão acentuada",
      "Cabo de aço do guincho sem fios rompidos, amassados ou deformações",
      "Gancho de içamento com trava de segurança intacta e giratório livre",
      "Controle remoto ou comandos manuais identificados e em perfeito funcionamento",
      "Dispositivo de parada de emergência (botão e_stop) atuante",
      "Cartão de identificação de inspeção periódica e laudo estrutural atualizado",
      "Calços de madeira adequados para apoio das patolas em piso instável",
      "Documentação do operador (NR 11 / NR 12) e ART do equipamento",
      "Iluminação e sinalização de trânsito do veículo operantes"
    ]
  },
  guindaste: {
    titulo: "Checklist de Guindaste / Grua (NR 11 / NR 18)",
    itens: [
      "Plano de Rigging elaborado e aprovado por Engenheiro Responsável",
      "Indicador de Momento de Carga (LMI) calibrado e operante",
      "Estado dos cabos de aço, polias e moitão inspecionados",
      "Estado e nivelamento dos dormentes e sapatas de patolamento",
      "Anemômetro (medidor de velocidade do vento) funcional",
      "Extintor de incêndio na cabine e isolamento da área de raio de giro",
      "Travas de segurança dos ganchos e finales de curso da elevação",
      "Comunicação por rádio comunicador entre sinaleiro (rigger) e operador",
      "Checklist diário preenchido e assinado pelo operador qualificado",
      "Inspeção visual de vazamentos hidráulicos e ruídos anormais"
    ]
  },
  area_vivencia: {
    titulo: "Checklist de Área de Vivência e Instalações Sanitárias (NR 18 / NR 24)",
    itens: [
      "Instalações sanitárias limpas, higienizadas e em proporção ao número de trabalhadores",
      "Vasos sanitários com assento, tampa e papel higiênico disponíveis",
      "Chuveiros com água limpa (quente e fria quando exigido pelo clima)",
      "Lavatórios com água potável, sabonete líquido e toalhas descartáveis",
      "Água potável, fresca e filtrada disponível em bebedouros higienizados",
      "Local para refeições (refeitório) limpo, iluminado, arejado e com mesas/cadeiras suficientes",
      "Dispositivos térmicos ou estufas para aquecimento de marmitas",
      "Armários individuais com fechadura para guarda de pertences e EPIs",
      "Instalações elétricas protegidas (sem fios expostos ou tomadas danificadas)",
      "Alojamentos (quando houver) com ventilação, área mínima por leito e colchões íntegros"
    ]
  },
  maquinas_geral: {
    titulo: "Checklist de Máquinas e Equipamentos Industriais Gerais (NR 12)",
    itens: [
      "Proteções fixas ou móveis intertravadas em todas as zonas de perigo (partes móveis)",
      "Dispositivos de parada de emergência (E-stop) de fácil acesso e testados",
      "Chave geral bloqueável (LOTO - Lockout/Tagout) para manutenção",
      "Sinalização de segurança com advertências visíveis sobre riscos e operação",
      "Manuais de instruções e procedimentos de operação segura disponíveis no posto",
      "Instalações elétricas blindadas e aterrissadas contra choques e curtos",
      "Ausência de arestas cortantes, rebarbas ou pontos de esmagamento desprotegidos",
      "Iluminação adequada no posto de trabalho e na zona de operação",
      "Ergonomia do posto de trabalho (assentos, altura de comandos)",
      "Capacitação dos operadores registrada em prontuário da NR 12"
    ]
  },
  trabalho_altura: {
    titulo: "Checklist de Andaimes, Linhas de Vida e EPIs de Altura (NR 35)",
    itens: [
      "Montagem de andaimes executada por profissional capacitado e com ART/Projeto",
      "Piso de trabalho metálico ou de madeira antiderrapante, sem vãos e com rodapé",
      "Guarda-corpo superior (1,20m), intermediário (70cm) e rodapé instalados em todo o perímetro",
      "Linhas de vida horizontais ou verticais inspecionadas e certificadas",
      "Cinturões de segurança tipo paraquedista com talabarte duplo em Y e absorvedor de energia",
      "Capacetes com jugular afixada e óculos de proteção em uso correto",
      "Escadas de acesso fixas ou portáteis em boas condições e com travamento",
      "Sinalização de área inferior isolada contra queda de materiais (perigo de queda)",
      "Exame médico específico para trabalho em altura (ASO atualizado)",
      "Permissão de Trabalho (PT) emitida e assinada para atividades em altura"
    ]
  }
};

export const ModuloChecklistEquipamentos: React.FC<EquipamentoChecklistProps> = ({
  usuario,
  onVoltar,
  empresas,
}) => {
  const [tipoEquipamento, setTipoEquipamento] = useState<string>("empilhadeira");
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>(empresas[0]?.nome || "Empresa Exemplo S.A.");
  const [identificacaoEquipamento, setIdentificacaoEquipamento] = useState<string>("EMP-01 / Fabricante XYZ");
  const [localSetor, setLocalSetor] = useState<string>("Pátio de Expedição / Logística");
  const [responsavelInspecao, setResponsavelInspecao] = useState<string>(usuario.nome);
  const [categoriaEquipamentoGeral, setCategoriaEquipamentoGeral] = useState<string>("Frota");
  const [observacoesGerais, setObservacoesGerais] = useState<string>("");
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [abaAtiva, setAbaAtiva] = useState<"checklist" | "historico">("checklist");

  // Histórico simulado dos últimos 5 check-lists para este equipamento / tag
  const historicoChecklists = [
    { id: "hist_1", data: "28/09/2026", inspetor: "Raul Luiz de Faria", conformidade: 100, statusGeral: "Aprovado", itensNc: 0 },
    { id: "hist_2", data: "21/09/2026", inspetor: "Carlos Mendes", conformidade: 90, statusGeral: "Aprovado com Ressalvas", itensNc: 1 },
    { id: "hist_3", data: "14/09/2026", inspetor: "Raul Luiz de Faria", conformidade: 80, statusGeral: "Aprovado com Ressalvas", itensNc: 2 },
    { id: "hist_4", data: "07/09/2026", inspetor: "Ana Paula Souza", conformidade: 100, statusGeral: "Aprovado", itensNc: 0 },
    { id: "hist_5", data: "31/08/2026", inspetor: "Raul Luiz de Faria", conformidade: 70, statusGeral: "Reprovado Temporariamente", itensNc: 3 },
  ];

  const categoriaAtual = CATEGORIAS_EQUIPAMENTOS[tipoEquipamento] || CATEGORIAS_EQUIPAMENTOS.empilhadeira;

  const [itensState, setItemsState] = useState<Record<string, ItemChecklist>>(() => {
    const initial: Record<string, ItemChecklist> = {};
    categoriaAtual.itens.forEach((pergunta, index) => {
      initial[`item_${index}`] = {
        id: `item_${index}`,
        pergunta,
        status: "conforme",
        observacao: ""
      };
    });
    return initial;
  });

  // Atualizar itens quando trocar a categoria
  const handleMudarCategoria = (novaCat: string) => {
    setTipoEquipamento(novaCat);
    const novaCategoria = CATEGORIAS_EQUIPAMENTOS[novaCat];
    const initial: Record<string, ItemChecklist> = {};
    novaCategoria.itens.forEach((pergunta, index) => {
      initial[`item_${index}`] = {
        id: `item_${index}`,
        pergunta,
        status: "conforme",
        observacao: ""
      };
    });
    setItemsState(initial);
  };

  const handleStatusChange = (id: string, status: "conforme" | "nao_conforme" | "na_aplicavel") => {
    setItemsState(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const handleObsChange = (id: string, observacao: string) => {
    setItemsState(prev => ({
      ...prev,
      [id]: { ...prev[id], observacao }
    }));
  };

  const totalItens = Object.keys(itensState).length;
  const totalConformes = Object.values(itensState).filter(i => i.status === "conforme").length;
  const totalNaoConformes = Object.values(itensState).filter(i => i.status === "nao_conforme").length;
  const totalNaAplicavel = Object.values(itensState).filter(i => i.status === "na_aplicavel").length;

  const percentualConformidade = totalItens > 0 ? Math.round((totalConformes / (totalItens - totalNaAplicavel || 1)) * 100) : 100;

  const handleImprimirPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Página Inicial</span>
          </button>
          <div>
            <h1 className="text-sm font-black flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Módulo de Checklist de Equipamentos, Máquinas e Áreas de Vivência</span>
            </h1>
            <p className="text-[11px] text-slate-400">Atendimento à NR 11, NR 12, NR 18, NR 24 e NR 35</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleImprimirPDF}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Seleção de Categoria de Equipamento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            <span>Selecione o Tipo de Equipamento ou Instalação</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { id: "empilhadeira", label: "Empilhadeira" },
              { id: "caminhao_munck", label: "Caminhão Munck" },
              { id: "guindaste", label: "Guindaste / Grua" },
              { id: "area_vivencia", label: "Área de Vivência" },
              { id: "maquinas_geral", label: "Máquinas NR 12" },
              { id: "trabalho_altura", label: "Andaimes / Altura" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleMudarCategoria(cat.id)}
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  tipoEquipamento === cat.id
                    ? "bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950"
                    : "bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-normal">Checklist Técnico</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dados da Inspeção */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identificação do Equipamento e Local</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Empresa / Tomador</label>
              <input
                type="text"
                value={empresaSelecionada}
                onChange={(e) => setEmpresaSelecionada(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                placeholder="Nome da empresa..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Categoria (ex: Frota)</label>
              <select
                value={categoriaEquipamentoGeral}
                onChange={(e) => setCategoriaEquipamentoGeral(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Frota">Frota</option>
                <option value="Segurança Geral">Segurança Geral</option>
                <option value="Área Comum / Vivência">Área Comum / Vivência</option>
                <option value="Equipamento de Içamento">Equipamento de Içamento</option>
                <option value="Industrial / NR 12">Industrial / NR 12</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Identificação / Frota / Tag</label>
              <input
                type="text"
                value={identificacaoEquipamento}
                onChange={(e) => setIdentificacaoEquipamento(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                placeholder="Ex: EMP-05 ou Guindaste 20t"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Local / Setor</label>
              <input
                type="text"
                value={localSetor}
                onChange={(e) => setLocalSetor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                placeholder="Ex: Almoxarifado / Obra"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Inspetor Responsável</label>
              <input
                type="text"
                value={responsavelInspecao}
                onChange={(e) => setResponsavelInspecao(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                placeholder="Nome do inspetor..."
              />
            </div>
          </div>
        </div>

        {/* Resumo de Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Conformes</div>
              <div className="text-xl font-black text-emerald-400">{totalConformes}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Não Conformes</div>
              <div className="text-xl font-black text-rose-400">{totalNaoConformes}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Não Aplicáveis</div>
              <div className="text-xl font-black text-slate-400">{totalNaAplicavel}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Conformidade</div>
              <div className="text-xl font-black text-sky-400">{percentualConformidade}%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Abas de Navegação (Checklist Atual / Histórico) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setAbaAtiva("checklist")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              abaAtiva === "checklist"
                ? "bg-sky-600 text-white shadow-md shadow-sky-950"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Checklist Atual</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva("historico")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              abaAtiva === "historico"
                ? "bg-sky-600 text-white shadow-md shadow-sky-950"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Checklists ({identificacaoEquipamento})</span>
          </button>
        </div>

        {/* CONTEÚDO DA ABA HISTÓRICO */}
        {abaAtiva === "historico" ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  <span>Últimos 5 Check-lists Realizados • {identificacaoEquipamento}</span>
                </h3>
                <p className="text-[11px] text-slate-400">Histórico de vistorias anteriores registradas para este equipamento / tag.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl">
                5 Registros Anteriores
              </span>
            </div>

            <div className="space-y-3">
              {historicoChecklists.map((hist, idx) => (
                <div key={hist.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center font-black text-xs shrink-0">
                      #{5 - idx}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {hist.data}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Inspetor: {hist.inspetor}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Não Conformidades apontadas: <strong className={hist.itensNc > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>{hist.itensNc} item(ns)</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Conformidade</div>
                      <div className="text-sm font-black text-sky-400">{hist.conformidade}%</div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      hist.statusGeral === "Aprovado"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : hist.statusGeral.includes("Ressalvas")
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}>
                      {hist.statusGeral}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* CONTEÚDO DA ABA CHECKLIST ATUAL */
          <>
            {/* Tabela / Lista de Itens do Checklist */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{categoriaAtual.titulo}</h3>
                  <p className="text-[11px] text-slate-400">Avalie cada quesito de segurança conforme o padrão normativo aplicável.</p>
                </div>
                
                {/* Barra de Busca Rápida */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Filtrar itens (ex: freio, cabo)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

          <div className="space-y-4">
            {Object.values(itensState)
              .filter((item) =>
                item.pergunta.toLowerCase().includes(termoBusca.toLowerCase()) ||
                item.observacao.toLowerCase().includes(termoBusca.toLowerCase())
              )
              .map((item, index) => (
              <div key={item.id} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed">
                      {item.pergunta}
                    </p>
                  </div>

                  {/* Botões de Status */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, "conforme")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        item.status === "conforme"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Conforme</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, "nao_conforme")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        item.status === "nao_conforme"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-950"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Não Conforme</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, "na_aplicavel")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        item.status === "na_aplicavel"
                          ? "bg-slate-700 text-white"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>N/A</span>
                    </button>
                  </div>
                </div>

                {/* Campo de Observação opcional para o item */}
                <div>
                  <input
                    type="text"
                    value={item.observacao}
                    onChange={(e) => handleObsChange(item.id, e.target.value)}
                    placeholder="Adicionar observação ou evidência para este item (opcional)..."
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Observações Gerais */}
          <div className="pt-4 space-y-2">
            <label className="block text-xs font-bold text-slate-300">Observações Gerais / Recomendações Técnicas</label>
            <textarea
              rows={3}
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              placeholder="Descreva conclusões da inspeção, restrições de uso do equipamento ou prazos corretivos..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
        </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-slate-900 mt-8">
        VistorIA SST &amp; Checklist Técnico de Equipamentos e Áreas • Atendimento à Legislação Trabalhista
      </footer>
    </div>
  );
};
