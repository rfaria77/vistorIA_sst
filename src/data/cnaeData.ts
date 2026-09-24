// Tabela de Classificação Nacional de Atividades Econômicas (CNAE) e Grau de Risco (NR 04 - Quadro I)

export interface CNAEItem {
  codigo: string; // Ex: "41.20-4" ou "4120-4"
  descricao: string;
  grauRisco: 1 | 2 | 3 | 4;
  categoria: string;
}

export const CATEGORIAS_CNAE: string[] = [
  "Todos",
  "Construção Civil",
  "Indústria & Metalúrgica",
  "Alimentos & Agroindústria",
  "Agropecuária & Florestal",
  "Comércio & Varejo",
  "Transporte & Logística",
  "Saúde & Clínicas",
  "Alimentação & Hotelaria",
  "Educação & Ensino",
  "Serviços & Escritório",
  "Tecnologia & TI",
  "Mineração & Energia",
];

export const LISTA_CNAE_NR04: CNAEItem[] = [
  // ==========================================
  // 1. CONSTRUÇÃO CIVIL E INSTALAÇÕES
  // ==========================================
  { codigo: "41.20-4", descricao: "Construção de edifícios residenciais e comerciais", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "41.10-7", descricao: "Incorporação de empreendimentos imobiliários", grauRisco: 1, categoria: "Construção Civil" },
  { codigo: "42.11-1", descricao: "Construção de rodovias e ferrovias", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "42.12-0", descricao: "Construção de obras de arte especiais (pontes, viadutos e túneis)", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "42.13-8", descricao: "Obras de urbanização - ruas, praças e calçadas", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "42.21-9", descricao: "Obras para geração e distribuição de energia elétrica e telecomunicações", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "42.22-7", descricao: "Construção de redes de abastecimento de água, coleta de esgoto e redes de gás", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "42.91-0", descricao: "Obras portuárias, marítimas e fluviais", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "42.92-8", descricao: "Montagem de instalações industriais e de estruturas metálicas de grande porte", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "43.11-8", descricao: "Demolição e preparação de canteiros de obras", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "43.13-4", descricao: "Obras de terraplenagem, aterro e escavação", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "43.19-3", descricao: "Sondagens, perfurações de solo e poços artesianos", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "43.21-5", descricao: "Instalação e manutenção elétrica predial e industrial", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "43.22-3", descricao: "Instalações hidráulicas, de sistemas de ventilação, refrigeração e gás", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "43.29-1", descricao: "Instalação de painéis solares fotovoltaicos e elevadores", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "43.30-4", descricao: "Obras de acabamento da construção, gesso, pisos e pintura em altura", grauRisco: 3, categoria: "Construção Civil" },
  { codigo: "43.91-6", descricao: "Obras de fundações especiais, estaqueamento e contenção de encostas", grauRisco: 4, categoria: "Construção Civil" },
  { codigo: "43.99-1", descricao: "Serviços especializados para construção (montagem de andaimes e estruturas provisórias)", grauRisco: 4, categoria: "Construção Civil" },

  // ==========================================
  // 2. INDÚSTRIA METALMECÂNICA, METALURGIA & AUTOMOTIVA
  // ==========================================
  { codigo: "24.11-7", descricao: "Produção de ferro-gusa e de ferroligas", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "24.21-4", descricao: "Produção de semiacabados de aço e laminação", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "24.51-2", descricao: "Fundição de ferro e aço", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "25.11-0", descricao: "Fabricação de estruturas metálicas e galpões", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "25.12-8", descricao: "Fabricação de esquadrias de metal (portas, janelas e portões)", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "25.21-7", descricao: "Fabricação de tanques, reservatórios metálicos e caldeiraria pesada", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "25.39-0", descricao: "Serviços de usinagem, tornearia, fresa, solda e tratamento térmico de metais", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "25.42-0", descricao: "Fabricação de ferramentas e serralheria", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "28.11-9", descricao: "Fabricação de motores, bombas, compressores e turbinas", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "28.31-3", descricao: "Fabricação de tratores agrícolas e colheitadeiras", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "28.69-1", descricao: "Fabricação de máquinas e equipamentos de uso industrial específico", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "29.10-7", descricao: "Fabricação de automóveis, camionetas e utilitários", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "29.20-4", descricao: "Fabricação de caminhões e ônibus", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "29.30-1", descricao: "Fabricação de cabines, carrocerias e reboques para veículos automotores", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "29.49-2", descricao: "Fabricação de autopeças e acessórios para veículos automotores", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "33.14-7", descricao: "Manutenção e reparação de máquinas e equipamentos industriais", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "33.21-0", descricao: "Instalação de máquinas e equipamentos industriais", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "45.20-0", descricao: "Oficina mecânica - manutenção e reparação mecânica e elétrica de veículos", grauRisco: 3, categoria: "Indústria & Metalúrgica" },

  // ==========================================
  // 3. INDÚSTRIA QUÍMICA, PETROQUÍMICA & PLÁSTICOS
  // ==========================================
  { codigo: "19.21-7", descricao: "Refino de petróleo e produção de combustíveis", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "19.31-4", descricao: "Fabricação de álcool combustível (etanol)", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "20.13-4", descricao: "Fabricação de adubos e fertilizantes", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "20.21-5", descricao: "Fabricação de produtos químicos inorgânicos básicos", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "20.29-1", descricao: "Fabricação de tintas, vernizes, esmaltes e solventes", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "20.51-7", descricao: "Fabricação de defensivos agrícolas e agrotóxicos", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "20.62-2", descricao: "Fabricação de sabões, detergentes e produtos de limpeza", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "21.21-1", descricao: "Fabricação de medicamentos para uso humano (indústria farmacêutica)", grauRisco: 2, categoria: "Indústria & Metalúrgica" },
  { codigo: "22.11-1", descricao: "Fabricação de pneumáticos, câmaras-de-ar e recapagem de pneus", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "22.29-3", descricao: "Fabricação de artefatos de material plástico e embalagens", grauRisco: 3, categoria: "Indústria & Metalúrgica" },
  { codigo: "23.30-3", descricao: "Fabricação de artefatos de concreto, cimento e fibrocimento", grauRisco: 4, categoria: "Indústria & Metalúrgica" },
  { codigo: "23.42-7", descricao: "Fabricação de produtos cerâmicos para construção (tijolos e telhas)", grauRisco: 3, categoria: "Indústria & Metalúrgica" },

  // ==========================================
  // 4. ALIMENTOS, BEBIDAS & AGROINDÚSTRIA
  // ==========================================
  { codigo: "10.11-2", descricao: "Frigorífico - abate de reses e bovinos e desossa", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.12-1", descricao: "Frigorífico - abate de aves, frangos e suínos", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.13-9", descricao: "Fabricação de produtos de carne (embutidos, charque e defumados)", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.41-4", descricao: "Fabricação de óleos vegetais em bruto e refinados (esmagamento de soja)", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.51-1", descricao: "Preparação do leite e fabricação de laticínios (queijos e iogurtes)", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.61-9", descricao: "Beneficiamento de arroz, moagem de trigo e fabricação de farinhas", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.66-0", descricao: "Fabricação de rações balanceadas para animais", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.71-6", descricao: "Fabricação de açúcar em bruto e refinado (usinas de açúcar)", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.81-3", descricao: "Torrefação e moagem de café", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "10.91-1", descricao: "Fabricação de produtos de panificação, pães industriais e biscoitos", grauRisco: 2, categoria: "Alimentos & Agroindústria" },
  { codigo: "11.11-9", descricao: "Fabricação de cervejas e chopes", grauRisco: 3, categoria: "Alimentos & Agroindústria" },
  { codigo: "11.22-4", descricao: "Fabricação de refrigerantes, sucos e águas envasadas", grauRisco: 3, categoria: "Alimentos & Agroindústria" },

  // ==========================================
  // 5. AGROPECUÁRIA & FLORESTAL (CAEPF / NR-31 / RURAL)
  // ==========================================
  { codigo: "01.11-3", descricao: "Cultivo de cereais (soja, milho, sorgo, trigo, arroz)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.15-6", descricao: "Cultivo de soja em grão", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.13-0", descricao: "Cultivo de cana-de-açúcar", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.21-1", descricao: "Horticultura e produtos de olericultura (hortaliças e legumes)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.31-8", descricao: "Cultivo de café (cafeicultura)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.33-4", descricao: "Cultivo de frutas cítricas (laranja, limão e tangerina)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.34-2", descricao: "Cultivo de outras frutas de lavoura permanente (maçã, uva e banana)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.41-5", descricao: "Cultivo de algodão herbáceo", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.51-2", descricao: "Criação de bovinos para corte e leite (pecuária e confinamento)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.52-1", descricao: "Criação de outros animais de grande porte (equinos, muares e asininos)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.54-7", descricao: "Criação de suínos (suinocultura comercial)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.55-5", descricao: "Criação de aves (avicultura de corte e postura)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.61-0", descricao: "Atividades de apoio à agricultura (preparo de solo, plantio e colheita mecanizada)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "01.62-8", descricao: "Atividades de apoio à pecuária e manejo animal (inseminação e tosquia)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "02.10-1", descricao: "Produção florestal - florestas plantadas (eucalipto, pinus e teca)", grauRisco: 3, categoria: "Agropecuária & Florestal" },
  { codigo: "02.20-9", descricao: "Extração de madeira em florestas nativas e desbaste", grauRisco: 4, categoria: "Agropecuária & Florestal" },

  // ==========================================
  // 6. COMÉRCIO VAREJISTA & ATACADISTA
  // ==========================================
  { codigo: "47.11-3", descricao: "Comércio varejista de mercadorias em geral (supermercados e hipermercados)", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "47.12-1", descricao: "Comércio varejista de mercadorias em geral (minimercados, mercearias e armazéns)", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "47.21-1", descricao: "Padaria e confeitaria com venda direta ao consumidor", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "47.22-9", descricao: "Comércio varejista de carnes - açougues", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "47.31-8", descricao: "Comércio varejista de combustíveis para veículos (postos de gasolina)", grauRisco: 3, categoria: "Comércio & Varejo" },
  { codigo: "47.44-0", descricao: "Comércio varejista de materiais de construção em geral", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "47.51-2", descricao: "Comércio varejista especializado de equipamentos de informática e telefonia", grauRisco: 1, categoria: "Comércio & Varejo" },
  { codigo: "47.53-9", descricao: "Comércio varejista especializado de eletrodomésticos e áudio/vídeo", grauRisco: 1, categoria: "Comércio & Varejo" },
  { codigo: "47.71-7", descricao: "Comércio varejista de produtos farmacêuticos (farmácias e drogarias)", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "47.81-0", descricao: "Comércio varejista de artigos do vestuário e acessórios", grauRisco: 1, categoria: "Comércio & Varejo" },
  { codigo: "45.11-1", descricao: "Comércio a varejo de automóveis, camionetas e utilitários novos e usados (concessionárias)", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "45.30-7", descricao: "Comércio de peças e acessórios para veículos automotores", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "46.11-7", descricao: "Representantes comerciais e agentes do comércio de matérias-primas e insumos", grauRisco: 1, categoria: "Comércio & Varejo" },
  { codigo: "46.39-7", descricao: "Comércio atacadista de produtos alimentícios em geral", grauRisco: 2, categoria: "Comércio & Varejo" },
  { codigo: "46.71-1", descricao: "Comércio atacadista de madeira e produtos derivados", grauRisco: 3, categoria: "Comércio & Varejo" },
  { codigo: "46.83-4", descricao: "Comércio atacadista de defensivos agrícolas, adubos e fertilizantes", grauRisco: 3, categoria: "Comércio & Varejo" },

  // ==========================================
  // 7. TRANSPORTE, LOGÍSTICA & ARMAZENAMENTO
  // ==========================================
  { codigo: "49.21-3", descricao: "Transporte rodoviário coletivo de passageiros, urbano e metropolitano", grauRisco: 3, categoria: "Transporte & Logística" },
  { codigo: "49.22-1", descricao: "Transporte rodoviário coletivo de passageiros, intermunicipal e interestadual", grauRisco: 3, categoria: "Transporte & Logística" },
  { codigo: "49.23-0", descricao: "Transporte rodoviário de táxi e transporte por aplicativo", grauRisco: 2, categoria: "Transporte & Logística" },
  { codigo: "49.29-9", descricao: "Transporte rodoviário coletivo de passageiros sob regime de fretamento", grauRisco: 3, categoria: "Transporte & Logística" },
  { codigo: "49.30-2", descricao: "Transporte rodoviário de carga em geral, interestadual e internacional", grauRisco: 3, categoria: "Transporte & Logística" },
  { codigo: "52.11-7", descricao: "Armazenamento e depósito de mercadorias (armazéns gerais e centros de distribuição)", grauRisco: 3, categoria: "Transporte & Logística" },
  { codigo: "52.12-5", descricao: "Carga e descarga de mercadorias em terminais e galpões", grauRisco: 3, categoria: "Transporte & Logística" },
  { codigo: "52.29-0", descricao: "Atividades auxiliares dos transportes terrestres (estacionamentos e guinchos)", grauRisco: 2, categoria: "Transporte & Logística" },
  { codigo: "53.20-2", descricao: "Serviços de entrega rápida (motofrete e encomendas)", grauRisco: 3, categoria: "Transporte & Logística" },

  // ==========================================
  // 8. SAÚDE, CLÍNICAS & HOSPITAIS
  // ==========================================
  { codigo: "86.10-1", descricao: "Atividades de atendimento hospitalar e prontos-socorros", grauRisco: 3, categoria: "Saúde & Clínicas" },
  { codigo: "86.21-6", descricao: "Serviços móveis de atendimento a urgências e ambulâncias", grauRisco: 3, categoria: "Saúde & Clínicas" },
  { codigo: "86.30-5", descricao: "Atividade médica ambulatorial com recursos para procedimentos cirúrgicos e exames", grauRisco: 3, categoria: "Saúde & Clínicas" },
  { codigo: "86.40-2", descricao: "Laboratórios de análises clínicas e diagnóstico por imagem (raio-X, tomografia)", grauRisco: 3, categoria: "Saúde & Clínicas" },
  { codigo: "86.50-0", descricao: "Atividades de profissionais da área de saúde (fisioterapia, fonoaudiologia, enfermagem)", grauRisco: 2, categoria: "Saúde & Clínicas" },
  { codigo: "86.90-9", descricao: "Atividades de atenção à saúde humana não especificadas anteriormente (vacinação)", grauRisco: 2, categoria: "Saúde & Clínicas" },
  { codigo: "75.00-1", descricao: "Atividades veterinárias (clínicas e hospitais veterinários)", grauRisco: 3, categoria: "Saúde & Clínicas" },

  // ==========================================
  // 9. ALIMENTAÇÃO & HOTELARIA
  // ==========================================
  { codigo: "55.10-8", descricao: "Hotéis e apart-hotéis", grauRisco: 2, categoria: "Alimentação & Hotelaria" },
  { codigo: "55.90-5", descricao: "Outros tipos de alojamento (pousadas e pensões)", grauRisco: 2, categoria: "Alimentação & Hotelaria" },
  { codigo: "56.11-2", descricao: "Restaurantes, bares, lanchonetes e similares", grauRisco: 2, categoria: "Alimentação & Hotelaria" },
  { codigo: "56.20-1", descricao: "Serviços de alimentação para eventos e refeições coletivas (buffet e catering)", grauRisco: 2, categoria: "Alimentação & Hotelaria" },

  // ==========================================
  // 10. EDUCAÇÃO & ENSINO
  // ==========================================
  { codigo: "85.11-2", descricao: "Educação infantil - creche", grauRisco: 2, categoria: "Educação & Ensino" },
  { codigo: "85.12-1", descricao: "Educação infantil - pré-escola", grauRisco: 2, categoria: "Educação & Ensino" },
  { codigo: "85.13-9", descricao: "Ensino fundamental", grauRisco: 2, categoria: "Educação & Ensino" },
  { codigo: "85.20-1", descricao: "Ensino médio", grauRisco: 2, categoria: "Educação & Ensino" },
  { codigo: "85.31-7", descricao: "Educação superior - graduação", grauRisco: 2, categoria: "Educação & Ensino" },
  { codigo: "85.41-4", descricao: "Educação profissional de nível técnico", grauRisco: 2, categoria: "Educação & Ensino" },
  { codigo: "85.99-6", descricao: "Atividades de ensino e treinamento não especificadas (cursos livres e CIPA)", grauRisco: 2, categoria: "Educação & Ensino" },

  // ==========================================
  // 11. SERVIÇOS ADMINISTRATIVOS & ESCRITÓRIO
  // ==========================================
  { codigo: "69.11-7", descricao: "Serviços advocatícios e assessoria jurídica", grauRisco: 1, categoria: "Serviços & Escritório" },
  { codigo: "69.20-6", descricao: "Atividades de contabilidade, consultoria tributária e auditoria contábil", grauRisco: 1, categoria: "Serviços & Escritório" },
  { codigo: "70.20-4", descricao: "Atividades de consultoria em gestão empresarial", grauRisco: 1, categoria: "Serviços & Escritório" },
  { codigo: "71.12-0", descricao: "Serviços de engenharia, projetos civis e consultoria técnica SST", grauRisco: 1, categoria: "Serviços & Escritório" },
  { codigo: "71.19-7", descricao: "Atividades de perícias técnicas e laudos de segurança do trabalho", grauRisco: 1, categoria: "Serviços & Escritório" },
  { codigo: "78.10-8", descricao: "Seleção e agenciamento de mão-de-obra", grauRisco: 1, categoria: "Serviços & Escritório" },
  { codigo: "78.20-5", descricao: "Locação de mão-de-obra temporária", grauRisco: 2, categoria: "Serviços & Escritório" },
  { codigo: "80.11-1", descricao: "Atividades de vigilância e segurança privada patrimonial e escolta", grauRisco: 3, categoria: "Serviços & Escritório" },
  { codigo: "81.21-4", descricao: "Limpeza em prédios e escritórios comerciais", grauRisco: 3, categoria: "Serviços & Escritório" },
  { codigo: "81.22-2", descricao: "Imunização e controle de pragas urbanas (dedetização) e limpeza de caixas d'água", grauRisco: 3, categoria: "Serviços & Escritório" },
  { codigo: "81.30-3", descricao: "Atividades de paisagismo e jardinagem", grauRisco: 2, categoria: "Serviços & Escritório" },
  { codigo: "82.11-3", descricao: "Serviços combinados de escritório e apoio administrativo", grauRisco: 1, categoria: "Serviços & Escritório" },
  { codigo: "82.20-2", descricao: "Atividades de teleatendimento e telemarketing (call center)", grauRisco: 2, categoria: "Serviços & Escritório" },
  { codigo: "38.11-4", descricao: "Coleta de resíduos não perigosos", grauRisco: 3, categoria: "Serviços & Escritório" },
  { codigo: "38.12-2", descricao: "Coleta e destinação de resíduos perigosos industriais", grauRisco: 4, categoria: "Serviços & Escritório" },

  // ==========================================
  // 12. TECNOLOGIA DA INFORMAÇÃO & COMUNICAÇÃO
  // ==========================================
  { codigo: "61.10-8", descricao: "Telecomunicações por fio (provedores de internet fibra e dados)", grauRisco: 3, categoria: "Tecnologia & TI" },
  { codigo: "61.20-5", descricao: "Telecomunicações sem fio (telefonia móvel)", grauRisco: 2, categoria: "Tecnologia & TI" },
  { codigo: "62.01-5", descricao: "Desenvolvimento de programas de computador sob encomenda", grauRisco: 1, categoria: "Tecnologia & TI" },
  { codigo: "62.02-3", descricao: "Desenvolvimento e licenciamento de programas de computador customizáveis", grauRisco: 1, categoria: "Tecnologia & TI" },
  { codigo: "62.03-1", descricao: "Desenvolvimento e licenciamento de programas de computador não-customizáveis", grauRisco: 1, categoria: "Tecnologia & TI" },
  { codigo: "62.04-0", descricao: "Consultoria em tecnologia da informação", grauRisco: 1, categoria: "Tecnologia & TI" },
  { codigo: "62.09-1", descricao: "Suporte técnico, manutenção e outros serviços em tecnologia da informação", grauRisco: 1, categoria: "Tecnologia & TI" },
  { codigo: "63.11-9", descricao: "Tratamento de dados, provedores de serviços de aplicação e hospedagem na internet (cloud)", grauRisco: 1, categoria: "Tecnologia & TI" },

  // ==========================================
  // 13. MINERAÇÃO, ENERGIA & UTILIDADES
  // ==========================================
  { codigo: "07.10-3", descricao: "Extração de minério de ferro", grauRisco: 4, categoria: "Mineração & Energia" },
  { codigo: "08.10-0", descricao: "Extração de pedra, areia e argila para construção civil (pedreiras e areais)", grauRisco: 4, categoria: "Mineração & Energia" },
  { codigo: "06.00-0", descricao: "Extração de petróleo e gás natural", grauRisco: 4, categoria: "Mineração & Energia" },
  { codigo: "35.11-5", descricao: "Geração de energia elétrica (usinas hidrelétricas, termelétricas e solares)", grauRisco: 3, categoria: "Mineração & Energia" },
  { codigo: "35.12-3", descricao: "Transmissão de energia elétrica (linhas de alta tensão)", grauRisco: 4, categoria: "Mineração & Energia" },
  { codigo: "35.14-0", descricao: "Distribuição de energia elétrica", grauRisco: 4, categoria: "Mineração & Energia" },
  { codigo: "36.00-6", descricao: "Captação, tratamento e distribuição de água potável", grauRisco: 3, categoria: "Mineração & Energia" },
  { codigo: "37.00-5", descricao: "Gestão de redes de esgoto e estações de tratamento de efluentes (ETE)", grauRisco: 3, categoria: "Mineração & Energia" },
];

// Dicionário de CNPJ de demonstração / auto-detecção para testes rápidos
export const CNPJ_CNAE_DEMO: Record<string, { cnae: string; empresa?: string }> = {
  "00.000.000/0001-00": { cnae: "41.20-4", empresa: "Construtora Exemplo Ltda" },
  "12.345.678/0001-99": { cnae: "25.11-0", empresa: "Metalúrgica & Estruturas Aliança S.A." },
  "98.765.432/0001-11": { cnae: "10.41-4", empresa: "Agroindustrial Grãos do Sul" },
};

/**
 * Normaliza qualquer código CNAE para apenas dígitos
 */
export function normalizarCNAE(codigo: string): string {
  return (codigo || "").replace(/[^0-9]/g, "");
}

/**
 * Formata dígitos no padrão CNAE oficial (ex: 4120400 -> "41.20-4" ou "41.20-4/00")
 */
export function formatarCodigoCNAE(valor: string): string {
  const digits = normalizarCNAE(valor);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}-${digits.slice(4, 5)}`;
}

/**
 * Deduz o Grau de Risco (NR 04) a partir dos 2 primeiros dígitos (Divisão CNAE)
 */
export function deduzirGrauRiscoPorDivisaoCNAE(cnaeLimpo: string): 1 | 2 | 3 | 4 {
  const divisao = parseInt(cnaeLimpo.slice(0, 2), 10);
  if (isNaN(divisao)) return 3;

  // Mineração e Extração (Divisões 05 a 09) -> Grau 4
  if (divisao >= 5 && divisao <= 9) return 4;

  // Construção Pesada e Obras (Divisões 41 a 43) -> Grau 3 ou 4
  if (divisao >= 41 && divisao <= 43) {
    if (divisao === 42 || cnaeLimpo.startsWith("4399") || cnaeLimpo.startsWith("4311") || cnaeLimpo.startsWith("4391")) return 4;
    return 3;
  }

  // Químicos, Combustíveis, Siderurgia, Vidros e Cimento (Divisões 19 a 24) -> Grau 4 ou 3
  if (divisao >= 19 && divisao <= 24) {
    if (divisao === 19 || divisao === 24 || cnaeLimpo.startsWith("2330") || cnaeLimpo.startsWith("2051")) return 4;
    return 3;
  }

  // Indústria Metalmecânica e Automotiva (Divisões 25 a 30) -> Grau 3 ou 4
  if (divisao >= 25 && divisao <= 30) {
    if (cnaeLimpo.startsWith("2511") || cnaeLimpo.startsWith("2521")) return 4;
    return 3;
  }

  // Eletricidade e Alta Tensão (Divisão 35) -> Grau 4 ou 3
  if (divisao === 35) return 4;

  // Resíduos Perigosos (Divisão 38)
  if (divisao === 38 && cnaeLimpo.startsWith("3812")) return 4;

  // Agricultura e Pecuária (Divisões 01 a 03) -> Grau 3 (Extração nativa Grau 4)
  if (divisao >= 1 && divisao <= 3) {
    if (divisao === 2 && cnaeLimpo.startsWith("0220")) return 4;
    return 3;
  }

  // Saúde Humana e Hospitais (Divisões 86 a 88) -> Grau 3
  if (divisao >= 86 && divisao <= 88) return 3;

  // Transporte e Armazenamento (Divisões 49 a 53) -> Grau 3
  if (divisao >= 49 && divisao <= 53) return 3;

  // Alimentos e Bebidas (Divisões 10 a 12) -> Grau 3
  if (divisao >= 10 && divisao <= 12) {
    if (cnaeLimpo.startsWith("1091")) return 2;
    return 3;
  }

  // Segurança privada e vigilância armada (Divisão 80) -> Grau 3
  if (divisao === 80) return 3;

  // Limpeza predial pesada (Divisão 81) -> Grau 3
  if (divisao === 81) return 3;

  // Comércio Varejista e Atacadista (Divisões 45 a 47) -> Grau 2 (combustíveis e madeira GR 3)
  if (divisao >= 45 && divisao <= 47) {
    if (cnaeLimpo.startsWith("4731") || cnaeLimpo.startsWith("4671") || cnaeLimpo.startsWith("4683")) return 3;
    return 2;
  }

  // Hotéis e Restaurantes (Divisões 55 a 56) -> Grau 2
  if (divisao >= 55 && divisao <= 56) return 2;

  // Educação (Divisão 85) -> Grau 2
  if (divisao === 85) return 2;

  // TI, Software e Telecom (Divisões 58 a 63) -> Grau 1
  if (divisao >= 58 && divisao <= 63) return 1;

  // Atividades Financeiras e Seguros (Divisões 64 a 66) -> Grau 1
  if (divisao >= 64 && divisao <= 66) return 1;

  // Atividades Imobiliárias e Jurídicas / Contábeis / Engenharia (Divisões 68 a 74) -> Grau 1
  if (divisao >= 68 && divisao <= 74) return 1;

  // Padrão de segurança
  return 3;
}

/**
 * Deduz a Categoria amigável a partir da Divisão CNAE
 */
export function deduzirCategoriaPorDivisao(cnaeLimpo: string): string {
  const divisao = parseInt(cnaeLimpo.slice(0, 2), 10);
  if (isNaN(divisao)) return "Geral";

  if (divisao >= 1 && divisao <= 3) return "Agropecuária & Florestal";
  if (divisao >= 5 && divisao <= 9) return "Mineração & Energia";
  if (divisao >= 10 && divisao <= 12) return "Alimentos & Agroindústria";
  if (divisao >= 13 && divisao <= 33) return "Indústria & Metalúrgica";
  if (divisao === 35 || divisao === 36 || divisao === 37) return "Mineração & Energia";
  if (divisao >= 41 && divisao <= 43) return "Construção Civil";
  if (divisao >= 45 && divisao <= 47) return "Comércio & Varejo";
  if (divisao >= 49 && divisao <= 53) return "Transporte & Logística";
  if (divisao === 55 || divisao === 56) return "Alimentação & Hotelaria";
  if (divisao >= 58 && divisao <= 63) return "Tecnologia & TI";
  if (divisao >= 64 && divisao <= 82) return "Serviços & Escritório";
  if (divisao === 85) return "Educação & Ensino";
  if (divisao >= 86 && divisao <= 88) return "Saúde & Clínicas";

  return "Serviços & Escritório";
}

/**
 * Busca inteligente de CNAE por código ou texto descritivo
 */
export function buscarCNAEPorCodigoOuDescricao(termo: string): CNAEItem | undefined {
  if (!termo) return undefined;
  const termoLimpo = termo.trim().toLowerCase();
  const apenasNumeros = normalizarCNAE(termo);

  // 1. Busca exata pelo código numérico ou formatado
  if (apenasNumeros.length >= 4) {
    const achadoExato = LISTA_CNAE_NR04.find((c) => {
      const cLimpo = normalizarCNAE(c.codigo);
      return cLimpo === apenasNumeros || cLimpo.startsWith(apenasNumeros.slice(0, 5)) || apenasNumeros.startsWith(cLimpo);
    });
    if (achadoExato) return achadoExato;
  }

  // 2. Busca por código formatado
  const achadoPorCodigo = LISTA_CNAE_NR04.find((c) => c.codigo.toLowerCase().includes(termoLimpo));
  if (achadoPorCodigo) return achadoPorCodigo;

  // 3. Busca por descrição textual
  return LISTA_CNAE_NR04.find((c) => c.descricao.toLowerCase().includes(termoLimpo));
}

/**
 * Retorna um CNAE existente no catálogo ou constrói dinamicamente um novo válido
 */
export function obterOuCriarCNAE(codigo: string, descricao?: string): CNAEItem {
  const achado = buscarCNAEPorCodigoOuDescricao(codigo);
  if (achado) {
    if (descricao && achado.descricao.startsWith("CNAE")) {
      return { ...achado, descricao };
    }
    return achado;
  }

  const digitsOnly = normalizarCNAE(codigo);
  const codigoFormatado = formatarCodigoCNAE(digitsOnly.slice(0, 5)) || codigo;
  const grauRisco = deduzirGrauRiscoPorDivisaoCNAE(digitsOnly);
  const categoria = deduzirCategoriaPorDivisao(digitsOnly);

  return {
    codigo: codigoFormatado,
    descricao: descricao || `Atividade Econômica CNAE ${codigoFormatado}`,
    grauRisco,
    categoria,
  };
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
