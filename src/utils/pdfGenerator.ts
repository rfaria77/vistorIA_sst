import { jsPDF } from "jspdf";
import { Apontamento, GrauInfracao, VistoriaState } from "../types";
import { formatarBRL } from "../data/nr28Data";

export interface PDFGenerationOptions {
  estado: VistoriaState;
  logoBase64?: string | null;
  assinaturaInspetor?: string | null;
  assinaturaAcompanhante?: string | null;
}

export async function gerarLaudoPericialPDF(options: PDFGenerationOptions): Promise<Blob> {
  const { estado, logoBase64, assinaturaInspetor, assinaturaAcompanhante } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  function checkPageBreak(requiredHeight: number) {
    if (currentY + requiredHeight > pageHeight - 18) {
      doc.addPage();
      currentY = margin + 7;
      desenharCabecalhoCompacto();
    }
  }

  function desenharCabecalhoCompacto() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("VistorIA SST — Relatório Técnico Pericial & Gestão NR 28", margin, margin + 1);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 3, pageWidth - margin, margin + 3);
    currentY = margin + 9;
  }

  // ==========================================
  // 1. BANNER PRINCIPAL DO CABEÇALHO
  // ==========================================
  const bannerHeight = logoBase64 ? 26 : 24;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, contentWidth, bannerHeight, "F");

  // Faixa decorativa ciano
  doc.setFillColor(14, 165, 233); // sky-500
  doc.rect(margin, currentY + bannerHeight - 1, contentWidth, 1, "F");

  // Logo da consultoria (se houver, alinhada à direita ou esquerda)
  let textStartX = margin + 6;
  if (logoBase64) {
    try {
      const logoW = 28;
      const logoH = 16;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - margin - logoW - 4, currentY + 4, logoW + 2, logoH + 2, 1.5, 1.5, "F");
      doc.addImage(logoBase64, "PNG", pageWidth - margin - logoW - 3, currentY + 5, logoW, logoH);
    } catch {
      // Continua se falhar
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("RELATÓRIO PERICIAL DE VISTORIA & CONFORMIDADES SST", textStartX, currentY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    "Auditoria Pericial em Segurança e Saúde no Trabalho | Enquadramento e Multas NR 28",
    textStartX,
    currentY + 16
  );

  currentY += bannerHeight + 5;

  // ==========================================
  // 2. IDENTIFICAÇÃO DA EMPRESA E AUDITORIA
  // (CORREÇÃO TOTAL: Layout em 2 colunas isoladas com largura estrita e empilhamento vertical)
  // ==========================================
  const infoHeight = 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, infoHeight, 2, 2, "FD");

  // Divisão matemática perfeita em duas colunas com gap de 6mm
  const colWidth = (contentWidth - 10) / 2;
  const col1X = margin + 4;
  const col2X = margin + colWidth + 6;

  // Linha vertical divisória central
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin + colWidth + 5, currentY + 4, margin + colWidth + 5, currentY + infoHeight - 4);

  // Helper com limite estrito de largura para impedir qualquer sobreposição
  function desenharCampoIdentificacao(
    label: string,
    valor: string,
    x: number,
    y: number,
    maxW: number
  ) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(label.toUpperCase(), x, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42); // slate-900
    const linhas = doc.splitTextToSize(valor || "—", maxW);
    doc.text(linhas[0] || "—", x, y + 4);
  }

  // Linha 1 (Y + 6)
  desenharCampoIdentificacao(
    "1. Razão Social / Empresa Auditada",
    estado.empresa || "Não informada",
    col1X,
    currentY + 6,
    colWidth - 2
  );
  desenharCampoIdentificacao(
    "2. Data da Vistoria Técnica",
    estado.data || new Date().toLocaleDateString("pt-BR"),
    col2X,
    currentY + 6,
    colWidth - 2
  );

  // Linha 2 (Y + 16)
  const cnaeTexto = estado.cnae ? `CNAE ${estado.cnae} • Grau de Risco ${estado.grauRisco || 3} (NR 04)` : `Grau de Risco ${estado.grauRisco || 3} (NR 04)`;
  desenharCampoIdentificacao(
    "3. CNPJ / Matrícula Unidade",
    estado.cnpj || "00.000.000/0001-00",
    col1X,
    currentY + 16,
    colWidth - 2
  );
  desenharCampoIdentificacao(
    "4. CNAE & Grau de Risco (NR 04)",
    cnaeTexto,
    col2X,
    currentY + 16,
    colWidth - 2
  );

  // Linha 3 (Y + 26)
  const textoAuditor = `${estado.inspetor} (${estado.regInspetor || "SST"})`;
  desenharCampoIdentificacao(
    "5. Responsável Técnico Auditor",
    textoAuditor,
    col1X,
    currentY + 26,
    colWidth - 2
  );
  desenharCampoIdentificacao(
    "6. Quadro de Colaboradores (NR 28)",
    `${estado.faixa} colaboradores`,
    col2X,
    currentY + 26,
    colWidth - 2
  );

  // Linha 4 (Y + 36)
  const textoAcomp = `${estado.acompNome || "Preposto"} (${estado.acompCargo || "Encarregado"})`;
  desenharCampoIdentificacao(
    "7. Acompanhante Local / Gestão",
    `${textoAcomp} • Tel: ${estado.wpp || "—"}`,
    col1X,
    currentY + 36,
    colWidth - 2
  );
  const totalNC = estado.evidencias.filter((e) => e.status === "Não Conformidade").length;
  const totalConf = estado.evidencias.filter((e) => e.status === "Conformidade").length;
  desenharCampoIdentificacao(
    "8. Resumo de Apontamentos",
    `${estado.evidencias.length} avaliados (${totalNC} Não Conformidades • ${totalConf} Boas Práticas)`,
    col2X,
    currentY + 36,
    colWidth - 2
  );

  currentY += infoHeight + 5;

  // ==========================================
  // 3. CARDS DE IMPACTO FINANCEIRO (KPIs)
  // ==========================================
  const passivoMin = estado.evidencias
    .filter((e) => e.status === "Não Conformidade")
    .reduce((acc, curr) => acc + curr.valorMin, 0);
  const passivoMax = estado.evidencias
    .filter((e) => e.status === "Não Conformidade")
    .reduce((acc, curr) => acc + curr.valorMax, 0);

  const econMin = estado.evidencias
    .filter((e) => e.status === "Conformidade")
    .reduce((acc, curr) => acc + curr.valorMin, 0);
  const econMax = estado.evidencias
    .filter((e) => e.status === "Conformidade")
    .reduce((acc, curr) => acc + curr.valorMax, 0);

  const cardW = (contentWidth - 4) / 2;

  // Card Passivo em Risco
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, currentY, cardW, 17, 2, 2, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28);
  doc.text("PASSIVO EM RISCO FISCAL ESTIMADO (NR 28)", margin + 4, currentY + 5.5);
  doc.setFontSize(10.5);
  doc.text(`${formatarBRL(passivoMin)} a ${formatarBRL(passivoMax)}`, margin + 4, currentY + 12.5);

  // Card Economia Gerada
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(margin + cardW + 4, currentY, cardW, 17, 2, 2, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 128, 61);
  doc.text("ECONOMIA GERADA / RISCO EVITADO (BOAS PRÁTICAS)", margin + cardW + 8, currentY + 5.5);
  doc.setFontSize(10.5);
  doc.text(`${formatarBRL(econMin)} a ${formatarBRL(econMax)}`, margin + cardW + 8, currentY + 12.5);

  currentY += 22;

  // ==========================================
  // 4. PAINEL GRÁFICO DA MULTA & RISCO NR 28
  // (NOVO: Gráficos de barras comparativas, distribuição por NR e matriz de severidade)
  // ==========================================
  checkPageBreak(58);

  const graficosBoxH = 54;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, graficosBoxH, 2, 2, "FD");

  // Faixa do título da seção gráfica
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("DIAGNÓSTICO GRÁFICO DE MULTAS E EXPOSIÇÃO FINANCEIRA (NR 28)", margin + 4, currentY + 5);

  const innerChartY = currentY + 10;
  const leftColW = 86;
  const rightColX = margin + leftColW + 6;
  const rightColW = contentWidth - leftColW - 8;

  // Divisória sutil entre os dois gráficos
  doc.setDrawColor(226, 232, 240);
  doc.line(rightColX - 3, innerChartY, rightColX - 3, currentY + graficosBoxH - 3);

  // --- SUB-GRÁFICO 1 (ESQUERDA): Balanço Passivo vs Economia ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Balanço Financeiro Proporcional:", margin + 4, innerChartY + 2);

  const totalFinanceiro = (passivoMax + econMax) || 1;
  const pctPassivo = Math.min(100, Math.round((passivoMax / totalFinanceiro) * 100));
  const pctEcon = 100 - pctPassivo;

  const barTrackW = leftColW - 8;
  const barY = innerChartY + 6;

  // Barra de Passivo (Vermelha)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(185, 28, 28);
  doc.text(`Passivo em Risco: ${formatarBRL(passivoMax)} (${pctPassivo}%)`, margin + 4, barY + 3);

  doc.setFillColor(254, 226, 226); // trilho fundo
  doc.roundedRect(margin + 4, barY + 5, barTrackW, 5.5, 1, 1, "F");
  const fillPassivoW = Math.max(2, (barTrackW * pctPassivo) / 100);
  doc.setFillColor(220, 38, 38); // vermelho vivo
  doc.roundedRect(margin + 4, barY + 5, fillPassivoW, 5.5, 1, 1, "F");

  // Barra de Economia (Verde)
  const bar2Y = barY + 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(21, 128, 61);
  doc.text(`Economia c/ Boas Práticas: ${formatarBRL(econMax)} (${pctEcon}%)`, margin + 4, bar2Y + 3);

  doc.setFillColor(220, 252, 231); // trilho fundo
  doc.roundedRect(margin + 4, bar2Y + 5, barTrackW, 5.5, 1, 1, "F");
  const fillEconW = Math.max(2, (barTrackW * pctEcon) / 100);
  doc.setFillColor(22, 163, 74); // verde vivo
  doc.roundedRect(margin + 4, bar2Y + 5, fillEconW, 5.5, 1, 1, "F");

  // Indicador de Severidade por Grau (I1 a I4)
  const matrizY = bar2Y + 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Classificação por Grau de Infração:", margin + 4, matrizY);

  const graus: GrauInfracao[] = ["I1", "I2", "I3", "I4"];
  const grauLabels = { I1: "I1 (Leve)", I2: "I2 (Média)", I3: "I3 (Grave)", I4: "I4 (Crítico)" };
  const grauW = (barTrackW - 6) / 4;

  graus.forEach((g, idx) => {
    const gx = margin + 4 + idx * (grauW + 2);
    const count = estado.evidencias.filter((e) => e.infracao === g && e.status === "Não Conformidade").length;
    const isHigh = g === "I4" || g === "I3";

    doc.setFillColor(count > 0 ? (isHigh ? 254 : 254) : 241, count > 0 ? (isHigh ? 226 : 240) : 245, count > 0 ? (isHigh ? 226 : 230) : 249);
    doc.setDrawColor(count > 0 ? (isHigh ? 248 : 251) : 203, count > 0 ? (isHigh ? 113 : 191) : 213, count > 0 ? (isHigh ? 113 : 36) : 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(gx, matrizY + 2, grauW, 7, 1, 1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(count > 0 ? (isHigh ? 185 : 180) : 100, count > 0 ? (isHigh ? 28 : 83) : 116, count > 0 ? (isHigh ? 28 : 9) : 139);
    doc.text(grauLabels[g], gx + grauW / 2, matrizY + 4.5, { align: "center" });
    doc.setFontSize(6.5);
    doc.text(`${count} itens`, gx + grauW / 2, matrizY + 7.5, { align: "center" });
  });

  // --- SUB-GRÁFICO 2 (DIREITA): Passivo por Norma Regulamentadora (NR) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Passivo Financeiro por NR Auditada:", rightColX, innerChartY + 2);

  // Agrupar passivo por NR
  const nrMap: Record<string, { passivo: number; itens: number }> = {};
  estado.evidencias.forEach((ev) => {
    if (ev.status === "Não Conformidade") {
      if (!nrMap[ev.nr]) nrMap[ev.nr] = { passivo: 0, itens: 0 };
      nrMap[ev.nr].passivo += ev.valorMax;
      nrMap[ev.nr].itens += 1;
    }
  });

  const nrList = Object.entries(nrMap)
    .map(([nr, dados]) => ({ nr, ...dados }))
    .sort((a, b) => b.passivo - a.passivo);

  if (nrList.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Nenhuma não conformidade com penalidade financeira registrada.", rightColX, innerChartY + 12);
  } else {
    const maxNrPassivo = Math.max(...nrList.map((n) => n.passivo), 1);
    const maxBars = Math.min(4, nrList.length);

    for (let b = 0; b < maxBars; b++) {
      const itemNr = nrList[b];
      const by = innerChartY + 7 + b * 9.5;
      const barRatio = Math.max(0.08, itemNr.passivo / maxNrPassivo);
      const nrBarW = (rightColW - 32) * barRatio;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(15, 23, 42);
      doc.text(`${itemNr.nr}`, rightColX, by + 3.2);

      // Barra
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(rightColX + 13, by, rightColW - 38, 4.5, 1, 1, "F");
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(rightColX + 13, by, nrBarW, 4.5, 1, 1, "F");

      // Valor formatado
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.2);
      doc.setTextColor(185, 28, 28);
      doc.text(`${formatarBRL(itemNr.passivo)}`, rightColX + rightColW - 2, by + 3.2, { align: "right" });
    }
  }

  currentY += graficosBoxH + 6;

  // ==========================================
  // 5. DETALHAMENTO PERICIAL DOS APONTAMENTOS
  // ==========================================
  checkPageBreak(18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("QUADRO ANALÍTICO DE EVIDÊNCIAS & CONFORMIDADES PERICIAIS", margin, currentY);
  currentY += 4;

  for (let i = 0; i < estado.evidencias.length; i++) {
    const ev: Apontamento = estado.evidencias[i];
    const isNC = ev.status === "Não Conformidade";
    const boxHeight = ev.fotoDataUrl ? 80 : 38;

    checkPageBreak(boxHeight + 6);

    // Borda e fundo do card
    doc.setFillColor(isNC ? 254 : 240, isNC ? 242 : 253, isNC ? 242 : 244);
    doc.setDrawColor(isNC ? 248 : 187, isNC ? 113 : 247, isNC ? 113 : 208);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, "FD");

    // Tag de status
    doc.setFillColor(isNC ? 220 : 5, isNC ? 38 : 150, isNC ? 38 : 105);
    doc.roundedRect(margin + 3, currentY + 3, 46, 5.5, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(255, 255, 255);
    const tagText = isNC ? `NÃO CONFORMIDADE (${ev.prioridade})` : "BOA PRÁTICA REGISTRADA";
    doc.text(tagText, margin + 4.5, currentY + 6.8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Item #${i + 1}: ${ev.nr} (Item ${ev.itemNr}) — Grau ${ev.infracao} (${ev.tipo === "M" ? "Medicina" : "Segurança"})`,
      margin + 53,
      currentY + 7.2
    );

    // Linhas descritivas com quebra de texto estrita
    let textY = currentY + 13.5;
    doc.setFontSize(7.2);

    // Requisito Legal
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Requisito Legal:", margin + 4, textY);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(ev.descricao, contentWidth - 44);
    doc.text(descLines, margin + 28, textY);
    textY += Math.max(4.5, descLines.length * 3.5);

    // Cenário Observado
    doc.setFont("helvetica", "bold");
    doc.text("Cenário de Campo:", margin + 4, textY);
    doc.setFont("helvetica", "normal");
    const cenarioLines = doc.splitTextToSize(ev.descricaoCenario || "Constatado in loco durante inspeção técnica.", contentWidth - 44);
    doc.text(cenarioLines, margin + 28, textY);
    textY += Math.max(4.5, cenarioLines.length * 3.5);

    // Medida Preventiva
    doc.setFont("helvetica", "bold");
    doc.text("Medida Preventiva:", margin + 4, textY);
    doc.setFont("helvetica", "normal");
    const acaoLines = doc.splitTextToSize(ev.acaoCorretiva || "Adequar aos ditames legais e preceitos da norma regulamentadora.", contentWidth - 44);
    doc.text(acaoLines, margin + 28, textY);
    textY += Math.max(4.5, acaoLines.length * 3.5);

    // Valor da Multa
    doc.setFont("helvetica", "bold");
    doc.text("Impacto NR 28:", margin + 4, textY);
    doc.setTextColor(isNC ? 185 : 21, isNC ? 28 : 128, isNC ? 28 : 61);
    doc.text(
      `${formatarBRL(ev.valorMin)} a ${formatarBRL(ev.valorMax)} ${isNC ? "(Risco de Penalidade Fiscal)" : "(Economia com Proteção)"}`,
      margin + 28,
      textY
    );
    textY += 4.5;

    // Evidência Fotográfica com carimbo pericial
    if (ev.fotoDataUrl) {
      try {
        const photoY = textY + 2.5;
        const photoW = 62;
        const photoH = 37;
        doc.addImage(ev.fotoDataUrl, "JPEG", margin + 4, photoY, photoW, photoH);

        doc.setFontSize(6.2);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        doc.text("Evidência fotográfica pericial com Carimbo Forense SST e geolocalização auditada.", margin + photoW + 8, photoY + 10);
        doc.text(`Registro Oficial: ${ev.criadoEm}`, margin + photoW + 8, photoY + 16);
        if (ev.coordenadasGps) {
          doc.text(`GPS: Lat ${ev.coordenadasGps.lat.toFixed(5)}, Lng ${ev.coordenadasGps.lng.toFixed(5)}`, margin + photoW + 8, photoY + 22);
        }
      } catch {
        // Continua se imagem falhar
      }
    }

    currentY += boxHeight + 4;
  }

  // ==========================================
  // 6. PLANO DE AÇÃO CORRETIVA (NR 01 / PGR)
  // (NOVO: Datas em aberto para preenchimento manual com caneta pelo gestor)
  // ==========================================
  checkPageBreak(50);
  currentY += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("PLANO DE AÇÃO CORRETIVA & CRONOGRAMA DE ADEQUAÇÃO (NR 01 / PGR)", margin, currentY);
  currentY += 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Matriz executiva de adequação preventiva. Preencha manualmente os campos de datas e vistos para controle e fiscalização in loco.",
    margin,
    currentY
  );
  currentY += 4;

  // Cabeçalho da Tabela do Plano de Ação
  // Larguras das colunas: 22 + 62 + 28 + 23 + 23 + 24 = 182mm (contentWidth)
  const colPlanW = {
    itemNr: 22,
    acao: 62,
    resp: 28,
    prazo: 23,
    concl: 23,
    visto: 24,
  };

  const colX = {
    itemNr: margin,
    acao: margin + colPlanW.itemNr,
    resp: margin + colPlanW.itemNr + colPlanW.acao,
    prazo: margin + colPlanW.itemNr + colPlanW.acao + colPlanW.resp,
    concl: margin + colPlanW.itemNr + colPlanW.acao + colPlanW.resp + colPlanW.prazo,
    visto: margin + colPlanW.itemNr + colPlanW.acao + colPlanW.resp + colPlanW.prazo + colPlanW.concl,
  };

  const tableHeaderH = 8.5;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, currentY, contentWidth, tableHeaderH, "F");

  // Divisores verticais do cabeçalho
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.2);
  doc.line(colX.acao, currentY, colX.acao, currentY + tableHeaderH);
  doc.line(colX.resp, currentY, colX.resp, currentY + tableHeaderH);
  doc.line(colX.prazo, currentY, colX.prazo, currentY + tableHeaderH);
  doc.line(colX.concl, currentY, colX.concl, currentY + tableHeaderH);
  doc.line(colX.visto, currentY, colX.visto, currentY + tableHeaderH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(255, 255, 255);

  doc.text("ITEM / NORMA", colX.itemNr + 2, currentY + 5.2);
  doc.text("AÇÃO CORRETIVA RECOMENDADA", colX.acao + 2, currentY + 5.2);
  doc.text("RESPONSÁVEL", colX.resp + 2, currentY + 5.2);

  // Prazo Limite (duas linhas bem alinhadas e centralizadas)
  doc.setFontSize(5.5);
  doc.text("PRAZO LIMITE", colX.prazo + colPlanW.prazo / 2, currentY + 3.4, { align: "center" });
  doc.setFontSize(4.5);
  doc.setTextColor(203, 213, 225);
  doc.text("(DATA PREVISTA)", colX.prazo + colPlanW.prazo / 2, currentY + 6.6, { align: "center" });

  // Data Conclusão
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.text("CONCLUSÃO", colX.concl + colPlanW.concl / 2, currentY + 3.4, { align: "center" });
  doc.setFontSize(4.5);
  doc.setTextColor(203, 213, 225);
  doc.text("(DATA EFETIVA)", colX.concl + colPlanW.concl / 2, currentY + 6.6, { align: "center" });

  // Visto
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.text("VISTO / RUBRICA", colX.visto + colPlanW.visto / 2, currentY + 5.2, { align: "center" });

  currentY += tableHeaderH;

  // Linhas do Plano de Ação (itens com Não Conformidade, ou todos se não houver NC)
  const itensPlano = estado.evidencias.filter((e) => e.status === "Não Conformidade");
  const itensParaExibir = itensPlano.length > 0 ? itensPlano : estado.evidencias;

  if (itensParaExibir.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, currentY, contentWidth, 12, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Nenhum item cadastrado para inclusão no Plano de Ação.", margin + contentWidth / 2, currentY + 7, { align: "center" });
    currentY += 14;
  } else {
    for (let p = 0; p < itensParaExibir.length; p++) {
      const item = itensParaExibir[p];

      // Formatar quebras de linha com fonte exata antes da medição
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.0);
      const safeAcaoW = colPlanW.acao - 4; // margem segura de 4mm
      const acaoLines = doc.splitTextToSize(
        item.acaoCorretiva || item.descricao || "Adequar conforme norma regulamentadora.",
        safeAcaoW
      );

      const respNome = estado.acompNome || "Encarregado da Obra";
      const safeRespW = colPlanW.resp - 4;
      const respLines = doc.splitTextToSize(respNome, safeRespW);

      const maxLines = Math.max(acaoLines.length, respLines.length + 1);
      const rowH = Math.max(14, maxLines * 3.3 + 5);

      checkPageBreak(rowH + 4);

      // Fundo zebrado
      doc.setFillColor(p % 2 === 0 ? 255 : 248, p % 2 === 0 ? 255 : 250, p % 2 === 0 ? 255 : 252);
      doc.rect(margin, currentY, contentWidth, rowH, "F");

      // Divisores verticais de colunas
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(colX.acao, currentY, colX.acao, currentY + rowH);
      doc.line(colX.resp, currentY, colX.resp, currentY + rowH);
      doc.line(colX.prazo, currentY, colX.prazo, currentY + rowH);
      doc.line(colX.concl, currentY, colX.concl, currentY + rowH);
      doc.line(colX.visto, currentY, colX.visto, currentY + rowH);

      // Borda externa da linha
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(margin, currentY, contentWidth, rowH, "D");

      // Coluna 1: Item / Norma
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(15, 23, 42);
      doc.text(`#${p + 1} ${item.nr}`, colX.itemNr + 2, currentY + 4.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Item ${item.itemNr}`, colX.itemNr + 2, currentY + 8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(item.status === "Não Conformidade" ? 220 : 22, item.status === "Não Conformidade" ? 38 : 163, item.status === "Não Conformidade" ? 38 : 74);
      doc.text(item.prioridade || "Alta", colX.itemNr + 2, currentY + 11.5);

      // Coluna 2: Ação Corretiva (delimitada e segura)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.0);
      doc.setTextColor(30, 41, 59);
      doc.text(acaoLines, colX.acao + 2, currentY + 4.5);

      // Coluna 3: Responsável
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.0);
      doc.setTextColor(71, 85, 105);
      doc.text(respLines, colX.resp + 2, currentY + 4.5);
      doc.setFontSize(5.2);
      doc.setTextColor(148, 163, 184);
      doc.text("(Manutenção / SST)", colX.resp + 2, currentY + 4.5 + respLines.length * 3.3);

      // Coluna 4: Prazo Limite (ABERTO PARA PREENCHIMENTO MANUAL: ____/____/_______)
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      const boxPrazoW = colPlanW.prazo - 4;
      const boxPrazoX = colX.prazo + 2;
      doc.roundedRect(boxPrazoX, currentY + 3.5, boxPrazoW, 7, 1, 1, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.4);
      doc.setTextColor(148, 163, 184);
      doc.text("____/____/_______", boxPrazoX + boxPrazoW / 2, currentY + 8, { align: "center" });

      // Coluna 5: Data Conclusão (ABERTO PARA PREENCHIMENTO MANUAL: ____/____/_______)
      const boxConclW = colPlanW.concl - 4;
      const boxConclX = colX.concl + 2;
      doc.roundedRect(boxConclX, currentY + 3.5, boxConclW, 7, 1, 1, "FD");
      doc.text("____/____/_______", boxConclX + boxConclW / 2, currentY + 8, { align: "center" });

      // Coluna 6: Visto / Rubrica (ABERTO PARA PREENCHIMENTO MANUAL)
      const vistoW = colPlanW.visto - 5;
      const vistoX = colX.visto + 2.5;
      doc.line(vistoX, currentY + 8.5, vistoX + vistoW, currentY + 8.5);
      doc.setFontSize(5);
      doc.setTextColor(148, 163, 184);
      doc.text("(Rubrica)", vistoX + vistoW / 2, currentY + 11.5, { align: "center" });

      currentY += rowH;
    }
  }

  currentY += 6;

  // ==========================================
  // 7. TERMO DE CIÊNCIA E ASSINATURAS
  // ==========================================
  checkPageBreak(56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("TERMO DE CIÊNCIA, ENCERRAMENTO E ASSINATURAS", margin, currentY);
  currentY += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  const termoTexto =
    "As partes abaixo qualificadas atestam haver realizado a vistoria pericial técnica nas dependências da empresa, tomando ciência dos apontamentos, do diagnóstico financeiro da NR 28 e do cronograma do Plano de Ação para imediata implementação e elisão de riscos.";
  const termoLines = doc.splitTextToSize(termoTexto, contentWidth);
  doc.text(termoLines, margin, currentY);
  currentY += termoLines.length * 3.6 + 4;

  // Caixas de Assinaturas (Layout e Visual Idênticos para Auditor e Acompanhante)
  const sigW = (contentWidth - 6) / 2;
  const sigBoxH = 37;

  // Caixa 1: Auditor SST
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, sigW, sigBoxH, 2, 2, "FD");

  // Faixa Superior de Identificação (Auditor)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + 0.5, currentY + 0.5, sigW - 1, 6.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(51, 65, 85);
  doc.text("RESPONSÁVEL TÉCNICO AUDITOR (SST)", margin + sigW / 2, currentY + 4.8, { align: "center" });

  if (assinaturaInspetor) {
    try {
      doc.addImage(assinaturaInspetor, "PNG", margin + 6, currentY + 8, sigW - 12, 15);
    } catch {
      // ignore
    }
  }

  doc.setLineWidth(0.3);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 6, currentY + 25, margin + sigW - 6, currentY + 25);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(estado.inspetor || "Auditor / Perito SST", margin + sigW / 2, currentY + 29.5, { align: "center" });

  doc.setFontSize(6.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(estado.regInspetor || "Engenharia / Segurança do Trabalho", margin + sigW / 2, currentY + 33.5, { align: "center" });

  // Caixa 2: Acompanhante da Empresa (Rigorasamente Idêntica em cores, bordas e alinhamento)
  const sig2X = margin + sigW + 6;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.setLineWidth(0.4);
  doc.roundedRect(sig2X, currentY, sigW, sigBoxH, 2, 2, "FD");

  // Faixa Superior de Identificação (Acompanhante)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(sig2X + 0.5, currentY + 0.5, sigW - 1, 6.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(51, 65, 85);
  doc.text("ACOMPANHANTE / REPRESENTANTE DA EMPRESA", sig2X + sigW / 2, currentY + 4.8, { align: "center" });

  if (assinaturaAcompanhante) {
    try {
      doc.addImage(assinaturaAcompanhante, "PNG", sig2X + 6, currentY + 8, sigW - 12, 15);
    } catch {
      // ignore
    }
  }

  doc.setLineWidth(0.3);
  doc.setDrawColor(148, 163, 184);
  doc.line(sig2X + 6, currentY + 25, sig2X + sigW - 6, currentY + 25);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(estado.acompNome || "Representante da Empresa", sig2X + sigW / 2, currentY + 29.5, { align: "center" });

  doc.setFontSize(6.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(estado.acompCargo || "Preposto / Acompanhante da Vistoria", sig2X + sigW / 2, currentY + 33.5, { align: "center" });

  // ==========================================
  // 8. RODAPÉ E NUMERAÇÃO DE PÁGINAS
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text("Emitido via VistorIA SST — Auditoria Pericial & Gestão NR 28", margin, pageHeight - 7);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  return doc.output("blob");
}
