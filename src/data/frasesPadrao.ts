export interface FrasePadrao {
  id: string;
  nr?: string; // ex: "NR 35", "NR 12", "NR 06" ou undefined para universais
  titulo: string;
  texto: string;
  categoria: string;
}

export const FRASES_PADRAO_SST: FrasePadrao[] = [
  // NR 35 - Altura
  {
    id: "nr35-linha-vida",
    nr: "NR 35",
    titulo: "Linha de Vida & Cinto Paraquedista",
    texto: "Instalar imediatamente sistema de proteção individual contra quedas (SPIQ) com linha de vida horizontal/vertical dimensionada por profissional legalmente habilitado, fornecer cinturão tipo paraquedista com talabarte duplo e exigir capacete com jugular.",
    categoria: "Trabalho em Altura",
  },
  {
    id: "nr35-treinamento-aso",
    nr: "NR 35",
    titulo: "Treinamento NR 35 & ASO de Altura",
    texto: "Suspender as atividades em altura até a comprovação de treinamento bienal de 8 horas para trabalho em altura (NR 35) e ASO com avaliação clínica e exames complementares específicos de aptidão para altura.",
    categoria: "Trabalho em Altura",
  },
  {
    id: "nr35-permissao-trabalho",
    nr: "NR 35",
    titulo: "Permissão de Trabalho (PT) & APR",
    texto: "Emitir Permissão de Trabalho (PT) formal e Análise Preliminar de Risco (APR) específica para o trabalho em altura antes de iniciar as atividades, mantendo-as afixadas no posto de trabalho.",
    categoria: "Trabalho em Altura",
  },

  // NR 12 - Máquinas
  {
    id: "nr12-protecao-movel",
    nr: "NR 12",
    titulo: "Proteções Mecânicas Fixas/Móveis",
    texto: "Instalar proteções físicas fixas ou móveis intertravadas com sensores de segurança categoria 4 em todas as zonas de perigo (correias, polias, engrenagens e eixos rotativos), conforme ABNT NBR ISO 13849-1 e NR 12.",
    categoria: "Máquinas e Equipamentos",
  },
  {
    id: "nr12-emergencia",
    nr: "NR 12",
    titulo: "Botão de Emergência & Rearme",
    texto: "Adequar e instalar botão de parada de emergência do tipo cogumelo com retenção e rearme manual em posição de fácil alcance e sem obstruções para o operador do equipamento.",
    categoria: "Máquinas e Equipamentos",
  },
  {
    id: "nr12-laudo-capacitacao",
    nr: "NR 12",
    titulo: "Capacitação & Procedimento Operacional",
    texto: "Realizar treinamento específico teórico e prático para operação segura da máquina, elaborar Procedimento Operacional Padrão (POP) e manter o inventário e laudo de conformidade NR-12 atualizados.",
    categoria: "Máquinas e Equipamentos",
  },

  // NR 10 - Elétrica
  {
    id: "nr10-quadro-trancado",
    nr: "NR 10",
    titulo: "Fechamento de Quadro & Barramentos",
    texto: "Providenciar o fechamento e trancamento imediato da porta do painel elétrico, instalar espelhos de proteção contra contatos acidentais em barramentos energizados e afixar sinalização de risco 'PERIGO - ALTA TENSÃO'.",
    categoria: "Segurança Elétrica",
  },
  {
    id: "nr10-bloqueio-loto",
    nr: "NR 10",
    titulo: "Procedimento de Bloqueio (LOTO)",
    texto: "Adotar obrigatoriamente procedimento formal de desenergização e bloqueio elétrico (Lockout & Tagout - LOTO) com cadeados e etiquetas individuais de advertência durante intervenções e manutenções.",
    categoria: "Segurança Elétrica",
  },
  {
    id: "nr10-pie-eletricista",
    nr: "NR 10",
    titulo: "Habilitação e Treinamento NR 10",
    texto: "Permitir intervenção em instalações elétricas exclusivamente por profissionais autorizados com curso básico/complementar de NR 10 válido e atualizar o Prontuário de Instalações Elétricas (PIE).",
    categoria: "Segurança Elétrica",
  },

  // NR 06 - EPI
  {
    id: "nr06-fornecer-ca",
    nr: "NR 06",
    titulo: "Fornecimento de EPI com CA Válido",
    texto: "Fornecer imediatamente os Equipamentos de Proteção Individual (EPI) adequados ao risco com Certificado de Aprovação (CA) válido expedido pelo Ministério do Trabalho, exigindo o seu uso ininterrupto.",
    categoria: "EPI",
  },
  {
    id: "nr06-ficha-registro",
    nr: "NR 06",
    titulo: "Ficha de Registro e Entrega de EPI",
    texto: "Registrar formalmente a entrega de todos os EPIs em ficha individual física ou eletrônica com assinatura do trabalhador, termo de responsabilidade e data de distribuição.",
    categoria: "EPI",
  },

  // NR 18 - Construção Civil
  {
    id: "nr18-guarda-corpo",
    nr: "NR 18",
    titulo: "Guarda-Corpo Rígido e Rodapé",
    texto: "Instalar sistema de proteção contra quedas em todo o perímetro da laje/edificação e vãos de acesso com travessão superior a 1,20m, travessão intermediário a 0,70m e rodapé de no mínimo 0,15m de altura resistente.",
    categoria: "Construção Civil",
  },
  {
    id: "nr18-aberturas-piso",
    nr: "NR 18",
    titulo: "Fechamento de Aberturas de Piso",
    texto: "Fechar imediatamente todas as aberturas no piso (shafts, vãos de escada e canaletas) com tampas resistentes fixadas e sinalizadas, ou instalar guarda-corpos de proteção periférica.",
    categoria: "Construção Civil",
  },
  {
    id: "nr18-pgr-obra",
    nr: "NR 18",
    titulo: "Adequação ao PGR da Obra",
    texto: "Adequar a frente de trabalho às diretrizes do Programa de Gerenciamento de Riscos (PGR) da obra, incluindo cronograma de implantação das medidas preventivas coletivas.",
    categoria: "Construção Civil",
  },

  // NR 23 - Incêndio
  {
    id: "nr23-desobstruir-extintor",
    nr: "NR 23",
    titulo: "Desobstruir Extintores e Demarcar",
    texto: "Desobstruir imediatamente o acesso aos aparelhos extintores de incêndio, sinalizar na parede com placa fotoluminescente e demarcar o piso com quadrado vermelho e amarelo de 1m x 1m.",
    categoria: "Proteção Contra Incêndios",
  },
  {
    id: "nr23-recarga-extintores",
    nr: "NR 23",
    titulo: "Recarga e Inspeção Periódica",
    texto: "Encaminhar os extintores com carga vencida ou sem selo do INMETRO para manutenção preventiva e recarga imediata por empresa credenciada.",
    categoria: "Proteção Contra Incêndios",
  },

  // NR 24 - Sanitários e Conforto
  {
    id: "nr24-higiene-sanitarios",
    nr: "NR 24",
    titulo: "Higienização e Suprimentos Sanitários",
    texto: "Manter as instalações sanitárias limpas e higienizadas diariamente, dotadas de sabonete líquido, papel toalha descartável, lixeira com tampa e papel higiênico suficiente.",
    categoria: "Condições Sanitárias",
  },
  {
    id: "nr24-refeitorio",
    nr: "NR 24",
    titulo: "Adequação de Local de Refeições",
    texto: "Disponibilizar local adequado, limpo, ventilado e protegido das intempéries para as refeições, com assentos suficientes, mesas laváveis, pia para higienização e água potável fresca.",
    categoria: "Condições Sanitárias",
  },

  // NR 17 - Ergonomia
  {
    id: "nr17-posto-trabalho",
    nr: "NR 17",
    titulo: "Ajuste Ergonômico de Mobiliário",
    texto: "Ajustar os postos de trabalho garantindo mobiliário regulável (cadeira com apoio de braço, altura ajustável e apoio para os pés), além de realizar Análise Ergonômica Preliminar (AEP).",
    categoria: "Ergonomia",
  },

  // NR 33 - Espaço Confinado
  {
    id: "nr33-pet-monitoramento",
    nr: "NR 33",
    titulo: "Emissão de PET & Monitoramento de Gases",
    texto: "Interromper a entrada no espaço confinado até a emissão formal da Permissão de Entrada e Trabalho (PET), calibração do detector multigas portátil e presença contínua de vigia treinado.",
    categoria: "Espaço Confinado",
  },

  // Recomendações Gerais Universais
  {
    id: "geral-interdicao-cautelar",
    titulo: "Interdição Cautelar Preventiva",
    texto: "Interditar temporariamente o posto de trabalho / equipamento de forma cautelar até a eliminação do grave e iminente risco constatado, comunicando a gerência imediata.",
    categoria: "Geral / Manutenção",
  },
  {
    id: "geral-manutencao-preventiva",
    titulo: "Manutenção Corretiva & Teste Operacional",
    texto: "Encaminhar o equipamento para manutenção corretiva imediata por equipe técnica especializada e somente liberar após teste operacional formal e laudo de liberação.",
    categoria: "Geral / Manutenção",
  },
  {
    id: "geral-ordem-servico",
    titulo: "Atualização de OS & Inventário de Risco",
    texto: "Revisar e atualizar a Ordem de Serviço (OS) de segurança dos trabalhadores envolvidos e integrar o perigo identificado ao Inventário de Riscos do PGR (NR-01).",
    categoria: "Geral / Gestão",
  },
];
