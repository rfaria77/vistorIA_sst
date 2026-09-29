import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Empresa, UsuarioAuditor } from "../types";

export interface AtividadeTecnica {
  id: string;
  tecnicoId: string;
  tecnicoNome: string;
  registroTecnico: string;
  empresaId?: string;
  empresaNome: string;
  data: string; // YYYY-MM-DD ou DD/MM/YYYY
  turno: "Turno A" | "Turno B" | "Turno C" | "Administrativo";
  tipoAtividade: "Inspeção de Rotina" | "Treinamento / Integração" | "Investigação de Incidente" | "Reunião CIPA" | "Auditoria de EPI" | "Acompanhamento de OS Crítica" | "Outros";
  descricao: string;
  horasGastas: number;
  status: "Concluído" | "Em Andamento" | "Pendente";
  observacoes?: string;
  criadoEm: string;
}

const STORAGE_KEY_ATIVIDADES = "vistorias_atividades_tecnicos_v1";

export function getAtividadesTecnicas(): AtividadeTecnica[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATIVIDADES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function salvarAtividadeTecnica(
  ativ: Omit<AtividadeTecnica, "id" | "criadoEm"> & { id?: string }
): AtividadeTecnica {
  const lista = getAtividadesTecnicas();
  const agora = new Date().toISOString();
  
  if (ativ.id) {
    const idx = lista.findIndex((a) => a.id === ativ.id);
    if (idx >= 0) {
      const atualizada: AtividadeTecnica = {
        ...lista[idx],
        ...ativ,
      };
      lista[idx] = atualizada;
      localStorage.setItem(STORAGE_KEY_ATIVIDADES, JSON.stringify(lista));
      return atualizada;
    }
  }

  const nova: AtividadeTecnica = {
    ...ativ,
    id: `ativ-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    criadoEm: agora,
  };

  lista.unshift(nova);
  localStorage.setItem(STORAGE_KEY_ATIVIDADES, JSON.stringify(lista));
  return nova;
}

export function excluirAtividadeTecnica(id: string): void {
  const lista = getAtividadesTecnicas().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY_ATIVIDADES, JSON.stringify(lista));
}

export function gerarRelatorioPdfAtividades(
  atividades: AtividadeTecnica[],
  tecnicoFiltro?: string,
  periodoLabel: string = "Período Geral",
  logoBase64?: string | null
): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cabeçalho institucional
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("RELATÓRIO DE ATIVIDADES TÉCNICAS SST", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Período / Referência: ${periodoLabel} • Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 19);

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", pageWidth - 38, 4, 24, 20);
    } catch {}
  }

  let startY = 36;

  if (tecnicoFiltro) {
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Técnico Responsável: ${tecnicoFiltro}`, 14, startY);
    startY += 8;
  }

  // Resumo de Horas
  const totalHoras = atividades.reduce((acc, curr) => acc + (Number(curr.horasGastas) || 0), 0);
  const totalAtiv = atividades.length;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startY, pageWidth - 28, 16, 2, 2, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Total de Atividades Lançadas: ${totalAtiv}`, 20, startY + 10);
  doc.text(`Total de Horas Trabalhadas: ${totalHoras.toFixed(1)}h`, pageWidth - 75, startY + 10);

  startY += 24;

  const tableData = atividades.map((a, idx) => [
    idx + 1,
    a.data,
    a.empresaNome,
    a.tipoAtividade,
    a.descricao.length > 55 ? a.descricao.substring(0, 52) + "..." : a.descricao,
    `${a.horasGastas}h`,
    a.tecnicoNome.split(" ")[0],
  ]);

  autoTable(doc, {
    startY,
    head: [["#", "Data", "Empresa / Cliente", "Tipo de Atividade", "Descrição da Tarefa", "Horas", "Técnico"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 36 },
      3: { cellWidth: 32 },
      4: { cellWidth: 56 },
      5: { cellWidth: 14, halign: "center" },
      6: { cellWidth: 20, halign: "center" },
    },
    didDrawPage: (data) => {
      // Rodapé
      const paginaAtual = doc.getCurrentPageInfo().pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `VistorIA SST — Relatório Consolidado de Atividades Técnicas • Página ${paginaAtual}`,
        14,
        pageHeight - 10
      );
    },
  });

  doc.save(`relatorio-atividades-tecnicas-${new Date().toISOString().split("T")[0]}.pdf`);
}
