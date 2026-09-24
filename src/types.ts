// Restaurant App Types
export type CategoryType = 'Todos' | 'Lanches' | 'Pizzas' | 'Bebidas' | 'Sobremesas' | 'Marmitex' | 'Açaí';

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: CategoryType;
  image: string;
  available: boolean;
  popular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  logo: string;
  coverImage: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  isOpen: boolean;
  minOrder: number;
  address: string;
  phone: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  observations: string;
}

export type OrderStatus = 'pendente' | 'preparando' | 'entrega' | 'concluido' | 'recusado';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  phone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
  };
  paymentMethod: 'pix' | 'cartao' | 'dinheiro';
  changeFor?: number;
  status: OrderStatus;
  createdAt: string;
}

// VistorIA SST Types
export type TipoInscricao = "CNPJ" | "CAEPF" | "CEI" | "CEI/CNO";

export type FaixaFuncionarios =
  | "1 a 10"
  | "11 a 25"
  | "26 a 50"
  | "51 a 100"
  | "101 a 250"
  | "251 a 500"
  | "501 a 1000"
  | "Mais de 1000";

export interface Empresa {
  id: string;
  nome: string;
  tipoInscricao?: TipoInscricao;
  cnpj: string;
  cnae?: string;
  cnaeDescricao?: string;
  grauRisco?: number;
  faixaFuncionarios?: FaixaFuncionarios;
  endereco?: string;
  responsavel?: string;
  telefone?: string;
  email?: string;
  contatoWpp?: string;
}

export type PerfilUsuario = "admin" | "inspetor";

export interface UsuarioAuditor {
  id: string;
  nome: string;
  email: string;
  registro: string;
  cargo: string;
  perfil: PerfilUsuario;
  senha?: string;
  ativo?: boolean;
  primeiroAcesso?: boolean;
  criadoEm?: string;
  conectadoEm?: string;
}

export type GrauInfracao = "I1" | "I2" | "I3" | "I4";
export type TipoNorma = "S" | "M";
export type Prioridade = "Baixa" | "Média" | "Alta" | "Crítica" | string;
export type StatusApontamento = "Conforme" | "Não Conformidade" | "Não Aplicável" | "Conformidade" | string;

export interface Apontamento {
  id: string;
  nr: string;
  itemNr: string;
  descricaoCenario?: string;
  descricao?: string;
  grauInfracao?: GrauInfracao;
  infracao?: GrauInfracao;
  tipoNorma?: TipoNorma;
  tipo?: TipoNorma;
  status?: StatusApontamento;
  prazoSugeridoDias?: number;
  recomendacaoCorretiva?: string;
  acaoCorretiva?: string;
  fotoDataUrl?: string;
  fotoOriginalDataUrl?: string;
  anotaçõesFoto?: string;
  localSetor?: string;
  grauRiscoItem?: number;
  valorMin?: number;
  valorMax?: number;
  prioridade?: Prioridade;
  criadoEm?: string;
  coordenadasGps?: { lat: number; lng: number; precisao?: number } | null;
}

export interface VistoriaState {
  rascunhoId?: string;
  empresa: string;
  tipoInscricao?: TipoInscricao;
  cnpj: string;
  cnae?: string;
  cnaeDescricao?: string;
  grauRisco?: number;
  faixaFuncionarios?: FaixaFuncionarios;
  endereco?: string;
  responsavel?: string;
  telefone?: string;
  email?: string;
  wpp?: string;
  auditorNome?: string;
  auditorRegistro?: string;
  auditorCargo?: string;
  inspetor?: string;
  regInspetor?: string;
  acompNome?: string;
  acompCargo?: string;
  acompDocumento?: string;
  evidencias: Apontamento[];
  assinaturaInspetor?: string | null;
  assinaturaAcompanhante?: string | null;
  data?: string;
  mostrarMultas?: boolean;
  faixa?: string;
  publicoAlvo?: string;
}

export interface RascunhoVistoria {
  id: string;
  empresa: string;
  dataAtualizacao: string;
  estado: VistoriaState;
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
  economiaGeradaMax?: number;
  grauRisco?: number;
  estado: VistoriaState;
  mostrarMultas?: boolean;
  publicoAlvo?: string;
}

export type PeriodicidadeRelatorio = "semanal" | "quinzenal" | "mensal" | "semestral" | "anual" | "eventual";

export interface ProgramacaoRelatorio {
  id: string;
  empresaNome: string;
  tipoRelatorio: string;
  periodicidade: PeriodicidadeRelatorio;
  dataUltimoRelatorio: string;
  dataProximaProgramada: string;
  auditorResponsavel: string;
  observacoes?: string;
  statusConcluido?: boolean;
  dataConclusao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  idUltimoLaudo?: string;
  numeroUltimoLaudo?: number;
  concluidoEm?: string;
}

export interface SessaoAssinatura {
  id: string;
  token?: string;
  estado?: VistoriaState;
  criadaEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  expiraEm?: string;
  status?: "pendente" | "concluida" | "expirada" | "assinado" | string;
  assinaturaAcompanhante?: string | null;
  assinadoEm?: string;
  empresa?: string;
  cnpj?: string;
  data?: string;
  inspetor?: string;
  regInspetor?: string;
  acompNome?: string;
  acompCargo?: string;
  totalApontamentos?: number;
}

export interface ItemNR28 {
  item: string;
  nr?: string;
  aliquota?: string;
  descricao: string;
  grau?: GrauInfracao;
  infracao?: GrauInfracao;
  tipo: TipoNorma;
  categoria?: string;
}
