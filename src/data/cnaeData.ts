// Tabela de Classificação Nacional de Atividades Econômicas (CNAE) e Grau de Risco (NR 04 - Quadro I)

export interface CNAEItem {
  codigo: string; // Ex: "41.20-4" ou "4120-4"
  descricao: string;
  grauRisco: 1 | 2 | 3 | 4;
  categoria: string;
}

export const LISTA_CNAE_NR04: CNAEItem[] = [
  // Construção Civil
  { codigo: "41.20-4", descricao: "Construção de edifícios", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "41.10-7", descricao: "Incorporação de empreendimentos imobiliários", grauRisco: 1, categoria: "Construção Civil" },
  { codigo: "42.11-1", descricao: "Construção de rodovias e ferrovias", grauRisco: 4, categoria: "Construção Pesada" },
  { codigo: "42.12-0", descricao: "Construção de obras de arte especiais (pontes, viadutos e túneis)", grauRisco: 4, categoria: "Construção Pesada" },
  { codigo: "42.21-9", descricao: "Obras para geração e distribuição de energia elétrica e telecomunicações", grauRisco: 4, categoria: "Construção / Elétrica" },
  { codigo: "43.13-4", descricao: "Obras de terraplenagem", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "43.21-5", descricao: "Instalação e manutenção elétrica", grauRisco: 3, categoria: "Instalações" },
  { codigo: "43.22-3", descricao: "Instalações hidráulicas, de sistemas de ventilação e ar-condicionado", grauRisco: 3, categoria: "Instalações" },
  { codigo: "43.30-4", descricao: "Obras de acabamento da construção e pintura", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "43.99-1", descricao: "Serviços especializados para construção (montagem de andaimes e estruturas)", grauRisco: 4, categoria: "Construção Civil" },

  // Indústria Metalmecânica, Metalurgia & Siderurgia
  { codigo: "25.11-0", descricao: "Fabricação de estruturas metálicas", grauRisco: 4, categoria: "Metalmecânica" },
  { codigo: "25.39-0", descricao: "Serviços de usinagem, tornearia, solda e tratamento de metais", grauRisco: 3, categoria: "Metalmecânica" },
  { codigo: "24.11-7", descricao: "Produção de ferro-gusa e de ferroligas", grauRisco: 4, categoria: "Siderurgia" },
  { codigo: "24.21-4", descricao: "Produção de semiacabados de aço", grauRisco: 4, categoria: "Siderurgia" },
  { codigo: "28.11-9", descricao: "Fabricação de motores e turbinas", grauRisco: 3, categoria: "Máquinas e Equipamentos" },
  { codigo: "29.10-7", descricao: "Fabricação de automóveis, camionetas e utilitários", grauRisco: 3, categoria: "Automotiva" },
  { codigo: "29.20-4", descricao: "Fabricação de caminhões e ônibus", grauRisco: 3, categoria: "Automotiva" },
  { codigo: "33.14-7", descricao: "Manutenção e reparação de máquinas e equipamentos industriais", grauRisco: 3, categoria: "Manutenção" },

  // Indústria Química, Farmacêutica e Derivados de Petróleo
  { codigo: "19.21-7", descricao: "Refino de petróleo e produção de combustíveis", grauRisco: 4, categoria: "Petroquímica" },
  { codigo: "20.13-4", descricao: "Fabricação de adubos e fertilizantes", grauRisco: 3, categoria: "Química" },
  { codigo: "20.21-5", descricao: "Fabricação de produtos químicos inorgânicos", grauRisco: 3, categoria: "Química" },
  { codigo: "20.29-1", descricao: "Fabricação de tintas, vernizes, esmaltes e lacas", grauRisco: 3, categoria: "Química" },
  { codigo: "21.21-1", descricao: "Fabricação de medicamentos para uso humano", grauRisco: 2, categoria: "Farmacêutica" },
  { codigo: "22.29-3", descricao: "Fabricação de artefatos de material plástico", grauRisco: 3, categoria: "Plásticos" },

  // Alimentos, Bebidas e Agroindústria
  { codigo: "10.11-2", descricao: "Frigorífico - abate de reses e bovinos", grauRisco: 3, categoria: "Alimentos" },
  { codigo: "10.12-1", descricao: "Frigorífico - abate de aves e suínos", grauRisco: 3, categoria: "Alimentos" },
  { codigo: "10.41-4", descricao: "Fabricação de óleos vegetais em bruto e refinados", grauRisco: 3, categoria: "Agroindústria" },
  { codigo: "10.51-1", descricao: "Preparação do leite e fabricação de laticínios", grauRisco: 3, categoria: "Alimentos" },
  { codigo: "10.61-9", descricao: "Beneficiamento de arroz e fabricação de produtos do arroz", grauRisco: 3, categoria: "Alimentos" },
  { codigo: "10.71-6", descricao: "Fabricação de açúcar em bruto e refinado", grauRisco: 3, categoria: "Agroindústria" },
  { codigo: "10.91-1", descricao: "Fabricação de produtos de panificação", grauRisco: 2, categoria: "Alimentos" },
  { codigo: "11.11-9", descricao: "Fabricação de cervejas e chopes", grauRisco: 3, categoria: "Bebidas" },

  // Agricultura, Pecuária e Florestal
  { codigo: "01.11-3", descricao: "Cultivo de cereais (soja, milho, trigo)", grauRisco: 3, categoria: "Agricultura" },
  { codigo: "01.13-0", descricao: "Cultivo de cana-de-açúcar", grauRisco: 3, categoria: "Agricultura" },
  { codigo: "01.51-2", descricao: "Criação de bovinos para corte e leite", grauRisco: 3, categoria: "Pecuária" },
  { codigo: "02.10-1", descricao: "Produção florestal - florestas plantadas (eucalipto, pinus)", grauRisco: 3, categoria: "Florestal" },
  { codigo: "02.20-9", descricao: "Extração de madeira em florestas nativas", grauRisco: 4, categoria: "Florestal" },

  // Mineração e Extração Mineral
  { codigo: "07.10-3", descricao: "Extração de minério de ferro", grauRisco: 4, categoria: "Mineração" },
  { codigo: "08.10-0", descricao: "Extração de pedra, areia e argila para construção", grauRisco: 4, categoria: "Mineração" },

  // Logística, Transporte e Armazenamento
  { codigo: "49.30-2", descricao: "Transporte rodoviário de carga", grauRisco: 3, categoria: "Transporte" },
  { codigo: "52.11-7", descricao: "Armazenamento e depósito de mercadorias (armazéns gerais)", grauRisco: 3, categoria: "Logística" },
  { codigo: "52.12-5", descricao: "Carga e descarga de mercadorias", grauRisco: 3, categoria: "Logística" },

  // Serviços, Comércio e Saúde
  { codigo: "86.10-1", descricao: "Atividades de atendimento hospitalar", grauRisco: 3, categoria: "Saúde" },
  { codigo: "86.30-5", descricao: "Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos", grauRisco: 3, categoria: "Saúde" },
  { codigo: "86.40-2", descricao: "Atividades de serviços de complementação diagnóstica e terapêutica", grauRisco: 3, categoria: "Saúde" },
  { codigo: "47.11-3", descricao: "Comércio varejista de mercadorias em geral (hipermercados e supermercados)", grauRisco: 2, categoria: "Comércio" },
  { codigo: "47.44-0", descricao: "Comércio varejista de materiais de construção em geral", grauRisco: 2, categoria: "Comércio" },
  { codigo: "46.71-1", descricao: "Comércio atacadista de madeira e produtos derivados", grauRisco: 3, categoria: "Comércio" },
  { codigo: "47.31-8", descricao: "Comércio varejista de combustíveis para veículos automotores (postos de gasolina)", grauRisco: 3, categoria: "Comércio" },
  { codigo: "62.01-5", descricao: "Desenvolvimento de programas de computador sob encomenda", grauRisco: 1, categoria: "Tecnologia" },
  { codigo: "62.02-3", descricao: "Desenvolvimento e licenciamento de programas de computador customizáveis", grauRisco: 1, categoria: "Tecnologia" },
  { codigo: "69.11-7", descricao: "Serviços advocatícios e jurídicos", grauRisco: 1, categoria: "Serviços Escritório" },
  { codigo: "69.20-6", descricao: "Atividades de contabilidade, consultoria e auditoria contábil", grauRisco: 1, categoria: "Serviços Escritório" },
  { codigo: "71.12-0", descricao: "Serviços de engenharia e consultoria técnica", grauRisco: 1, categoria: "Serviços Escritório" },
  { codigo: "81.21-4", descricao: "Limpeza em prédios e em domicílios", grauRisco: 3, categoria: "Serviços Gerais" },
  { codigo: "80.11-1", descricao: "Atividades de vigilância e segurança privada", grauRisco: 3, categoria: "Segurança" },
  { codigo: "85.31-7", descricao: "Educação superior - graduação", grauRisco: 2, categoria: "Educação" },
];

// Dicionário de CNPJ de demonstração / auto-detecção para testes rápidos
export const CNPJ_CNAE_DEMO: Record<string, { cnae: string; empresa?: string }> = {
  "00.000.000/0001-00": { cnae: "41.20-4", empresa: "Construtora Exemplo Ltda" },
  "12.345.678/0001-99": { cnae: "25.11-0", empresa: "Metalúrgica & Estruturas Aliança S.A." },
  "98.765.432/0001-11": { cnae: "10.41-4", empresa: "Agroindustrial Grãos do Sul" },
};

export function normalizarCNAE(codigo: string): string {
  return codigo.replace(/[^0-9]/g, "");
}

export function buscarCNAEPorCodigoOuDescricao(termo: string): CNAEItem | undefined {
  if (!termo) return undefined;
  const termoLimpo = termo.trim().toLowerCase();
  const apenasNumeros = normalizarCNAE(termo);

  // Busca exata pelo código numérico
  if (apenasNumeros.length >= 4) {
    const achadoExato = LISTA_CNAE_NR04.find(
      (c) => normalizarCNAE(c.codigo).startsWith(apenasNumeros) || apenasNumeros.startsWith(normalizarCNAE(c.codigo))
    );
    if (achadoExato) return achadoExato;
  }

  // Busca por descrição ou código formatado
  return LISTA_CNAE_NR04.find(
    (c) =>
      c.codigo.toLowerCase().includes(termoLimpo) ||
      c.descricao.toLowerCase().includes(termoLimpo)
  );
}

export function obterGrauRiscoTexto(grau: 1 | 2 | 3 | 4 | undefined): {
  grau: number;
  rotulo: string;
  badgeCor: string;
  descricaoSST: string;
  obrigatoriedadeSESMT: string;
} {
  switch (grau) {
    case 1:
      return {
        grau: 1,
        rotulo: "Grau de Risco 1 (Baixo / Escritórios & Tecnologia)",
        badgeCor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        descricaoSST: "Atividades com baixo potencial lesivo ocupacional. Dispensado de certos laudos quando ME/EPP sem riscos físicos, químicos ou biológicos.",
        obrigatoriedadeSESMT: "Exigência de SESMT simplificado a partir de quadros maiores.",
      };
    case 2:
      return {
        grau: 2,
        rotulo: "Grau de Risco 2 (Médio / Comércio & Serviços)",
        badgeCor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        descricaoSST: "Atividades comerciais, de ensino ou serviços leves com riscos ocupacionais moderados.",
        obrigatoriedadeSESMT: "Dimensionamento padrão conforme Quadro II da NR 04.",
      };
    case 3:
      return {
        grau: 3,
        rotulo: "Grau de Risco 3 (Alto / Indústrias, Construção Civil & Logística)",
        badgeCor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        descricaoSST: "Atividades industriais, de obras civis ou hospitalares com riscos físicos, químicos, ergonômicos e mecânicos elevados.",
        obrigatoriedadeSESMT: "Exigência rigorosa de SESMT, CIPA atuante e vistorias preventivas com prazos curtos.",
      };
    case 4:
      return {
        grau: 4,
        rotulo: "Grau de Risco 4 (Máximo / Siderurgia, Mineração, Montagens Pesadas & Químicos)",
        badgeCor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        descricaoSST: "Atividades de altíssima severidade com risco iminente à integridade física dos trabalhadores (NR 10, NR 12, NR 20, NR 33 e NR 35).",
        obrigatoriedadeSESMT: "Dimensionamento máximo de Técnicos e Engenheiros de Segurança conforme NR 04.",
      };
    default:
      return {
        grau: 3,
        rotulo: "Grau de Risco não definido (Padrão 3)",
        badgeCor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
        descricaoSST: "Grau de risco baseado nas atividades gerais de campo.",
        obrigatoriedadeSESMT: "Consulte o Quadro I da NR 04.",
      };
  }
}
