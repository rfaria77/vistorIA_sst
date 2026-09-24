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

// Títulos oficiais resumidos das Normas Regulamentadoras vigentes e históricas
export const TITULOS_NR: Record<string, string> = {
  "NR 01": "NR 01 - Disposições Gerais e Gerenciamento de Riscos (PGR)",
  "NR 02": "NR 02 - Inspeção Prévia (Diretrizes e Licenciamento)",
  "NR 03": "NR 03 - Embargo e Interdição (Risco Grave e Iminente)",
  "NR 04": "NR 04 - Serviços Especializados em Segurança e Medicina (SESMT)",
  "NR 05": "NR 05 - Comissão Interna de Prevenção de Acidentes e Assédio (CIPA)",
  "NR 06": "NR 06 - Equipamento de Proteção Individual (EPI)",
  "NR 07": "NR 07 - Programa de Controle Médico de Saúde Ocupacional (PCMSO)",
  "NR 08": "NR 08 - Edificações (Pisos, Paredes e Coberturas)",
  "NR 09": "NR 09 - Avaliação e Controle de Agentes Físicos, Químicos e Biológicos",
  "NR 10": "NR 10 - Segurança em Instalações e Serviços em Eletricidade",
  "NR 11": "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
  "NR 12": "NR 12 - Segurança no Trabalho em Máquinas e Equipamentos",
  "NR 13": "NR 13 - Caldeiras, Vasos de Pressão, Tubulações e Tanques Metálicos",
  "NR 14": "NR 14 - Fornos Industriais",
  "NR 15": "NR 15 - Atividades e Operações Insalubres (Ruído, Calor, Químicos)",
  "NR 16": "NR 16 - Atividades e Operações Perigosas (Inflamáveis, Eletricidade, Vigilância)",
  "NR 17": "NR 17 - Ergonomia (Mobiliário, Levantamento de Peso, AET/AEP)",
  "NR 18": "NR 18 - Segurança e Saúde na Indústria da Construção Civil",
  "NR 19": "NR 19 - Explosivos (Armazenamento, Fabricação e Transporte)",
  "NR 20": "NR 20 - Segurança com Inflamáveis e Líquidos Combustíveis",
  "NR 21": "NR 21 - Trabalhos a Céu Aberto (Intempéries, Sol e Abrigos)",
  "NR 22": "NR 22 - Segurança e Saúde Ocupacional na Mineração (PGRM)",
  "NR 23": "NR 23 - Proteção Contra Incêndios e Rotas de Fuga",
  "NR 24": "NR 24 - Condições Sanitárias e de Conforto nos Locais de Trabalho",
  "NR 25": "NR 25 - Resíduos Industriais e Efluentes Tóxicos",
  "NR 26": "NR 26 - Sinalização de Segurança e Rotulagem Preventiva GHS",
  "NR 27": "NR 27 - Registro Profissional do Técnico de Segurança (TST)",
  "NR 28": "NR 28 - Fiscalização e Penalidades Trabalhistas",
  "NR 29": "NR 29 - Segurança e Saúde no Trabalho Portuário",
  "NR 30": "NR 30 - Segurança e Saúde no Trabalho Aquaviário",
  "NR 31": "NR 31 - Segurança no Trabalho na Agricultura, Pecuária e Silvicultura",
  "NR 32": "NR 32 - Segurança e Saúde no Trabalho em Serviços de Saúde",
  "NR 33": "NR 33 - Segurança e Saúde nos Trabalhos em Espaços Confinados",
  "NR 34": "NR 34 - Indústria da Construção e Reparação Naval",
  "NR 35": "NR 35 - Trabalho em Altura (Acima de 2 Metros)",
  "NR 36": "NR 36 - Segurança em Empresas de Abate e Processamento de Carnes (Frigoríficos)",
  "NR 37": "NR 37 - Segurança e Saúde em Plataformas de Petróleo Offshore",
  "NR 38": "NR 38 - Segurança na Limpeza Urbana e Manejo de Resíduos Sólidos",
};

export const BASE_ITENS_NR: ItemNR28[] = [
  // NR 01 - Disposições Gerais e PGR
  { nr: "NR 01", item: "1.4.1", descricao: "Deixar de cumprir as disposições legais e regulamentares sobre segurança e saúde no trabalho", infracao: "I3", tipo: "S", categoria: "Disposições Gerais" },
  { nr: "NR 01", item: "1.5.3.1", descricao: "Deixar de elaborar ou de implementar o PGR (Programa de Gerenciamento de Riscos)", infracao: "I4", tipo: "S", categoria: "PGR / GRO" },
  { nr: "NR 01", item: "1.5.4.4", descricao: "Deixar de adotar medidas de prevenção conforme ordem de prioridade legal (coletiva > administrativa > EPI)", infracao: "I3", tipo: "S", categoria: "Prevenção" },
  { nr: "NR 01", item: "1.5.5.1", descricao: "Deixar de elaborar ou de manter atualizado o inventário de riscos ocupacionais no PGR", infracao: "I3", tipo: "S", categoria: "Inventário de Riscos" },
  { nr: "NR 01", item: "1.5.6.1", descricao: "Deixar de elaborar o plano de ação para atendimento às medidas de prevenção do PGR", infracao: "I2", tipo: "S", categoria: "Plano de Ação" },
  { nr: "NR 01", item: "1.6.1", descricao: "Deixar de consultar os trabalhadores quanto à percepção de riscos e melhorias no GRO", infracao: "I2", tipo: "S", categoria: "Consulta Trabalhadores" },
  { nr: "NR 01", item: "1.7.1", descricao: "Deixar de prestar informações e instruções de segurança aos trabalhadores na admissão ou mudança de função", infracao: "I2", tipo: "S", categoria: "Treinamento" },

  // NR 02 - Inspeção Prévia
  { nr: "NR 02", item: "2.1.1", descricao: "Estabelecimento novo iniciando atividades sem realizar inspeção prévia ou comunicação aos órgãos competentes", infracao: "I3", tipo: "S", categoria: "Inspeção Prévia" },
  { nr: "NR 02", item: "2.2.1", descricao: "Modificações substanciais em instalações ou processos sem nova avaliação ou licenciamento preventivo", infracao: "I3", tipo: "S", categoria: "Modificações Operacionais" },
  { nr: "NR 02", item: "2.3.1", descricao: "Deixar de manter à disposição da fiscalização o certificado de inspeção prévia quando exigido", infracao: "I2", tipo: "S", categoria: "Documentação" },

  // NR 03 - Embargo e Interdição
  { nr: "NR 03", item: "3.2.1", descricao: "Descumprir termo de embargo ou interdição de setor, obra, máquina ou equipamento", infracao: "I4", tipo: "S", categoria: "Interdição" },
  { nr: "NR 03", item: "3.3.1", descricao: "Permitir a continuidade de atividades sob condição de risco grave e iminente à integridade física", infracao: "I4", tipo: "S", categoria: "Risco Iminente" },

  // NR 04 - SESMT
  { nr: "NR 04", item: "4.2.1", descricao: "Deixar de constituir o SESMT em conformidade com o dimensionamento do Quadro II da NR 04", infracao: "I3", tipo: "S", categoria: "SESMT" },
  { nr: "NR 04", item: "4.4.1", descricao: "Deixar de registrar o SESMT junto ao órgão competente do Ministério do Trabalho", infracao: "I2", tipo: "S", categoria: "SESMT Registro" },
  { nr: "NR 04", item: "4.5.1", descricao: "Profissionais do SESMT exercendo atividades estranhas às de sua competência durante a jornada", infracao: "I2", tipo: "S", categoria: "SESMT Atuação" },

  // NR 05 - CIPA
  { nr: "NR 05", item: "5.4.1", descricao: "Deixar de constituir CIPA ou de designar responsável nos termos da norma", infracao: "I3", tipo: "S", categoria: "CIPA Constituição" },
  { nr: "NR 05", item: "5.6.1", descricao: "Deixar de incluir regras de conduta contra assédio sexual e violência nas normas e práticas da CIPA", infracao: "I3", tipo: "S", categoria: "Prevenção ao Assédio" },
  { nr: "NR 05", item: "5.7.1", descricao: "Deixar de realizar treinamento obrigatório para os membros titulares e suplentes da CIPA", infracao: "I2", tipo: "S", categoria: "CIPA Treinamento" },
  { nr: "NR 05", item: "5.9.1", descricao: "Deixar de realizar reuniões ordinárias mensais da CIPA conforme calendário estabelecido", infracao: "I2", tipo: "S", categoria: "Reuniões CIPA" },
  { nr: "NR 05", item: "5.10.1", descricao: "Deixar de realizar o processo eleitoral da CIPA nos prazos legais estabelecidos", infracao: "I2", tipo: "S", categoria: "Eleições CIPA" },

  // NR 06 - EPI
  { nr: "NR 06", item: "6.3.1", descricao: "Não fornecer ao empregado, gratuitamente, EPI adequado ao risco em perfeito estado de conservação", infracao: "I4", tipo: "S", categoria: "EPI Fornecimento" },
  { nr: "NR 06", item: "6.5.1", descricao: "Fornecer ou utilizar EPI sem Certificado de Aprovação (CA) válido expedido pelo órgão nacional", infracao: "I3", tipo: "S", categoria: "EPI Certificação" },
  { nr: "NR 06", item: "6.6.1", descricao: "Não registrar o fornecimento do EPI ao trabalhador em ficha, livro ou sistema eletrônico", infracao: "I2", tipo: "S", categoria: "EPI Registro" },
  { nr: "NR 06", item: "6.6.2", descricao: "Deixar de orientar e capacitar o trabalhador sobre o uso adequado, guarda e conservação do EPI", infracao: "I3", tipo: "S", categoria: "EPI Capacitação" },
  { nr: "NR 06", item: "6.7.1", descricao: "Deixar de higienizar e realizar a manutenção periódica dos EPIs fornecidos", infracao: "I2", tipo: "S", categoria: "EPI Manutenção" },

  // NR 07 - PCMSO
  { nr: "NR 07", item: "7.5.1", descricao: "Deixar de elaborar e implementar o PCMSO conforme os riscos ocupacionais do PGR", infracao: "I3", tipo: "M", categoria: "PCMSO" },
  { nr: "NR 07", item: "7.5.6", descricao: "Deixar de realizar exames médicos ocupacionais obrigatórios (admissional, periódico, retorno, mudança)", infracao: "I3", tipo: "M", categoria: "Exames Médicos" },
  { nr: "NR 07", item: "7.5.11", descricao: "Permitir o exercício de funções de risco sem a realização prévia de exame médico com ASO apto", infracao: "I4", tipo: "M", categoria: "Aptidão Médica" },
  { nr: "NR 07", item: "7.5.19", descricao: "Não emitir Atestado de Saúde Ocupacional (ASO) em duas vias com entrega da 2ª via ao empregado", infracao: "I2", tipo: "M", categoria: "ASO" },
  { nr: "NR 07", item: "7.6.1", descricao: "Deixar de manter o relatório analítico do PCMSO atualizado e disponível", infracao: "I2", tipo: "M", categoria: "Relatório PCMSO" },

  // NR 08 - Edificações
  { nr: "NR 08", item: "8.3.1", descricao: "Pisos dos locais de trabalho apresentando desníveis, saliências ou descontinuidades perigosas", infracao: "I2", tipo: "S", categoria: "Pisos e Circulação" },
  { nr: "NR 08", item: "8.4.1", descricao: "Aberturas nos pisos e paredes desprovidas de fechamento ou guarda-corpo de proteção contra quedas", infracao: "I3", tipo: "S", categoria: "Aberturas no Piso" },
  { nr: "NR 08", item: "8.5.1", descricao: "Partes externas de edificações sem proteção contra intempéries ou risco de queda de materiais", infracao: "I2", tipo: "S", categoria: "Estruturas" },

  // NR 09 - Agentes Ambientais
  { nr: "NR 09", item: "9.3.1", descricao: "Deixar de realizar a avaliação quantitativa das exposições ocupacionais a agentes físicos, químicos e biológicos", infracao: "I3", tipo: "S", categoria: "Higiene Ocupacional" },
  { nr: "NR 09", item: "9.4.1", descricao: "Deixar de adotar medidas de prevenção quando constatada exposição ocupacional acima dos limites de tolerância", infracao: "I4", tipo: "S", categoria: "Controle de Exposição" },
  { nr: "NR 09", item: "9.5.1", descricao: "Deixar de registrar e manter o histórico técnico das avaliações ambientais integradas ao PGR", infracao: "I2", tipo: "S", categoria: "Avaliação Ambiental" },

  // NR 10 - Eletricidade
  { nr: "NR 10", item: "10.2.8.1", descricao: "Não priorizar medidas de proteção coletiva em instalações elétricas (desenergização e bloqueio)", infracao: "I4", tipo: "S", categoria: "Elétrica Coletiva" },
  { nr: "NR 10", item: "10.4.1", descricao: "Instalações e quadros elétricos com partes vivas expostas ou sem sinalização de advertência", infracao: "I4", tipo: "S", categoria: "Quadros Elétricos" },
  { nr: "NR 10", item: "10.8.8", descricao: "Permitir trabalho em instalações elétricas por pessoa não autorizada ou sem capacitação de 40h", infracao: "I4", tipo: "S", categoria: "Capacitação NR 10" },
  { nr: "NR 10", item: "10.2.4", descricao: "Estabelecimentos com carga instalada superior a 75 kW sem Prontuário de Instalações Elétricas (PIE)", infracao: "I3", tipo: "S", categoria: "Prontuário PIE" },
  { nr: "NR 10", item: "10.6.1", descricao: "Trabalhos em proximidade de redes elétricas sem delimitação ou barreiras de proteção", infracao: "I4", tipo: "S", categoria: "Segurança em Alt Tensão" },

  // NR 11 - Transporte e Movimentação
  { nr: "NR 11", item: "11.1.3", descricao: "Operação de equipamentos de transporte motorizado (empilhadeira, ponte rolante) por operador sem capacitação", infracao: "I3", tipo: "S", categoria: "Operação de Cargas" },
  { nr: "NR 11", item: "11.1.5", descricao: "Equipamentos de elevação e içamento sem indicação visível da carga máxima permitida de trabalho", infracao: "I2", tipo: "S", categoria: "Içamento" },
  { nr: "NR 11", item: "11.3.1", descricao: "Empilhamento de materiais obstruindo saídas de emergência, extintores ou com risco de desabamento", infracao: "I3", tipo: "S", categoria: "Armazenamento" },
  { nr: "NR 11", item: "11.2.1", descricao: "Cabos de aço, correntes e cintas de elevação com desgaste excessivo ou sem inspeção regular", infracao: "I3", tipo: "S", categoria: "Acessórios de Içamento" },

  // NR 12 - Máquinas e Equipamentos
  { nr: "NR 12", item: "12.5.1", descricao: "Zonas de perigo de máquinas e equipamentos desprovidas de sistemas de segurança físicos ou intertravados", infracao: "I4", tipo: "S", categoria: "Proteção de Máquinas" },
  { nr: "NR 12", item: "12.6.1", descricao: "Máquinas sem dispositivos de parada de emergência acessíveis, funcionais ou do tipo correto", infracao: "I3", tipo: "S", categoria: "Parada de Emergência" },
  { nr: "NR 12", item: "12.16.1", descricao: "Operação, abastecimento, limpeza ou manutenção de máquinas por trabalhador sem capacitação teórica e prática", infracao: "I3", tipo: "S", categoria: "Capacitação NR 12" },
  { nr: "NR 12", item: "12.11.1", descricao: "Inexistência de inventário e manuais de operação de máquinas e equipamentos em língua portuguesa", infracao: "I2", tipo: "S", categoria: "Documentação NR 12" },
  { nr: "NR 12", item: "12.138", descricao: "Sistemas elétricos de comando sem proteção contra religamento acidental ou falhas", infracao: "I4", tipo: "S", categoria: "Comando Elétrico" },

  // NR 13 - Caldeiras e Vasos de Pressão
  { nr: "NR 13", item: "13.3.1", descricao: "Operação de caldeira ou vaso de pressão sem prontuário do fabricante, projeto ou registro de segurança", infracao: "I4", tipo: "S", categoria: "Prontuário NR 13" },
  { nr: "NR 13", item: "13.4.1", descricao: "Caldeira ou vaso de pressão sem válvula de segurança calibrada ou manômetro funcional", infracao: "I4", tipo: "S", categoria: "Válvula de Segurança" },
  { nr: "NR 13", item: "13.5.1", descricao: "Deixar de realizar inspeção periódica de segurança em vasos de pressão por Profissional Habilitado (PH)", infracao: "I4", tipo: "S", categoria: "Inspeção NR 13" },
  { nr: "NR 13", item: "13.3.4", descricao: "Operação de caldeiras por operador sem treinamento ou estágio prático supervisionado conforme norma", infracao: "I3", tipo: "S", categoria: "Operador de Caldeira" },

  // NR 14 - Fornos Industriais
  { nr: "NR 14", item: "14.1.1", descricao: "Fornos industriais instalados sem isolamento térmico adequado, gerando irradiação excessiva aos trabalhadores", infracao: "I3", tipo: "S", categoria: "Isolamento Térmico" },
  { nr: "NR 14", item: "14.2.1", descricao: "Fornos sem chaminé ou sistema mecânico de exaustão capaz de eliminar gases e vapores de combustão", infracao: "I3", tipo: "S", categoria: "Gases de Fornos" },

  // NR 15 - Atividades e Operações Insalubres
  { nr: "NR 15", item: "15.1.1", descricao: "Atividades exercidas com exposição a agentes nocivos sem laudo técnico conclusivo (LTCAT/PGR)", infracao: "I3", tipo: "S", categoria: "Laudo Insalubridade" },
  { nr: "NR 15", item: "15.2.1", descricao: "Exposição ocupacional a níveis de ruído contínuo acima dos limites de tolerância sem proteção eficaz", infracao: "I4", tipo: "S", categoria: "Ruído Insalubre" },
  { nr: "NR 15", item: "15.4.1", descricao: "Manipulação de agentes químicos cancerígenos ou asfixiantes sem ventilação exaustora e EPR certificado", infracao: "I4", tipo: "S", categoria: "Químicos Perigosos" },

  // NR 16 - Atividades e Operações Perigosas
  { nr: "NR 16", item: "16.2.1", descricao: "Exercício de atividades perigosas (inflamáveis, explosivos, alta tensão) sem laudo técnico de periculosidade", infracao: "I3", tipo: "S", categoria: "Laudo Periculosidade" },
  { nr: "NR 16", item: "16.8.1", descricao: "Permanência de trabalhadores em área de risco delimitada sem autorização prévia e procedimentos operacionais", infracao: "I4", tipo: "S", categoria: "Área Perigosa" },

  // NR 17 - Ergonomia
  { nr: "NR 17", item: "17.3.1", descricao: "Deixar de realizar Avaliação Ergonômica Preliminar (AEP) ou Análise Ergonômica do Trabalho (AET)", infracao: "I3", tipo: "S", categoria: "AET / AEP" },
  { nr: "NR 17", item: "17.4.1", descricao: "Postos de trabalho e mobiliário (mesas, bancadas, assentos) sem regulagem ergonômica ajustável", infracao: "I2", tipo: "S", categoria: "Mobiliário" },
  { nr: "NR 17", item: "17.5.1", descricao: "Levantamento e transporte manual de cargas com peso excessivo sem auxílio mecânico ou técnica correta", infracao: "I3", tipo: "S", categoria: "Cargas Manuais" },
  { nr: "NR 17", item: "17.6.1", descricao: "Trabalho contínuo no computador ou teleatendimento sem pausas regulares para alívio muscular", infracao: "I2", tipo: "S", categoria: "Pausas Ergonômicas" },

  // NR 18 - Construção Civil
  { nr: "NR 18", item: "18.4.1", descricao: "Início de obras e canteiros de construção sem elaboração e implementação prévia do PGR da Construção", infracao: "I4", tipo: "S", categoria: "PGR Obra" },
  { nr: "NR 18", item: "18.5.1", descricao: "Canteiro de obras desprovido de instalações sanitárias, vestiários ou áreas de vivência adequadas", infracao: "I3", tipo: "S", categoria: "Áreas de Vivência" },
  { nr: "NR 18", item: "18.9.1", descricao: "Periferias de lajes e aberturas no piso sem proteção coletiva contra quedas (guarda-corpo e rodapé)", infracao: "I4", tipo: "S", categoria: "Guarda-Corpo" },
  { nr: "NR 18", item: "18.10.1", descricao: "Andaime montado em desacordo com projeto, sem travamento diagonal, ancoragem ou rodapé completo", infracao: "I4", tipo: "S", categoria: "Andaimes" },
  { nr: "NR 18", item: "18.11.1", descricao: "Utilização de serra circular de bancada sem coifa protetora de lâmina, cutelo ou travamento seguro", infracao: "I4", tipo: "S", categoria: "Serra Circular" },

  // NR 19 - Explosivos
  { nr: "NR 19", item: "19.2.1", descricao: "Armazenamento ou manuseio de substâncias explosivas sem licença expedida pelo Exército Brasileiro", infracao: "I4", tipo: "S", categoria: "Licença Explosivos" },
  { nr: "NR 19", item: "19.4.1", descricao: "Depósito de explosivos sem sistema de proteção contra descargas atmosféricas (SPDA) ou barreira física", infracao: "I4", tipo: "S", categoria: "Paiol de Explosivos" },

  // NR 20 - Inflamáveis e Combustíveis
  { nr: "NR 20", item: "20.5.1", descricao: "Armazenamento ou manipulação de inflamáveis e combustíveis sem prontuário da instalação atualizado", infracao: "I3", tipo: "S", categoria: "Prontuário NR 20" },
  { nr: "NR 20", item: "20.6.1", descricao: "Instalação de inflamáveis sem projeto e procedimentos de contenção de vazamentos e derramamentos", infracao: "I4", tipo: "S", categoria: "Contenção de Inflamáveis" },
  { nr: "NR 20", item: "20.7.1", descricao: "Trabalhadores em contato com inflamáveis sem capacitação específica obrigatória da NR 20", infracao: "I3", tipo: "S", categoria: "Capacitação NR 20" },
  { nr: "NR 20", item: "20.10.1", descricao: "Realização de serviços a quente em áreas com vapores inflamáveis sem Permissão de Trabalho (PT)", infracao: "I4", tipo: "S", categoria: "Trabalho a Quente" },

  // NR 21 - Céu Aberto
  { nr: "NR 21", item: "21.1.1", descricao: "Falta de abrigos adequados contra intempéries (sol, chuva, ventos) para os postos a céu aberto", infracao: "I2", tipo: "S", categoria: "Abrigo Intempéries" },
  { nr: "NR 21", item: "21.2.1", descricao: "Frentes de trabalho a céu aberto sem disponibilização de água potável fresca e recursos de primeiros socorros", infracao: "I2", tipo: "S", categoria: "Condições de Campo" },

  // NR 22 - Mineração
  { nr: "NR 22", item: "22.3.1", descricao: "Atividades de mineração sem elaboração e execução do PGRM e monitoramento contínuo de riscos", infracao: "I4", tipo: "S", categoria: "PGRM Mineração" },
  { nr: "NR 22", item: "22.7.1", descricao: "Frentes de lavra, taludes e galerias sem monitoramento geotécnico de estabilidade ou sem escoramento", infracao: "I4", tipo: "S", categoria: "Estabilidade de Taludes" },
  { nr: "NR 22", item: "22.12.1", descricao: "Mina subterrânea sem sistema mecânico de ventilação principal ou com teor de oxigênio insuficiente", infracao: "I4", tipo: "S", categoria: "Ventilação de Mina" },

  // NR 23 - Incêndios
  { nr: "NR 23", item: "23.1.1", descricao: "Locais de trabalho desprovidos de extintores de combate a incêndio adequados ou com carga vencida", infracao: "I3", tipo: "S", categoria: "Extintores" },
  { nr: "NR 23", item: "23.2.1", descricao: "Equipamentos de combate a incêndio (extintores, hidrantes) bloqueados ou sem sinalização visível", infracao: "I2", tipo: "S", categoria: "Acesso a Extintores" },
  { nr: "NR 23", item: "23.3.1", descricao: "Rotas de fuga e saídas de emergência trancadas, obstruídas ou sem iluminação de emergência", infracao: "I3", tipo: "S", categoria: "Rotas de Fuga" },
  { nr: "NR 23", item: "23.4.1", descricao: "Estabelecimento sem colaboradores capacitados para operação de combate a princípios de incêndio (brigada)", infracao: "I2", tipo: "S", categoria: "Brigada" },

  // NR 24 - Condições Sanitárias
  { nr: "NR 24", item: "24.2.1", descricao: "Instalações sanitárias em número insuficiente, sem separação por sexo ou em más condições de higiene", infracao: "I2", tipo: "S", categoria: "Sanitários" },
  { nr: "NR 24", item: "24.3.1", descricao: "Vestiários desprovidos de armários individuais ou sem compartimento duplo para atividades insalubres", infracao: "I2", tipo: "S", categoria: "Vestiários" },
  { nr: "NR 24", item: "24.4.1", descricao: "Inexistência de refeitório ou local adequado para refeições com pia e água potável", infracao: "I2", tipo: "S", categoria: "Refeitórios" },

  // NR 25 - Resíduos Industriais
  { nr: "NR 25", item: "25.1.1", descricao: "Descarte de resíduos industriais perigosos diretamente no solo ou rede de esgoto sem tratamento", infracao: "I4", tipo: "S", categoria: "Efluentes Industriais" },
  { nr: "NR 25", item: "25.2.1", descricao: "Armazenamento de resíduos perigosos em recipientes inadequados, sem identificação ou bacia de contenção", infracao: "I3", tipo: "S", categoria: "Resíduos Perigosos" },

  // NR 26 - Sinalização de Segurança
  { nr: "NR 26", item: "26.2.1", descricao: "Produtos químicos perigosos sem rotulagem preventiva conforme Sistema Globalmente Harmonizado (GHS)", infracao: "I3", tipo: "S", categoria: "Rotulagem GHS" },
  { nr: "NR 26", item: "26.2.3", descricao: "Falta de Ficha de Dados de Segurança (FDS / FISPQ) acessível aos trabalhadores em postos com químicos", infracao: "I2", tipo: "S", categoria: "FDS / FISPQ" },
  { nr: "NR 26", item: "26.3.1", descricao: "Tubulações de fluidos perigosos sem identificação por cores de segurança padronizadas", infracao: "I2", tipo: "S", categoria: "Tubulações" },

  // NR 27 - Registro Profissional (Técnico de Segurança)
  { nr: "NR 27", item: "27.1.1", descricao: "Exercício da profissão de Técnico de Segurança do Trabalho sem o devido registro profissional no Ministério do Trabalho", infracao: "I2", tipo: "S", categoria: "Registro TST" },

  // NR 28 - Fiscalização e Penalidades
  { nr: "NR 28", item: "28.1.1", descricao: "Embaraço à fiscalização do trabalho, recusa na exibição de documentos ou descumprimento de notificação", infracao: "I4", tipo: "S", categoria: "Fiscalização" },
  { nr: "NR 28", item: "28.2.1", descricao: "Descumprimento dos prazos de adequação estabelecidos em termo de notificação ou compromisso", infracao: "I3", tipo: "S", categoria: "Prazos de Notificação" },

  // NR 29 - Trabalho Portuário
  { nr: "NR 29", item: "29.3.1", descricao: "Terminais e instalações portuárias sem Plano de Controle de Emergência (PCE) atualizado", infracao: "I4", tipo: "S", categoria: "Emergência Portuária" },
  { nr: "NR 29", item: "29.4.1", descricao: "Acesso a embarcações por escadas de portal ou pranchas sem rede de proteção contra quedas na água", infracao: "I4", tipo: "S", categoria: "Acesso Portuário" },

  // NR 30 - Trabalho Aquaviário
  { nr: "NR 30", item: "30.4.1", descricao: "Embarcação navegando sem dotação completa de coletes salva-vidas homologados ou balsas funcionais", infracao: "I4", tipo: "S", categoria: "Salvamento Aquaviário" },
  { nr: "NR 30", item: "30.5.1", descricao: "Descumprimento das escalas de descanso obrigatórias dos tripulantes aquaviários a bordo", infracao: "I3", tipo: "S", categoria: "Escalas a Bordo" },

  // NR 31 - Agricultura, Pecuária e Silvicultura
  { nr: "NR 31", item: "31.5.1", descricao: "Aplicação de defensivos agrícolas/agrotóxicos por trabalhador sem capacitação de 20h ou sem EPI completo", infracao: "I4", tipo: "S", categoria: "Agrotóxicos" },
  { nr: "NR 31", item: "31.6.1", descricao: "Tratores e implementos agrícolas sem estrutura de proteção contra capotamento (ROPS) ou cinto de segurança", infracao: "I4", tipo: "S", categoria: "Tratores Agrícolas" },
  { nr: "NR 31", item: "31.8.1", descricao: "Frentes de colheita sem abrigos para refeição, água potável fresca e sanitários móveis limpos", infracao: "I2", tipo: "S", categoria: "Vivência Rural" },

  // NR 32 - Serviços de Saúde
  { nr: "NR 32", item: "32.2.4", descricao: "Utilização de materiais perfurocortantes (agulhas, cateteres) sem dispositivo integrado de segurança", infracao: "I4", tipo: "S", categoria: "Perfurocortantes" },
  { nr: "NR 32", item: "32.2.2", descricao: "Deixar de fornecer gratuitamente aos profissionais da saúde o esquema vacinal ocupacional obrigatório", infracao: "I3", tipo: "M", categoria: "Vacinas Ocupacionais" },
  { nr: "NR 32", item: "32.3.1", descricao: "Descarte de resíduos infectantes fora de sacos plásticos leitosos com identificação biológica", infracao: "I3", tipo: "S", categoria: "Resíduos Hospitalares" },

  // NR 33 - Espaços Confinados
  { nr: "NR 33", item: "33.3.1", descricao: "Trabalho em espaço confinado sem emissão prévia de Permissão de Entrada e Trabalho (PET)", infracao: "I4", tipo: "S", categoria: "PET Confinado" },
  { nr: "NR 33", item: "33.3.2", descricao: "Entrada em espaço confinado sem monitoramento prévio e contínuo da atmosfera com detector multigás", infracao: "I4", tipo: "S", categoria: "Atmosfera" },
  { nr: "NR 33", item: "33.3.3", descricao: "Realização de atividades em espaço confinado sem a presença contínua de vigia do lado externo", infracao: "I4", tipo: "S", categoria: "Vigia Confinado" },
  { nr: "NR 33", item: "33.3.5", descricao: "Operação sem sistema de resgate montado (tripé com guincho e trava-quedas) para remoção rápida", infracao: "I4", tipo: "S", categoria: "Resgate Confinado" },

  // NR 34 - Construção e Reparação Naval
  { nr: "NR 34", item: "34.5.1", descricao: "Execução de trabalhos a quente em tanques e compartimentos navais sem teste de estanqueidade e desgaseificação", infracao: "I4", tipo: "S", categoria: "Trabalho a Quente Naval" },
  { nr: "NR 34", item: "34.6.1", descricao: "Movimentação de blocos e cargas navais sem plano de rigging e inspeção prévia de olhais e cabos", infracao: "I4", tipo: "S", categoria: "Rigging Naval" },

  // NR 35 - Trabalho em Altura
  { nr: "NR 35", item: "35.2.1", descricao: "Trabalho em altura executado sem Análise de Risco (AR) e emissão prévia de Permissão de Trabalho (PT)", infracao: "I4", tipo: "S", categoria: "PT Altura" },
  { nr: "NR 35", item: "35.3.1", descricao: "Autorizar trabalho em altura por colaborador sem treinamento bienal de 8 horas e ASO de aptidão para altura", infracao: "I3", tipo: "S", categoria: "Capacitação Altura" },
  { nr: "NR 35", item: "35.4.1", descricao: "Trabalho em altura sem sistema de proteção individual contra quedas (SPIQ) adequado ou sem linha de vida", infracao: "I4", tipo: "S", categoria: "SPIQ e Ancoragem" },
  { nr: "NR 35", item: "35.5.1", descricao: "Uso de escadas portáteis sem amarração, apoio antiderrapante ou ultrapassando o limite seguro de uso", infracao: "I3", tipo: "S", categoria: "Escadas" },

  // NR 36 - Frigoríficos e Abate
  { nr: "NR 36", item: "36.2.1", descricao: "Trabalhadores em salas de cortes e desossa de frigoríficos sem concessão de pausas psicofisiológicas regulares", infracao: "I3", tipo: "S", categoria: "Pausas Frigoríficas" },
  { nr: "NR 36", item: "36.4.1", descricao: "Postos de trabalho em frigoríficos sem bancadas ajustáveis, apoio para pés e facas ergonômicas afiadas", infracao: "I2", tipo: "S", categoria: "Ergonomia Frigorífica" },
  { nr: "NR 36", item: "36.12.1", descricao: "Trabalho contínuo em câmaras frias sem vestimenta térmica completa e proteção contra congelamento", infracao: "I3", tipo: "S", categoria: "Câmara Fria" },

  // NR 37 - Plataformas de Petróleo Offshore
  { nr: "NR 37", item: "37.4.1", descricao: "Operação de plataforma marítima sem Comissão Interna de Prevenção de Acidentes a Bordo (CIPATP)", infracao: "I3", tipo: "S", categoria: "CIPATP Offshore" },
  { nr: "NR 37", item: "37.14.1", descricao: "Sistemas de detecção de vazamento de gás inflamável e H2S na plataforma inoperantes ou descalibrados", infracao: "I4", tipo: "S", categoria: "Detecção de Gás Offshore" },

  // NR 38 - Limpeza Urbana e Resíduos Sólidos
  { nr: "NR 38", item: "38.3.1", descricao: "Atividades de limpeza urbana e coleta sem PGR específico contemplando riscos biológicos e atropelamento", infracao: "I3", tipo: "S", categoria: "PGR Limpeza Urbana" },
  { nr: "NR 38", item: "38.5.1", descricao: "Coletores de resíduos sem calçado de proteção com palmilha antiperfuro e luvas resistentes a perfuração/corte", infracao: "I4", tipo: "S", categoria: "EPI Limpeza Urbana" },
  { nr: "NR 38", item: "38.6.1", descricao: "Caminhão compactador de lixo operando com estribo danificado, sem alça ergonômica ou sem câmera de ré", infracao: "I4", tipo: "S", categoria: "Caminhões Coletores" },
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

