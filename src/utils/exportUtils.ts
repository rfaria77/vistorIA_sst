import { Empresa, LaudoEmitido, ProgramacaoRelatorio, RascunhoVistoria, UsuarioAuditor } from "../types";

/**
 * Realiza o backup completo em lote de todos os dados periciais (rascunhos, empresas, laudos, usuários e programações) em formato JSON.
 */
export function exportarBackupJson(
  empresas: Empresa[],
  rascunhos: RascunhoVistoria[],
  laudos: LaudoEmitido[],
  usuarios: UsuarioAuditor[],
  programacoes: ProgramacaoRelatorio[]
): void {
  const payload = {
    sistema: "VistorIA SST - Auditoria & Gestão NR 28",
    versao: "2.5",
    dataExportacao: new Date().toISOString(),
    dataFormatadaPT: new Date().toLocaleString("pt-BR"),
    estatisticas: {
      totalEmpresas: empresas.length,
      totalRascunhos: rascunhos.length,
      totalLaudosAtivos: laudos.length,
      totalUsuarios: usuarios.length,
      totalProgramacoes: programacoes.length,
    },
    dadosPericiais: {
      empresas,
      rascunhos,
      laudos,
      usuarios,
      programacoes,
    },
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  const dataIso = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("download", `backup-pericial-vistorias-sst-${dataIso}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Exporta a lista de empresas cadastradas para CSV (compatível com Excel).
 */
export function exportarEmpresasCsv(empresas: Empresa[]): void {
  const headers = [
    "ID",
    "Nome da Empresa",
    "Tipo Inscricao",
    "Documento (CNPJ/CAEPF/CEI)",
    "Faixa de Funcionarios",
    "Contato WhatsApp",
    "Endereco",
    "CNAE",
    "Descricao CNAE",
    "Grau de Risco",
  ];

  const rows = empresas.map((e) => [
    e.id,
    `"${(e.nome || "").replace(/"/g, '""')}"`,
    e.tipoInscricao || "CNPJ",
    `"${(e.cnpj || "").replace(/"/g, '""')}"`,
    `"${(e.faixaFuncionarios || "").replace(/"/g, '""')}"`,
    `"${(e.contatoWpp || "").replace(/"/g, '""')}"`,
    `"${(e.endereco || "").replace(/"/g, '""')}"`,
    `"${(e.cnae || "").replace(/"/g, '""')}"`,
    `"${(e.cnaeDescricao || "").replace(/"/g, '""')}"`,
    e.grauRisco || 3,
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const dataIso = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", `empresas-clientes-${dataIso}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exporta os rascunhos / vistorias em andamento para CSV.
 */
export function exportarRascunhosCsv(rascunhos: RascunhoVistoria[]): void {
  const headers = [
    "ID Rascunho",
    "Empresa",
    "CNPJ",
    "Data Atualizacao",
    "Inspetor Responsavel",
    "Total Evidencias / Apontamentos",
    "Acompanhante",
  ];

  const rows = rascunhos.map((r) => [
    r.id,
    `"${(r.empresa || "").replace(/"/g, '""')}"`,
    `"${(r.estado?.cnpj || "").replace(/"/g, '""')}"`,
    `"${(r.dataAtualizacao || "").replace(/"/g, '""')}"`,
    `"${(r.estado?.inspetor || "").replace(/"/g, '""')}"`,
    r.estado?.evidencias?.length || 0,
    `"${(r.estado?.acompNome || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const dataIso = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", `rascunhos-vistorias-${dataIso}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exporta os laudos ativos / emitidos para CSV.
 */
export function exportarLaudosCsv(laudos: LaudoEmitido[]): void {
  const headers = [
    "Numero Laudo",
    "Data de Emissao",
    "Empresa",
    "CNPJ",
    "Inspetor",
    "Registro Inspetor",
    "Acompanhante",
    "Total de Itens",
    "Total Nao Conformidades",
    "Passivo Risco Maximo (R$)",
    "Economia Gerada Maxima (R$)",
    "Grau de Risco",
  ];

  const rows = laudos.map((l) => [
    l.numero,
    `"${(l.data || "").replace(/"/g, '""')}"`,
    `"${(l.empresa || "").replace(/"/g, '""')}"`,
    `"${(l.cnpj || "").replace(/"/g, '""')}"`,
    `"${(l.inspetor || "").replace(/"/g, '""')}"`,
    `"${(l.regInspetor || "").replace(/"/g, '""')}"`,
    `"${(l.estado?.acompNome || "").replace(/"/g, '""')}"`,
    l.totalItens,
    l.totalNaoConformidades,
    l.passivoRiscoMax,
    l.economiaGeradaMax,
    l.grauRisco || 3,
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const dataIso = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", `laudos-ativos-emitidos-${dataIso}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
