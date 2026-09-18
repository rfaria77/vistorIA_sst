export type FaixaFuncionarios =
  | "1 a 10"
  | "11 a 25"
  | "26 a 50"
  | "51 a 100"
  | "101 a 250"
  | "251 a 500"
  | "501 a 1000"
  | "Mais de 1000";

export type GrauInfracao = "I1" | "I2" | "I3" | "I4";
export type TipoNorma = "S" | "M"; // Segurança ou Medicina
export type StatusApontamento = "Não Conformidade" | "Conformidade";
export type Prioridade = "Alta" | "Média" | "Baixa";

export type PerfilUsuario = "admin" | "inspetor";

export interface UsuarioAuditor {
  id: string;
  nome: string;
  email: string;
  registro: string;
  cargo: string;
  perfil: PerfilUsuario; // "admin" ou "inspetor"
  senha?: string;
  ativo?: boolean;
  foto?: string;
  conectadoEm?: string;
  criadoEm?: string;
  primeiroAcesso?: boolean;
}

export interface ItemNR28 {
  nr: string;
  item: string;
  descricao: string;
  infracao: GrauInfracao;
  tipo: TipoNorma;
  categoria: string;
}

export interface Apontamento {
  id: string;
  nr: string;
  itemNr: string;
  descricao: string;
  infracao: GrauInfracao;
  tipo: TipoNorma;
  status: StatusApontamento;
  prioridade: Prioridade;
  descricaoCenario: string;
  acaoCorretiva: string;
  valorMin: number;
  valorMax: number;
  fotoDataUrl?: string;
  coordenadasGps?: { lat: number; lng: number } | null;
  criadoEm: string;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  faixaFuncionarios: FaixaFuncionarios;
  contatoWpp: string;
  endereco?: string;
  cnae?: string;
  grauRisco?: 1 | 2 | 3 | 4;
}

export interface VistoriaState {
  empresa: string;
  cnpj: string;
  faixa: FaixaFuncionarios;
  wpp: string;
  inspetor: string;
  regInspetor: string;
  acompNome: string;
  acompCargo: string;
  data: string;
  evidencias: Apontamento[];
  cnae?: string;
  cnaeDescricao?: string;
  grauRisco?: 1 | 2 | 3 | 4;
  assinaturaInspetor?: string;
  assinaturaAcompanhante?: string;
}

export interface LaudoEmitido {
  id: string;
  numero: number;
  data: string;
  empresa: string;
  cnpj: string;
  inspetor: string;
  regInspetor: string;
  acompNome: string;
  acompCargo: string;
  totalItens: number;
  totalNaoConformidades: number;
  passivoRiscoMax: number;
  economiaGeradaMax: number;
  cnae?: string;
  grauRisco?: 1 | 2 | 3 | 4;
  pdfBase64?: string;
  estado?: VistoriaState;
}

export interface RascunhoVistoria {
  id: string;
  dataAtualizacao: string;
  empresa: string;
  estado: VistoriaState;
}
