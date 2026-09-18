import { Empresa, LaudoEmitido, RascunhoVistoria, UsuarioAuditor, VistoriaState } from "../types";

const STORAGE_KEYS = {
  EMPRESAS: "vistoria_sst_empresas",
  RASCUNHOS: "vistoria_sst_rascunhos",
  LAUDOS: "vistoria_sst_laudos",
  LOGO_CONSULTORIA: "vistoria_sst_logo_consultoria",
  ULTIMO_ESTADO: "vistoria_sst_ultimo_estado",
  AUTH_USER: "vistoria_sst_auth_user",
  USUARIOS: "vistoria_sst_usuarios",
};

export const USUARIOS_PADRAO: UsuarioAuditor[] = [
  {
    id: "usr-admin-1",
    nome: "Eng. Roberto Vasconcelos",
    email: "roberto.sst@engpericial.com.br",
    registro: "CREA: 123456/D - MTE SST",
    cargo: "Engenheiro de Segurança do Trabalho",
    perfil: "admin",
    senha: "admin",
    ativo: true,
    criadoEm: "10/01/2026",
  },
  {
    id: "usr-inspetor-1",
    nome: "Mariana Souza Lima",
    email: "mariana.tst@consultoriasst.com.br",
    registro: "Reg. MTE: 009876/SP",
    cargo: "Técnica em Segurança do Trabalho",
    perfil: "inspetor",
    senha: "123",
    ativo: true,
    criadoEm: "15/02/2026",
  },
  {
    id: "usr-inspetor-2",
    nome: "Dr. Marcos Vinicius Alencar",
    email: "perito.alencar@trt.jus.br",
    registro: "CREA/SP: 543210 - Perito Judicial",
    cargo: "Perito Judicial do Trabalho",
    perfil: "inspetor",
    senha: "123",
    ativo: true,
    criadoEm: "01/03/2026",
  },
];

export function getUsuarios(): UsuarioAuditor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(USUARIOS_PADRAO));
      return USUARIOS_PADRAO;
    }
    return JSON.parse(raw);
  } catch {
    return USUARIOS_PADRAO;
  }
}

export function salvarUsuario(usuario: Omit<UsuarioAuditor, "id"> & { id?: string }): UsuarioAuditor {
  const usuarios = getUsuarios();
  const id = usuario.id || `usr-${Date.now()}`;
  const novo: UsuarioAuditor = {
    ...usuario,
    id,
    ativo: usuario.ativo !== undefined ? usuario.ativo : true,
    criadoEm: usuario.criadoEm || new Date().toLocaleDateString("pt-BR"),
  };

  const idx = usuarios.findIndex((u) => u.id === id || u.email.trim().toLowerCase() === usuario.email.trim().toLowerCase());
  if (idx >= 0) {
    usuarios[idx] = novo;
  } else {
    usuarios.push(novo);
  }

  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
  return novo;
}

export function excluirUsuario(id: string): void {
  const usuarios = getUsuarios().filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
}

export function getUsuarioAutenticado(): UsuarioAuditor | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function salvarUsuarioAutenticado(user: UsuarioAuditor): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } catch (e) {
    console.error("Falha ao salvar sessão do auditor", e);
  }
}

export function limparUsuarioAutenticado(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

const EMPRESAS_PADRAO: Empresa[] = [
  {
    id: "emp-1",
    nome: "Construtora Exemplo Ltda",
    cnpj: "00.000.000/0001-00",
    faixaFuncionarios: "26 a 50",
    contatoWpp: "34999990000",
    endereco: "Av. das Indústrias, 1000 - Distrito Industrial",
    cnae: "41.20-4",
    grauRisco: 3,
  },
  {
    id: "emp-2",
    nome: "Metalúrgica & Estruturas Aliança S.A.",
    cnpj: "12.345.678/0001-99",
    faixaFuncionarios: "101 a 250",
    contatoWpp: "11988887777",
    endereco: "Rua do Progresso, 450 - São Paulo/SP",
    cnae: "25.11-0",
    grauRisco: 4,
  },
  {
    id: "emp-3",
    nome: "Agroindustrial Grãos do Sul",
    cnpj: "98.765.432/0001-11",
    faixaFuncionarios: "51 a 100",
    contatoWpp: "41977776666",
    endereco: "Rodovia BR 277, Km 120 - Paraná",
    cnae: "10.41-4",
    grauRisco: 3,
  },
];

export function getEmpresas(): Empresa[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPRESAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(EMPRESAS_PADRAO));
      return EMPRESAS_PADRAO;
    }
    return JSON.parse(raw);
  } catch {
    return EMPRESAS_PADRAO;
  }
}

export function salvarEmpresa(empresa: Omit<Empresa, "id"> & { id?: string }): Empresa {
  const empresas = getEmpresas();
  const id = empresa.id || `emp-${Date.now()}`;
  const nova: Empresa = { ...empresa, id };

  const idx = empresas.findIndex((e) => e.id === id || e.nome.trim().toLowerCase() === empresa.nome.trim().toLowerCase());
  if (idx >= 0) {
    empresas[idx] = nova;
  } else {
    empresas.push(nova);
  }

  localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(empresas));
  return nova;
}

export const RASCUNHOS_PADRAO: RascunhoVistoria[] = [
  {
    id: "rasc-demo-parado-1",
    empresa: "Construtora Exemplo Ltda",
    dataAtualizacao: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toLocaleString("pt-BR"),
    estado: {
      empresa: "Construtora Exemplo Ltda",
      cnpj: "00.000.000/0001-00",
      faixa: "26 a 50",
      wpp: "34999990000",
      inspetor: "Eng. Marcos Silva",
      regInspetor: "CREA-MG 123456/D",
      acompNome: "Carlos Silveira",
      acompCargo: "Mestre de Obras",
      data: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      evidencias: [
        {
          id: "ev-1",
          nr: "NR 35",
          itemNr: "35.5.1",
          descricao: "Trabalhador executando montagem de andaime a 4 metros de altura sem cinto tipo paraquedista e sem linha de vida ancorada.",
          infracao: "I4",
          tipo: "S",
          status: "Não Conformidade",
          prioridade: "Alta",
          descricaoCenario: "Andaime externo do bloco B desprovido de linha de vida e guarda-corpo regulamentar.",
          acaoCorretiva: "Interromper imediatamente os serviços em altura até instalação de pontos de ancoragem testados e fornecimento de cinto com trava-quedas.",
          valorMin: 4500,
          valorMax: 6850,
          criadoEm: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  },
  {
    id: "rasc-demo-recente-2",
    empresa: "Metalúrgica & Estruturas Aliança S.A.",
    dataAtualizacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString("pt-BR"),
    estado: {
      empresa: "Metalúrgica & Estruturas Aliança S.A.",
      cnpj: "12.345.678/0001-99",
      faixa: "101 a 250",
      wpp: "11988887777",
      inspetor: "Eng. Marcos Silva",
      regInspetor: "CREA-MG 123456/D",
      acompNome: "Fernando Dias",
      acompCargo: "Gerente Industrial",
      data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      evidencias: [
        {
          id: "ev-2",
          nr: "NR 12",
          itemNr: "12.38.1",
          descricao: "Prensa mecânica sem cortina de luz e sem dispositivo bimanual de acionamento sincronizado.",
          infracao: "I3",
          tipo: "S",
          status: "Não Conformidade",
          prioridade: "Alta",
          descricaoCenario: "Zona de prensagem acessível sem proteções fixas ou intertravadas.",
          acaoCorretiva: "Adequação dos dispositivos de parada de emergência e sensores categoria 4 conforme ABNT NBR ISO 13849.",
          valorMin: 3200,
          valorMax: 4520,
          criadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  },
];

export function calcularDiasSemEdicao(dataAtualizacao?: string, dataEstado?: string): number {
  if (!dataAtualizacao && !dataEstado) return 0;
  const agora = new Date();

  const extrairData = (str?: string): Date | null => {
    if (!str) return null;
    try {
      if (str.includes("/")) {
        const partes = str.split(/[\s,]+/);
        const [d, m, y] = partes[0].split("/").map(Number);
        if (d && m && y) {
          let h = 0;
          let mi = 0;
          let s = 0;
          if (partes[1] && partes[1].includes(":")) {
            const timeParts = partes[1].split(":").map(Number);
            h = timeParts[0] || 0;
            mi = timeParts[1] || 0;
            s = timeParts[2] || 0;
          }
          const dt = new Date(y, m - 1, d, h, mi, s);
          if (!isNaN(dt.getTime())) return dt;
        }
      } else if (str.includes("-")) {
        const dt = new Date(str);
        if (!isNaN(dt.getTime())) return dt;
      }
    } catch {
      return null;
    }
    return null;
  };

  const d1 = extrairData(dataAtualizacao);
  const d2 = extrairData(dataEstado);
  const datasValidas = [d1, d2].filter((d): d is Date => d !== null);

  if (datasValidas.length === 0) return 0;

  const maisRecente = new Date(Math.max(...datasValidas.map((d) => d.getTime())));
  const diffMs = agora.getTime() - maisRecente.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDias);
}

export function getRascunhos(): RascunhoVistoria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RASCUNHOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify(RASCUNHOS_PADRAO));
      return RASCUNHOS_PADRAO;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify(RASCUNHOS_PADRAO));
      return RASCUNHOS_PADRAO;
    }
    return parsed;
  } catch {
    return RASCUNHOS_PADRAO;
  }
}

export function salvarRascunho(estado: VistoriaState): RascunhoVistoria {
  const rascunhos = getRascunhos();
  const id = `rasc-${Date.now()}`;
  const novo: RascunhoVistoria = {
    id,
    empresa: estado.empresa || "Sem Nome",
    dataAtualizacao: new Date().toLocaleString("pt-BR"),
    estado,
  };

  // Mantem os 15 mais recentes
  const atualizados = [novo, ...rascunhos.filter((r) => r.empresa !== estado.empresa)].slice(0, 15);
  localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify(atualizados));
  return novo;
}

export function deletarRascunho(id: string): void {
  const rascunhos = getRascunhos().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify(rascunhos));
}
export const excluirRascunho = deletarRascunho;

export function getLaudos(): LaudoEmitido[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAUDOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function salvarLaudo(laudo: Omit<LaudoEmitido, "id" | "numero">): LaudoEmitido {
  const laudos = getLaudos();
  const novo: LaudoEmitido = {
    ...laudo,
    id: `laudo-${Date.now()}`,
    numero: laudos.length + 1,
  };
  localStorage.setItem(STORAGE_KEYS.LAUDOS, JSON.stringify([novo, ...laudos]));
  return novo;
}

export function excluirLaudo(id: string): void {
  const laudos = getLaudos().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LAUDOS, JSON.stringify(laudos));
}
export const deletarLaudo = excluirLaudo;

export function gerarLinkEmailBoasVindas(email: string, nome: string, senhaTemp: string, perfil: string): string {
  const assunto = encodeURIComponent("Acesso ao VistorIA SST - Suas Credenciais de Acesso");
  const corpo = encodeURIComponent(
    `Olá ${nome},\n\n` +
    `Seu cadastro na plataforma VistorIA SST foi realizado com sucesso no perfil de ${perfil === "admin" ? "Administrador" : "Inspetor Técnico"}.\n\n` +
    `Aqui estão suas credenciais de acesso inicial:\n` +
    `• E-mail: ${email}\n` +
    `• Senha Temporária: ${senhaTemp}\n\n` +
    `IMPORTANTE: No seu primeiro acesso ao sistema, será solicitada a troca obrigatória desta senha temporária por uma nova senha pessoal definitiva.\n\n` +
    `Link de Acesso: https://ais-dev-6d7vb5ybh6fmus6bgfxir5-168561814702.us-west2.run.app\n\n` +
    `Atenciosamente,\n` +
    `Departamento de Segurança e Medicina do Trabalho`
  );
  return `mailto:${email}?subject=${assunto}&body=${corpo}`;
}

export function getLogoConsultoria(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LOGO_CONSULTORIA);
  } catch {
    return null;
  }
}

export function salvarLogoConsultoria(base64: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGO_CONSULTORIA, base64);
  } catch (e) {
    console.error("Falha ao salvar logo no localStorage", e);
  }
}

export function removerLogoConsultoria(): void {
  localStorage.removeItem(STORAGE_KEYS.LOGO_CONSULTORIA);
}

export function gerarTextoResumoExecutivo(
  empresa: string,
  passivoTotal: number,
  economiaTotal: number,
  qtdNaoConformidades: number,
  auditor?: string
): string {
  const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    `📋 VistorIA SST — RELATÓRIO PRELIMINAR DE AUDITORIA PERICIAL\n\n` +
    `🏢 Empresa Auditada: ${empresa}\n` +
    `📅 Data da Vistoria: ${dataHoje}\n` +
    `👷 Auditor Responsável: ${auditor || "Auditor Técnico SST"}\n` +
    `⚠️ Apontamentos Críticos (Não Conformidades): ${qtdNaoConformidades}\n` +
    `💰 Passivo Financeiro em Risco (NR 28): ${formatador.format(passivoTotal)}\n` +
    `🛡️ Economia por Boas Práticas: ${formatador.format(economiaTotal)}\n\n` +
    `Laudo Técnico Pericial emitido com enquadramento legal nas Normas Regulamentadoras (NRs), ` +
    `carimbos forenses de geolocalização (GPS) e assinaturas digitais do auditor e do preposto da empresa.`
  );
}

export function gerarLinkEmail(
  emailDestino: string,
  empresa: string,
  passivoTotal: number,
  economiaTotal: number,
  qtdNaoConformidades: number,
  auditor?: string
): string {
  const assunto = `[Laudo Técnico SST] Resumo Pericial & Riscos NR 28 - ${empresa}`;
  const corpo = gerarTextoResumoExecutivo(empresa, passivoTotal, economiaTotal, qtdNaoConformidades, auditor);
  return `mailto:${encodeURIComponent(emailDestino)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

export function gerarLinkWhatsApp(
  telefone: string,
  empresa: string,
  passivoTotal: number,
  economiaTotal: number,
  qtdNaoConformidades: number
): string {
  const numLimpo = telefone.replace(/\D/g, "");
  const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  const msg =
    `📋 *VistorIA SST — RELATÓRIO PRELIMINAR DE AUDITORIA*\n\n` +
    `🏢 *Empresa:* ${empresa}\n` +
    `📅 *Data da Vistoria:* ${dataHoje}\n` +
    `⚠️ *Apontamentos Críticos (Não Conformidades):* ${qtdNaoConformidades}\n` +
    `💰 *Passivo em Risco Estimado (NR 28):* ${formatador.format(passivoTotal)}\n` +
    `🛡️ *Economia Estimada (Risco Evitado):* ${formatador.format(economiaTotal)}\n\n` +
    `_O Laudo Pericial completo com registros fotográficos forenses e assinaturas foi gerado com sucesso._`;

  return `https://api.whatsapp.com/send?phone=${numLimpo}&text=${encodeURIComponent(msg)}`;
}
