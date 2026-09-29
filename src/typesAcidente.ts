export interface AcidenteInvestigacaoState {
  id?: string;
  dataAcidente: string;
  horaAcidente: string;
  localSetor: string;
  tipoAcidente: "pessoal" | "material" | "ambos";
  
  // Vítima (se pessoal)
  vitimaNome?: string;
  vitimaCargo?: string;
  vitimaTempoEmpresa?: string;
  tipoLesao?: string; // Ex: Fratura, Corte, Queimadura, Amputação, Óbito, Contusão
  parteCorpoAtingida?: string; // Ex: Mãos, Olhos, Membros Inferiores
  afastamentoDias?: number;
  houveObito?: boolean;

  // Dano Material (se material)
  tipoDanoMaterial?: string; // Ex: Danos a Equipamento/Máquina, Incêndio em Instalações, Colisão de Veículos, Queda de Carga
  estimativaPrejuizoBRL?: number;

  // Descrição e Análise
  descricaoFatos: string; // Relato cronológico do que aconteceu
  condicoesInseguras: string[]; // Fatores ambientais ou materiais
  atosInseguros: string[]; // Fatores humanos
  
  // Causas Raiz (Árvore de Causas / 5 Porquês)
  causaRaizPrincipal: string;
  metodoAnalise: "cinco_porques" | "ishikawa" | "arvore_causas";

  // Ações Corretivas e Preventivas
  acoesImediatas: string;
  acoesCorretivasDefinitivas: string;
  responsavelImplementacao: string;
  prazoDias: number;

  // Responsável pela Investigação
  investigadorNome: string;
  investigadorCargo: string;
  investigadorRegistro: string;
  dataEmissao: string;
  
  assinaturaInvestigador?: string | null;
  assinaturaGestor?: string | null;
  
  // Novas propriedades solicitadas
  fotoEvidenciaDataUrl?: string | null;
  fotosEvidenciaLista?: string[];
  medidasAntesFotoDataUrl?: string | null;
  medidasAntesFotosLista?: string[];
  medidasAntesDescricao?: string;
  responsavelEmpresaNome?: string;
  responsavelEmpresaCargo?: string;
}
