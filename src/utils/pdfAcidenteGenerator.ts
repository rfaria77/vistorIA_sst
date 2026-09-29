import { jsPDF } from "jspdf";
import { AcidenteInvestigacaoState } from "../typesAcidente";

export interface AcidentePDFOptions {
  investigacao: AcidenteInvestigacaoState;
  logoBase64?: string | null;
  assinaturaInvestigador?: string | null;
}

export async function gerarRelatorioAcidentePDF(options: AcidentePDFOptions): Promise<Blob> {
  const { investigacao, logoBase64 } = options;
  const assinaturaInvestigador = investigacao.assinaturaInvestigador || options.assinaturaInvestigador;
  const assinaturaGestor = investigacao.assinaturaGestor;
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
    doc.text("VistorIA SST — Relatório Oficial de Investigação de Acidente / Incidente", margin, margin + 1);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 3, pageWidth - margin, margin + 3);
    currentY = margin + 9;
  }

  // ==========================================
  // 1. BANNER PRINCIPAL DO CABEÇALHO
  // ==========================================
  const bannerHeight = 26;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, contentWidth, bannerHeight, "F");

  // Faixa decorativa vermelha/âmbar para acidente
  doc.setFillColor(225, 29, 72); // rose-600
  doc.rect(margin, currentY + bannerHeight - 1, contentWidth, 1, "F");

  let textStartX = margin + 6;
  if (logoBase64) {
    try {
      const logoW = 28;
      const logoH = 16;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - margin - logoW - 4, currentY + 4, logoW + 2, logoH + 2, 1.5, 1.5, "F");
      doc.addImage(logoBase64, "PNG", pageWidth - margin - logoW - 3, currentY + 5, logoW, logoH);
    } catch {
      // Ignorar se falhar
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("RELATÓRIO TÉCNICO DE INVESTIGAÇÃO DE ACIDENTE / INCIDENTE", textStartX, currentY + 8.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text("Análise de Causa Raiz, Fatores Contribuyentes e Plano de Ação Corretiva (NR 01 / OSHA)", textStartX, currentY + 15);

  currentY += bannerHeight + 5;

  // ==========================================
  // 2. DADOS GERAIS DO EVENTO
  // ==========================================
  checkPageBreak(40);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 36, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("1. DADOS GERAIS DA OCORRÊNCIA", margin + 4, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const colX1 = margin + 4;
  const colX2 = margin + 100;

  doc.text(`Data do Acidente: ${investigacao.dataAcidente || "—"} às ${investigacao.horaAcidente || "—"}`, colX1, currentY + 14);
  doc.text(`Local / Setor: ${investigacao.localSetor || "—"}`, colX1, currentY + 21);
  doc.text(
    `Tipo de Ocorrência: ${
      investigacao.tipoAcidente === "pessoal"
        ? "Dano Pessoal"
        : investigacao.tipoAcidente === "material"
        ? "Dano Material"
        : "Dano Pessoal e Material"
    }`,
    colX1,
    currentY + 28
  );

  doc.text(`Data de Emissão: ${investigacao.dataEmissao || new Date().toLocaleDateString("pt-BR")}`, colX2, currentY + 14);
  doc.text(`Metodologia: ${investigacao.metodoAnalise.toUpperCase().replace("_", " ")}`, colX2, currentY + 21);

  currentY += 42;

  // ==========================================
  // 3. SEÇÃO ESPECÍFICA (VÍTIMA OU MATERIAL)
  // ==========================================
  if (investigacao.tipoAcidente === "pessoal" || investigacao.tipoAcidente === "ambos") {
    checkPageBreak(45);
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, currentY, contentWidth, 40, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(155, 28, 28);
    doc.text("2. DADOS DA VÍTIMA E LESÃO", margin + 4, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    doc.text(`Nome da Vítima: ${investigacao.vitimaNome || "Não informado"}`, colX1, currentY + 14);
    doc.text(`Cargo / Função: ${investigacao.vitimaCargo || "—"}`, colX1, currentY + 21);
    doc.text(`Tempo na Empresa: ${investigacao.vitimaTempoEmpresa || "—"}`, colX1, currentY + 28);

    doc.text(`Tipo de Lesão: ${investigacao.tipoLesao || "—"}`, colX2, currentY + 14);
    doc.text(`Parte Atingida: ${investigacao.parteCorpoAtingida || "—"}`, colX2, currentY + 21);
    doc.text(
      `Afastamento: ${investigacao.afastamentoDias || 0} dias ${investigacao.houveObito ? " | ⚠️ HOUVE ÓBITO" : ""}`,
      colX2,
      currentY + 28
    );

    currentY += 46;
  }

  if (investigacao.tipoAcidente === "material" || investigacao.tipoAcidente === "ambos") {
    checkPageBreak(35);
    doc.setFillColor(254, 252, 232); // amber-50
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(161, 98, 7);
    doc.text("2B. DADOS DO DANO MATERIAL / PATRIMONIAL", margin + 4, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    doc.text(`Natureza do Dano: ${investigacao.tipoDanoMaterial || "Não informado"}`, colX1, currentY + 14);
    doc.text(
      `Prejuízo Estimado: ${
        investigacao.estimativaPrejuizoBRL
          ? investigacao.estimativaPrejuizoBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "Não mensurado"
      }`,
      colX1,
      currentY + 22
    );

    currentY += 38;
  }

  // ==========================================
  // 4. DESCRIÇÃO CRONOLÓGICA DOS FATOS
  // ==========================================
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("3. RELATO CRONOLÓGICO DOS FATOS", margin, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(investigacao.descricaoFatos || "Nenhum relato informado.", contentWidth);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, descLines.length * 4.5 + 6, 2, 2, "FD");
  doc.text(descLines, margin + 4, currentY + 4.5);
  currentY += descLines.length * 4.5 + 12;

  // ==========================================
  // 4. EVIDÊNCIA FOTOGRÁFICA DO ACIDENTE E MEDIDAS ANTERIORES (MÚLTIPLAS FOTOS)
  // ==========================================
  const totalEvidencias = (investigacao.fotoEvidenciaDataUrl ? 1 : 0) + (investigacao.fotosEvidenciaLista?.length || 0);
  const totalMedidas = (investigacao.medidasAntesFotoDataUrl ? 1 : 0) + (investigacao.medidasAntesFotosLista?.length || 0) + (investigacao.medidasAntesDescricao ? 1 : 0);

  if (totalEvidencias > 0 || totalMedidas > 0) {
    checkPageBreak(70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("4. REGISTRO FOTOGRÁFICO DE EVIDÊNCIA E MEDIDAS PRÉVIAS", margin, currentY);
    currentY += 6;

    // Seção de Fotos de Evidência do Acidente
    if (totalEvidencias > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(155, 28, 28);
      doc.text("Fotos Evidenciando o Acidente:", margin, currentY);
      currentY += 5;

      const todasEvidencias = [
        ...(investigacao.fotoEvidenciaDataUrl ? [investigacao.fotoEvidenciaDataUrl] : []),
        ...(investigacao.fotosEvidenciaLista || []),
      ];

      let imgW = 40;
      let imgH = 30;
      let xPos = margin;

      todasEvidencias.forEach((imgUrl, idx) => {
        if (xPos + imgW > pageWidth - margin) {
          xPos = margin;
          currentY += imgH + 6;
          checkPageBreak(imgH + 10);
        }
        try {
          doc.addImage(imgUrl, "JPEG", xPos, currentY, imgW, imgH);
          doc.setDrawColor(200, 200, 200);
          doc.rect(xPos, currentY, imgW, imgH);
        } catch {}
        xPos += imgW + 6;
      });

      currentY += imgH + 8;
    }

    // Seção de Medidas Antes do Acidente
    if (totalMedidas > 0) {
      checkPageBreak(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      doc.text("Medidas / Condições Existentes Antes do Acidente:", margin, currentY);
      currentY += 5;

      if (investigacao.medidasAntesDescricao) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        const descLines = doc.splitTextToSize(investigacao.medidasAntesDescricao, contentWidth);
        doc.text(descLines, margin, currentY);
        currentY += descLines.length * 4 + 4;
      }

      const todasMedidasFotos = [
        ...(investigacao.medidasAntesFotoDataUrl ? [investigacao.medidasAntesFotoDataUrl] : []),
        ...(investigacao.medidasAntesFotosLista || []),
      ];

      if (todasMedidasFotos.length > 0) {
        let imgW = 40;
        let imgH = 30;
        let xPos = margin;

        todasMedidasFotos.forEach((imgUrl) => {
          if (xPos + imgW > pageWidth - margin) {
            xPos = margin;
            currentY += imgH + 6;
            checkPageBreak(imgH + 10);
          }
          try {
            doc.addImage(imgUrl, "JPEG", xPos, currentY, imgW, imgH);
            doc.setDrawColor(200, 200, 200);
            doc.rect(xPos, currentY, imgW, imgH);
          } catch {}
          xPos += imgW + 6;
        });

        currentY += imgH + 8;
      }
    }

    currentY += 4;
  }

  // ==========================================
  // 5. CAUSA RAIZ E FATORES CONTRIBUTIVOS
  // ==========================================
  checkPageBreak(55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("5. ANÁLISE DE CAUSA RAIZ & FATORES CONTRIBUTIVOS", margin, currentY);
  currentY += 5;

  const causaLines = doc.splitTextToSize(investigacao.causaRaizPrincipal || "Não informada.", contentWidth);
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, currentY, contentWidth, causaLines.length * 4.5 + 6, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(155, 28, 28);
  doc.text("Causa Raiz Identificada:", margin + 4, currentY + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(causaLines, margin + 4, currentY + 9);
  currentY += causaLines.length * 4.5 + 14;

  // ==========================================
  // 6. PLANO DE AÇÃO CORRETIVA E PREVENTIVA
  // ==========================================
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("6. PLANO DE AÇÃO CORRETIVA & PREVENTIVA (CAPA)", margin, currentY);
  currentY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Ações Imediatas:", margin, currentY);
  currentY += 4;
  doc.setFont("helvetica", "normal");
  const acoesImedLines = doc.splitTextToSize(investigacao.acoesImediatas || "—", contentWidth);
  doc.text(acoesImedLines, margin, currentY);
  currentY += acoesImedLines.length * 4 + 6;

  doc.setFont("helvetica", "bold");
  doc.text("Ações Definitivas:", margin, currentY);
  currentY += 4;
  doc.setFont("helvetica", "normal");
  const acoesDefLines = doc.splitTextToSize(investigacao.acoesCorretivasDefinitivas || "—", contentWidth);
  doc.text(acoesDefLines, margin, currentY);
  currentY += acoesDefLines.length * 4 + 8;

  doc.text(`Responsável pela Implementação: ${investigacao.responsavelImplementacao || "—"} | Prazo: ${investigacao.prazoDias || 15} dias`, margin, currentY);
  currentY += 12;

  // ==========================================
  // 7. ASSINATURAS DUPLAS (INVESTIGADOR E RESPONSÁVEL DA EMPRESA)
  // ==========================================
  checkPageBreak(50);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("7. ENCERRAMENTO E ASSINATURAS RESPONSÁVEIS", margin, currentY);
  currentY += 16;

  const sigW = 80;
  const sigX1 = margin + 4;
  const sigX2 = margin + contentWidth - sigW - 4;

  // Assinatura 1: Investigador
  if (assinaturaInvestigador) {
    try {
      doc.addImage(assinaturaInvestigador, "PNG", sigX1 + 10, currentY - 12, 60, 14);
    } catch {}
  }
  doc.setDrawColor(100, 116, 139);
  doc.line(sigX1, currentY + 4, sigX1 + sigW, currentY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(investigacao.investigadorNome || "Investigador SST", sigX1 + sigW / 2, currentY + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${investigacao.investigadorCargo || "Técnico/Engenheiro SST"} • Reg: ${investigacao.investigadorRegistro || "—"}`, sigX1 + sigW / 2, currentY + 12, { align: "center" });

  // Assinatura 2: Responsável da Empresa
  if (investigacao.assinaturaGestor) {
    try {
      doc.addImage(investigacao.assinaturaGestor, "PNG", sigX2 + 10, currentY - 12, 60, 14);
    } catch {}
  }
  doc.setDrawColor(100, 116, 139);
  doc.line(sigX2, currentY + 4, sigX2 + sigW, currentY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(investigacao.responsavelEmpresaNome || "Responsável pela Empresa", sigX2 + sigW / 2, currentY + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${investigacao.responsavelEmpresaCargo || "Gestor / Diretor Operacional"}`, sigX2 + sigW / 2, currentY + 12, { align: "center" });

  return doc.output("blob");
}
