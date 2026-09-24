import {
  buscarCNAEPorCodigoOuDescricao,
  normalizarCNAE,
  CNPJ_CNAE_DEMO,
  deduzirGrauRiscoPorDivisaoCNAE,
  formatarCodigoCNAE,
} from "../data/cnaeData";
import { TipoInscricao } from "../types";

export interface CNAESecundarioItem {
  codigo: string;
  descricao: string;
}

export interface DadosCNPJConsultado {
  cnpjFormatado: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnaeCodigo: string;
  cnaeDescricao: string;
  grauRisco: 1 | 2 | 3 | 4;
  cnaesSecundarios?: CNAESecundarioItem[];
  telefone?: string;
  enderecoCompleto?: string;
  municipio?: string;
  uf?: string;
  situacaoCadastral?: string;
}

/**
 * Formata dígitos no padrão CNPJ: 00.000.000/0001-00 (14 dígitos)
 */
export function formatarCNPJ(valor: string): string {
  const digits = valor.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formata dígitos no padrão CAEPF: 000.000.000/000-00 (14 dígitos)
 * Cadastro de Atividade Econômica da Pessoa Física (Produtores Rurais, Profissionais Liberais com empregados, etc.)
 */
export function formatarCAEPF(valor: string): string {
  const digits = valor.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  if (digits.length <= 12) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}/${digits.slice(9)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}/${digits.slice(9, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formata dígitos no padrão Matrícula CEI / CNO: 00.000.00000/00 (12 dígitos)
 */
export function formatarCEI(valor: string): string {
  const digits = valor.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 10) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 10)}/${digits.slice(10, 12)}`;
}

/**
 * Formata qualquer documento fiscal (CNPJ, CAEPF ou CEI) conforme o tipo informado
 */
export function formatarDocumentoInscricao(valor: string, tipo: TipoInscricao = "CNPJ"): string {
  if (tipo === "CAEPF") return formatarCAEPF(valor);
  if (tipo === "CEI/CNO") return formatarCEI(valor);
  return formatarCNPJ(valor);
}

/**
 * Detecta automaticamente o tipo provável de documento fiscal baseado na estrutura e máscara
 */
export function detectarTipoInscricao(valor: string): TipoInscricao {
  const digits = valor.replace(/\D/g, "");
  if (digits.length === 12 || valor.includes(".00000/")) return "CEI/CNO";
  if (valor.includes("/") && valor.split("/")[0].length === 11) return "CAEPF";
  return "CNPJ";
}

// Re-exporta ou utiliza deduzirGrauRiscoPorDivisaoCNAE importado de cnaeData
export { deduzirGrauRiscoPorDivisaoCNAE };

/**
 * Consulta em tempo real dados da empresa por CNPJ na Receita Federal
 * com fallback múltiplo (BrasilAPI -> MinhaReceita -> Dicionário Demo).
 */
export async function consultarCNPJ(cnpjInput: string): Promise<DadosCNPJConsultado> {
  const digits = cnpjInput.replace(/\D/g, "");
  if (digits.length !== 14) {
    throw new Error("CNPJ deve conter exatamente 14 dígitos.");
  }

  const cnpjFormatado = formatarCNPJ(digits);

  // 1. Verificar Demo primeiro se for CNPJ demo
  if (CNPJ_CNAE_DEMO[cnpjFormatado]) {
    const demo = CNPJ_CNAE_DEMO[cnpjFormatado];
    const cnaeInfo = buscarCNAEPorCodigoOuDescricao(demo.cnae);
    return {
      cnpjFormatado,
      razaoSocial: demo.empresa || "Empresa Cadastrada",
      nomeFantasia: demo.empresa,
      cnaeCodigo: cnaeInfo?.codigo || demo.cnae,
      cnaeDescricao: cnaeInfo?.descricao || "Atividade Econômica Principal",
      grauRisco: cnaeInfo?.grauRisco || 3,
      telefone: "34999990000",
      enderecoCompleto: "Av. Industrial, 1000 - Distrito Industrial",
    };
  }

  let data: any = null;

  // 2. Tentar endpoint local /api/cnpj/${digits} (executado no backend sem restrições de CORS)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const apiRes = await fetch(`/api/cnpj/${digits}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json && json.data) {
        data = json.data;
      }
    }
  } catch (err) {
    console.warn("Proxy /api/cnpj falhou ou indisponível, tentando consulta direta...", err);
  }

  // 3. Fallback Direto: Tentar BrasilAPI com timeout de 5 segundos
  if (!data) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        data = await response.json();
      }
    } catch (err) {
      console.warn("BrasilAPI direto falhou ou demorou. Tentando MinhaReceita...", err);
    }
  }

  // 4. Fallback Direto: MinhaReceita.org se BrasilAPI não responder
  if (!data) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`https://minhareceita.org/${digits}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        data = await response.json();
      }
    } catch (err) {
      console.warn("MinhaReceita falhou:", err);
    }
  }

  if (!data) {
    throw new Error("Não foi possível localizar os dados deste CNPJ na Receita Federal. Verifique se o número possui 14 dígitos válidos.");
  }

  // Processar dados retornados suportando BrasilAPI, MinhaReceita e ReceitaWS
  const razaoSocial = (data.razao_social || data.nome || data.nome_fantasia || data.fantasia || "").trim();
  const nomeFantasia = (data.nome_fantasia || data.fantasia || "").trim();

  // CNAE Principal e Secundários
  let rawCnae = "";
  let rawDesc = "";

  if (data.cnae_fiscal) {
    rawCnae = String(data.cnae_fiscal);
    rawDesc = String(data.cnae_fiscal_descricao || "");
  } else if (data.codigo_cnae_fiscal) {
    rawCnae = String(data.codigo_cnae_fiscal);
    rawDesc = String(data.cnae_fiscal_descricao || data.descricao_cnae_fiscal || "");
  } else if (Array.isArray(data.atividade_principal) && data.atividade_principal[0]) {
    rawCnae = String(data.atividade_principal[0].code || "");
    rawDesc = String(data.atividade_principal[0].text || "");
  } else if (data.cnae) {
    rawCnae = String(data.cnae);
    rawDesc = String(data.cnae_descricao || "");
  }

  // Normalização e Formatação do CNAE Principal
  const digitsOnly = normalizarCNAE(rawCnae);
  let cnaeFormatado = formatarCodigoCNAE(digitsOnly.slice(0, 5)) || rawCnae;

  // Buscar no catálogo oficial NR-04
  const achado = buscarCNAEPorCodigoOuDescricao(cnaeFormatado) ||
                 buscarCNAEPorCodigoOuDescricao(digitsOnly) ||
                 buscarCNAEPorCodigoOuDescricao(rawDesc);

  let cnaeCodigo = cnaeFormatado || rawCnae;
  let cnaeDescricao = rawDesc;
  let grauRisco: 1 | 2 | 3 | 4 = 3;

  if (achado) {
    cnaeCodigo = achado.codigo;
    cnaeDescricao = rawDesc || achado.descricao;
    grauRisco = achado.grauRisco;
  } else {
    cnaeCodigo = cnaeFormatado || rawCnae;
    cnaeDescricao = rawDesc || "Atividade Econômica Declarada";
    grauRisco = deduzirGrauRiscoPorDivisaoCNAE(digitsOnly);
  }

  // Extração de CNAEs Secundários (se houver)
  const cnaesSecundarios: CNAESecundarioItem[] = [];
  if (Array.isArray(data.cnaes_secundarios)) {
    for (const item of data.cnaes_secundarios) {
      const codRaw = String(item.codigo || "");
      const dOnly = normalizarCNAE(codRaw);
      const codFmt = formatarCodigoCNAE(dOnly.slice(0, 5)) || codRaw;
      if (codFmt) {
        cnaesSecundarios.push({
          codigo: codFmt,
          descricao: String(item.descricao || ""),
        });
      }
    }
  } else if (Array.isArray(data.atividades_secundarias)) {
    for (const item of data.atividades_secundarias) {
      const codRaw = String(item.code || "");
      const dOnly = normalizarCNAE(codRaw);
      const codFmt = formatarCodigoCNAE(dOnly.slice(0, 5)) || codRaw;
      if (codFmt) {
        cnaesSecundarios.push({
          codigo: codFmt,
          descricao: String(item.text || ""),
        });
      }
    }
  }

  // Telefone / WhatsApp
  let telefone = "";
  if (data.ddd_telefone_1) {
    telefone = String(data.ddd_telefone_1).replace(/\D/g, "");
  } else if (data.telefone) {
    telefone = String(data.telefone).replace(/\D/g, "");
  }


  // Endereço
  const partesEndereco = [
    data.logradouro ? `${data.logradouro}${data.numero ? `, ${data.numero}` : ""}` : "",
    data.bairro || "",
    data.municipio ? `${data.municipio}${data.uf ? `/${data.uf}` : ""}` : "",
    data.cep ? `CEP: ${data.cep}` : "",
  ].filter(Boolean);

  const enderecoCompleto = partesEndereco.join(" - ");

  return {
    cnpjFormatado,
    razaoSocial: razaoSocial || nomeFantasia || "Empresa Auditada",
    nomeFantasia: nomeFantasia || undefined,
    cnaeCodigo,
    cnaeDescricao: cnaeDescricao || "Atividade Econômica Declarada",
    grauRisco,
    cnaesSecundarios: cnaesSecundarios.length > 0 ? cnaesSecundarios : undefined,
    telefone: telefone || undefined,
    enderecoCompleto: enderecoCompleto || undefined,
    municipio: data.municipio,
    uf: data.uf,
    situacaoCadastral: data.descricao_situacao_cadastral || data.situacao_cadastral,
  };
}
