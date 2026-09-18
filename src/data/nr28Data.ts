import { FaixaFuncionarios, GrauInfracao, ItemNR28, TipoNorma } from "../types";

export const FAIXAS_FUNCIONARIOS: FaixaFuncionarios[] = [
  "1 a 10",
  "11 a 25",
  "26 a 50",
  "51 a 100",
  "101 a 250",
  "251 a 500",
  "501 a 1000",
  "Mais de 1000",
];

// Tabela Oficial NR 28 - Segurança do Trabalho (em R$ - UFIR convertida)
export const TABELA_MULTAS_SEGURANCA: Record<
  FaixaFuncionarios,
  Record<GrauInfracao, [number, number]>
> = {
  "1 a 10": { I1: [630, 1120], I2: [1121, 1680], I3: [1681, 2240], I4: [2241, 2792] },
  "11 a 25": { I1: [1121, 1400], I2: [1401, 1960], I3: [1961, 2520], I4: [2521, 3360] },
  "26 a 50": { I1: [1401, 1680], I2: [1681, 2240], I3: [2241, 3080], I4: [3081, 3920] },
  "51 a 100": { I1: [1681, 1960], I2: [1961, 2520], I3: [2521, 3360], I4: [3361, 4480] },
  "101 a 250": { I1: [1961, 2240], I2: [2241, 3080], I3: [3081, 3920], I4: [3921, 5040] },
  "251 a 500": { I1: [2241, 2520], I2: [2521, 3360], I3: [3361, 4480], I4: [4481, 5600] },
  "501 a 1000": { I1: [2521, 2800], I2: [2801, 3920], I3: [3921, 5040], I4: [5041, 6304] },
  "Mais de 1000": { I1: [2801, 3360], I2: [3921, 4480], I3: [5041, 5600], I4: [6305, 6708] },
};

// Tabela Oficial NR 28 - Medicina do Trabalho
export const TABELA_MULTAS_MEDICINA: Record<
  FaixaFuncionarios,
  Record<GrauInfracao, [number, number]>
> = {
  "1 a 10": { I1: [378, 630], I2: [631, 1120], I3: [1121, 1680], I4: [1681, 2240] },
  "11 a 25": { I1: [631, 840], I2: [841, 1400], I3: [1401, 1960], I4: [1961, 2520] },
  "26 a 50": { I1: [841, 1120], I2: [1121, 1680], I3: [1681, 2240], I4: [2241, 3080] },
  "51 a 100": { I1: [1121, 1400], I2: [1401, 1960], I3: [1961, 2520], I4: [2521, 3360] },
  "101 a 250": { I1: [1401, 1680], I2: [1681, 2240], I3: [2241, 3080], I4: [3081, 3920] },
  "251 a 500": { I1: [1681, 1960], I2: [1961, 2520], I3: [2521, 3360], I4: [3361, 4480] },
  "501 a 1000": { I1: [1961, 2240], I2: [2241, 3080], I3: [3921, 5040], I4: [3921, 5040] },
  "Mais de 1000": { I1: [2241, 2520], I2: [3081, 3360], I3: [3921, 4480], I4: [5041, 5493] },
};

export const BASE_ITENS_NR: ItemNR28[] = [
  // NR 01
  { nr: "NR 01", item: "1.5.3.1", descricao: "Deixar de elaborar ou de implementar o PGR (Programa de Gerenciamento de Riscos)", infracao: "I4", tipo: "S", categoria: "PGR / GRO" },
  { nr: "NR 01", item: "1.5.4.4", descricao: "Deixar de adotar medidas de prevenção conforme ordem de prioridade legal", infracao: "I3", tipo: "S", categoria: "Prevenção" },
  { nr: "NR 01", item: "1.7.1", descricao: "Deixar de prestar informações de segurança aos trabalhadores na admissão", infracao: "I2", tipo: "S", categoria: "Treinamento" },
  
  // NR 05
  { nr: "NR 05", item: "5.4.1", descricao: "Deixar de constituir CIPA ou designar responsável nos termos da norma", infracao: "I3", tipo: "S", categoria: "CIPA" },
  { nr: "NR 05", item: "5.7.1", descricao: "Deixar de realizar treinamento obrigatório para os membros da CIPA", infracao: "I2", tipo: "S", categoria: "CIPA" },

  // NR 06
  { nr: "NR 06", item: "6.3.1", descricao: "Não fornecer ao empregado, gratuitamente, EPI adequado ao risco em perfeito estado", infracao: "I4", tipo: "S", categoria: "EPI" },
  { nr: "NR 06", item: "6.5.1", descricao: "Fornecer EPI sem Certificado de Aprovação (CA) válido emitido pelo MTE", infracao: "I3", tipo: "S", categoria: "EPI" },
  { nr: "NR 06", item: "6.6.1", descricao: "Não registrar o fornecimento do EPI ao trabalhador em ficha ou sistema eletrônico", infracao: "I2", tipo: "S", categoria: "EPI" },

  // NR 07 (Medicina)
  { nr: "NR 07", item: "7.5.1", descricao: "Deixar de elaborar e implementar o PCMSO conforme os riscos do PGR", infracao: "I3", tipo: "M", categoria: "PCMSO" },
  { nr: "NR 07", item: "7.5.6", descricao: "Deixar de realizar exames médicos ocupacionais obrigatórios (admissional, periódico, etc.)", infracao: "I3", tipo: "M", categoria: "Exames" },
  { nr: "NR 07", item: "7.5.19", descricao: "Não emitir Atestado de Saúde Ocupacional (ASO) em duas vias com entrega ao empregado", infracao: "I2", tipo: "M", categoria: "ASO" },

  // NR 10
  { nr: "NR 10", item: "10.2.8.1", descricao: "Não priorizar medidas de proteção coletiva em instalações elétricas", infracao: "I4", tipo: "S", categoria: "Elétrica" },
  { nr: "NR 10", item: "10.4.1", descricao: "Instalações e quadros elétricos com partes vivas expostas ou sem sinalização de advertência", infracao: "I4", tipo: "S", categoria: "Elétrica" },
  { nr: "NR 10", item: "10.8.8", descricao: "Permitir trabalho em instalações elétricas por pessoa não autorizada ou sem capacitação", infracao: "I4", tipo: "S", categoria: "Elétrica" },

  // NR 12
  { nr: "NR 12", item: "12.5.1", descricao: "Zonas de perigo de máquinas e equipamentos desprovidas de sistemas de segurança físicos ou intertravados", infracao: "I4", tipo: "S", categoria: "Máquinas" },
  { nr: "NR 12", item: "12.6.1", descricao: "Máquinas sem dispositivos de parada de emergência acessíveis e funcionais", infracao: "I3", tipo: "S", categoria: "Máquinas" },
  { nr: "NR 12", item: "12.16.1", descricao: "Operação de máquinas por trabalhador sem capacitação teórica e prática específica", infracao: "I3", tipo: "S", categoria: "Capacitação" },

  // NR 18
  { nr: "NR 18", item: "18.5.1", descricao: "Canteiro de obras desprovido de instalações sanitárias ou áreas de vivência adequadas", infracao: "I3", tipo: "S", categoria: "Canteiro" },
  { nr: "NR 18", item: "18.9.1", descricao: "Periferias de lajes e aberturas no piso sem proteção coletiva contra quedas (guarda-corpo)", infracao: "I4", tipo: "S", categoria: "Construção Civil" },
  { nr: "NR 18", item: "18.10.1", descricao: "Andaime montado em desacordo com projeto, sem travamento ou apoio seguro", infracao: "I4", tipo: "S", categoria: "Andaimes" },

  // NR 20
  { nr: "NR 20", item: "20.5.1", descricao: "Armazenamento ou manipulação de inflamáveis e combustíveis sem prontuário da instalação", infracao: "I3", tipo: "S", categoria: "Inflamáveis" },
  { nr: "NR 20", item: "20.7.1", descricao: "Trabalhadores em contato com inflamáveis sem capacitação específica da NR 20", infracao: "I3", tipo: "S", categoria: "Inflamáveis" },

  // NR 23
  { nr: "NR 23", item: "23.1.1", descricao: "Locais de trabalho sem medidas e equipamentos adequados de combate a incêndio", infracao: "I3", tipo: "S", categoria: "Incêndio" },
  { nr: "NR 23", item: "23.3.1", descricao: "Rotas de fuga e saídas de emergência obstruídas ou inadequadamente sinalizadas", infracao: "I3", tipo: "S", categoria: "Incêndio" },

  // NR 33
  { nr: "NR 33", item: "33.3.1", descricao: "Trabalho em espaço confinado sem emissão prévia de Permissão de Entrada e Trabalho (PET)", infracao: "I4", tipo: "S", categoria: "Espaço Confinado" },
  { nr: "NR 33", item: "33.3.2", descricao: "Entrada em espaço confinado sem monitoramento prévio e contínuo da atmosfera", infracao: "I4", tipo: "S", categoria: "Atmosfera" },

  // NR 35
  { nr: "NR 35", item: "35.2.1", descricao: "Trabalho em altura executado sem Análise de Risco (AR) e Permissão de Trabalho (PT)", infracao: "I4", tipo: "S", categoria: "Altura" },
  { nr: "NR 35", item: "35.4.1", descricao: "Trabalho em altura sem sistema de proteção individual contra quedas (SPIQ) adequado", infracao: "I4", tipo: "S", categoria: "Altura" },
  { nr: "NR 35", item: "35.3.1", descricao: "Autorizar trabalho em altura por colaborador sem treinamento de 8 horas e ASO com aptidão", infracao: "I3", tipo: "S", categoria: "Capacitação" },
];

export function calcularMultaNR28(
  grau: GrauInfracao,
  faixa: FaixaFuncionarios,
  tipo: TipoNorma
): [number, number] {
  const tabela = tipo === "M" ? TABELA_MULTAS_MEDICINA : TABELA_MULTAS_SEGURANCA;
  const valores = tabela[faixa]?.[grau];
  return valores || [0, 0];
}

export function formatarBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Matriz de Risco Ocupacional NR 01 / PGR (Probabilidade x Severidade)
export const DESCRICOES_PROBABILIDADE: Record<number, { rotulo: string; descricao: string }> = {
  1: { rotulo: "1 - Rara", descricao: "Exposição ocasional / improvável sem histórico" },
  2: { rotulo: "2 - Pouco Provável", descricao: "Exposição intermitente com deficiências pontuais" },
  3: { rotulo: "3 - Provável", descricao: "Exposição frequente / rotineira com medidas insuficientes" },
  4: { rotulo: "4 - Muito Provável", descricao: "Exposição contínua ou desprovida de proteções" },
};

export const DESCRICOES_SEVERIDADE: Record<number, { rotulo: string; descricao: string }> = {
  1: { rotulo: "1 - Leve", descricao: "Primeiros socorros / sem afastamento laboral" },
  2: { rotulo: "2 - Significativa", descricao: "Lesão temporária com afastamento reversível" },
  3: { rotulo: "3 - Severa", descricao: "Incapacidade permanente parcial ou sequela grave" },
  4: { rotulo: "4 - Catastrófica", descricao: "Morte ou incapacidade permanente total" },
};

export function calcularNivelRiscoPGR(
  probabilidade: number,
  severidade: number
): { nivel: "Trivial" | "Baixo" | "Médio" | "Alto" | "Crítico"; corBg: string; corTexto: string; score: number } {
  const score = (probabilidade || 1) * (severidade || 1);
  if (score <= 2) {
    return { nivel: "Trivial", corBg: "bg-emerald-100 border-emerald-300", corTexto: "text-emerald-800", score };
  }
  if (score <= 4) {
    return { nivel: "Baixo", corBg: "bg-lime-100 border-lime-300", corTexto: "text-lime-900", score };
  }
  if (score <= 8) {
    return { nivel: "Médio", corBg: "bg-amber-100 border-amber-300", corTexto: "text-amber-900", score };
  }
  if (score <= 12) {
    return { nivel: "Alto", corBg: "bg-orange-100 border-orange-300", corTexto: "text-orange-950", score };
  }
  return { nivel: "Crítico", corBg: "bg-red-100 border-red-300", corTexto: "text-red-900", score };
}

