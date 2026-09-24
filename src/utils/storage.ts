import {
  Empresa,
  LaudoEmitido,
  ProgramacaoRelatorio,
  RascunhoVistoria,
  SessaoAssinatura,
  UsuarioAuditor,
  VistoriaState,
} from "../types";
import {
  salvarUsuarioNuvem,
  excluirUsuarioNuvem,
  salvarEmpresaNuvem,
  salvarRascunhoNuvem,
  excluirRascunhoNuvem,
  salvarLaudoNuvem,
  excluirLaudoNuvem,
  salvarProgramacaoNuvem,
  excluirProgramacaoNuvem,
  criarSessaoAssinaturaNuvem,
  limparDadosDeTesteNuvem,
} from "./firebaseSync";

export const STORAGE_KEYS = {
  EMPRESAS: "vistoria_sst_empresas",
  RASCUNHOS: "vistoria_sst_rascunhos",
  LAUDOS: "vistoria_sst_laudos",
  LOGO_CONSULTORIA: "vistoria_sst_logo_consultoria",
  ULTIMO_ESTADO: "vistoria_sst_ultimo_estado",
  AUTH_USER: "vistoria_sst_auth_user",
  USUARIOS: "vistoria_sst_usuarios",
  PROGRAMACOES: "vistoria_sst_programacoes",
  SESSOES_ASSINATURA: "vistoria_sst_sessoes_assinatura",
};

export const USUARIO_ADMIN_RAUL: UsuarioAuditor = {
  id: "usr-admin-raul",
  nome: "Raul Luiz de Faria",
  email: "fariaraul77@gmail.com",
  registro: "MTE 61658/MG",
  cargo: "Técnico em Segurança do Trabalho",
  perfil: "admin",
  senha: "Portal2012",
  ativo: true,
  primeiroAcesso: false,
  criadoEm: "18/09/2026",
};

export const USUARIO_INSPETOR_MARCOS: UsuarioAuditor = {
  id: "usr-inspetor-marcos",
  nome: "Marcos Vinicius Ferreira Mendes",
  email: "marcosvinicius@aecsst.com.br",
  registro: "00000/MG",
  cargo: "Técnico em Segurança do Trabalho",
  perfil: "inspetor",
  senha: "abc123",
  ativo: true,
  primeiroAcesso: true,
  criadoEm: "18/09/2026",
};

export const USUARIOS_PADRAO: UsuarioAuditor[] = [USUARIO_ADMIN_RAUL, USUARIO_INSPETOR_MARCOS];

export function getUsuarios(): UsuarioAuditor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(USUARIOS_PADRAO));
      return USUARIOS_PADRAO;
    }
    const parsed: UsuarioAuditor[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(USUARIOS_PADRAO));
      return USUARIOS_PADRAO;
    }

    // Remove usuários de demonstração anteriores
    const filtrados = parsed.filter(
      (u) =>
        u.nome !== "Eng. Roberto Vasconcelos" &&
        u.nome !== "Mariana Souza Lima" &&
        u.nome !== "Dr. Marcos Vinicius Alencar" &&
        u.id !== "usr-admin-1" &&
        u.id !== "usr-inspetor-1" &&
        u.id !== "usr-inspetor-2"
    );

    // Garante que Raul Luiz de Faria está cadastrado como Administrador com a senha Portal2012
    const idxRaul = filtrados.findIndex(
      (u) =>
        u.id === USUARIO_ADMIN_RAUL.id ||
        u.nome.toLowerCase() === USUARIO_ADMIN_RAUL.nome.toLowerCase() ||
        u.email.toLowerCase() === USUARIO_ADMIN_RAUL.email.toLowerCase()
    );

    if (idxRaul >= 0) {
      filtrados[idxRaul] = {
        ...filtrados[idxRaul],
        nome: "Raul Luiz de Faria",
        registro: "MTE 61658/MG",
        cargo: "Técnico em Segurança do Trabalho",
        perfil: "admin",
        senha: "Portal2012",
        ativo: true,
      };
    } else {
      filtrados.unshift(USUARIO_ADMIN_RAUL);
    }

    // Garante que Marcos Vinicius Ferreira Mendes está cadastrado como Inspetor com a senha inicial abc123
    const idxMarcos = filtrados.findIndex(
      (u) =>
        u.id === USUARIO_INSPETOR_MARCOS.id ||
        u.nome.toLowerCase() === USUARIO_INSPETOR_MARCOS.nome.toLowerCase() ||
        u.email.toLowerCase() === USUARIO_INSPETOR_MARCOS.email.toLowerCase()
    );

    if (idxMarcos >= 0) {
      filtrados[idxMarcos] = {
        ...filtrados[idxMarcos],
        nome: "Marcos Vinicius Ferreira Mendes",
        email: "marcosvinicius@aecsst.com.br",
        registro: "00000/MG",
        cargo: "Técnico em Segurança do Trabalho",
        perfil: "inspetor",
        ativo: true,
      };
    } else {
      filtrados.push(USUARIO_INSPETOR_MARCOS);
    }

    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(filtrados));
    return filtrados;
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
  salvarUsuarioNuvem(novo).catch((err) => console.warn("Sync nuvem usuário:", err));
  return novo;
}

export function excluirUsuario(id: string): void {
  const usuarios = getUsuarios().filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
  excluirUsuarioNuvem(id).catch((err) => console.warn("Sync nuvem excluir usuário:", err));
}

export function getUsuarioAutenticado(): UsuarioAuditor | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    const user: UsuarioAuditor = JSON.parse(raw);
    // Se a sessão atual for de algum usuário teste anterior, migra para Raul Luiz de Faria
    if (
      user.nome === "Eng. Roberto Vasconcelos" ||
      user.id === "usr-admin-1" ||
      user.id === "usr-inspetor-1" ||
      user.id === "usr-inspetor-2"
    ) {
      salvarUsuarioAutenticado(USUARIO_ADMIN_RAUL);
      return USUARIO_ADMIN_RAUL;
    }
    return user;
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

export const EMPRESAS_PADRAO: Empresa[] = [
  {
    id: "emp-1",
    nome: "Construtora Exemplo Ltda",
    cnpj: "00.000.000/0001-00",
    tipoInscricao: "CNPJ",
    faixaFuncionarios: "26 a 50",
    contatoWpp: "34999990000",
    endereco: "Av. das Indústrias, 1000 - Distrito Industrial",
    cnae: "41.20-4",
    grauRisco: 3,
  },
  {
    id: "emp-2",
    nome: "Fazenda Santa Maria - Produtor Rural",
    cnpj: "000.000.000/001-99",
    tipoInscricao: "CAEPF",
    faixaFuncionarios: "11 a 25",
    contatoWpp: "34999991111",
    endereco: "Rodovia Rural MG-452, Km 14 - Zona Rural",
    cnae: "01.11-3",
    grauRisco: 3,
  },
  {
    id: "emp-3",
    nome: "Obra Residencial Parque das Flores",
    cnpj: "12.345.67890/55",
    tipoInscricao: "CEI/CNO",
    faixaFuncionarios: "51 a 100",
    contatoWpp: "34999992222",
    endereco: "Rua dos Girassóis, 500 - Canteiro de Obras",
    cnae: "41.20-4",
    grauRisco: 3,
  },
];

/**
 * Limpa todos os dados de teste (laudos, rascunhos, programações) e deixa apenas as 3 empresas
 * de teste interno (CNPJ, CAEPF e CEI/CNO) cadastradas.
 *
 * CRÍTICO: NUNCA REMOVE OS USUÁRIOS! Todos os usuários cadastrados e sessões ativas
 * são 100% PRESERVADOS.
 */
export async function limparDadosDeTeste(): Promise<{
  empresas: Empresa[];
  laudos: LaudoEmitido[];
  rascunhos: RascunhoVistoria[];
}> {
  // 1. Limpa laudos locais
  localStorage.setItem(STORAGE_KEYS.LAUDOS, JSON.stringify([]));

  // 2. Limpa rascunhos locais
  localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify([]));

  // 3. Limpa programações locais
  localStorage.setItem(STORAGE_KEYS.PROGRAMACOES, JSON.stringify([]));

  // 4. Limpa último estado temporário de vistoria em andamento
  localStorage.removeItem(STORAGE_KEYS.ULTIMO_ESTADO);

  // 5. Restaura as 3 empresas de teste interno
  localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(EMPRESAS_PADRAO));

  // 6. Sincroniza a limpeza na nuvem (Firestore)
  await limparDadosDeTesteNuvem(EMPRESAS_PADRAO).catch((err) =>
    console.warn("Erro ao sincronizar limpeza de teste na nuvem:", err)
  );

  return {
    empresas: EMPRESAS_PADRAO,
    laudos: [],
    rascunhos: [],
  };
}

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
  salvarEmpresaNuvem(nova).catch((err) => console.warn("Sync nuvem empresa:", err));
  return nova;
}

export const RASCUNHOS_PADRAO: RascunhoVistoria[] = [];

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
      localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify([]));
      return [];
    }
    // Remove rascunhos de teste de demonstração
    const limpos = parsed.filter(
      (r: RascunhoVistoria) =>
        r.id !== "rasc-demo-parado-1" &&
        r.id !== "rasc-demo-recente-2" &&
        !r.id.startsWith("rasc-demo")
    );
    if (limpos.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify(limpos));
    }
    return limpos;
  } catch {
    return [];
  }
}

export function salvarRascunho(estado: VistoriaState): RascunhoVistoria {
  const rascunhos = getRascunhos();
  const nomeEmpresa = estado.empresa?.trim() || "Vistoria em Andamento";
  
  // Localiza rascunho existente pelo id ou pelo nome da empresa
  const rascExistente = estado.rascunhoId
    ? rascunhos.find((r) => r.id === estado.rascunhoId)
    : rascunhos.find(
        (r) =>
          r.empresa &&
          estado.empresa &&
          r.empresa.trim().toLowerCase() === estado.empresa.trim().toLowerCase()
      );

  const id = rascExistente?.id || estado.rascunhoId || `rasc-${Date.now()}`;
  
  const estadoAtualizado: VistoriaState = {
    ...estado,
    empresa: nomeEmpresa,
    rascunhoId: id,
  };

  const novo: RascunhoVistoria = {
    id,
    empresa: nomeEmpresa,
    dataAtualizacao: new Date().toLocaleString("pt-BR"),
    estado: estadoAtualizado,
  };

  // Mantém no topo e filtra a versão anterior do mesmo rascunho
  const outros = rascunhos.filter(
    (r) =>
      r.id !== id &&
      (!estado.empresa || r.empresa.trim().toLowerCase() !== estado.empresa.trim().toLowerCase())
  );
  const atualizados = [novo, ...outros].slice(0, 15);

  try {
    localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify(atualizados));
  } catch (e) {
    console.warn("Storage quota exceeded, saving only current rascunho...", e);
    try {
      localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify([novo]));
    } catch (e2) {
      console.error("Critical storage quota exceeded for rascunhos:", e2);
    }
  }

  salvarRascunhoNuvem(novo).catch((err) => console.warn("Sync nuvem rascunho:", err));
  return novo;
}

export function deletarRascunho(id: string): void {
  const rascunhos = getRascunhos().filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.RASCUNHOS, JSON.stringify(rascunhos));
  } catch {}
  excluirRascunhoNuvem(id).catch((err) => console.warn("Sync nuvem excluir rascunho:", err));
}
export const excluirRascunho = deletarRascunho;

export function getLaudos(): LaudoEmitido[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAUDOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Remove laudos de teste caso existam
    const limpos = parsed.filter(
      (l: LaudoEmitido) =>
        !l.id.startsWith("laudo-demo")
    );
    if (limpos.length !== parsed.length) {
      try {
        localStorage.setItem(STORAGE_KEYS.LAUDOS, JSON.stringify(limpos));
      } catch {}
    }
    return limpos;
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
  const atualizados = [novo, ...laudos].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEYS.LAUDOS, JSON.stringify(atualizados));
  } catch (e) {
    console.warn("Storage quota exceeded when saving laudo, saving single laudo...", e);
    try {
      localStorage.setItem(STORAGE_KEYS.LAUDOS, JSON.stringify([novo]));
    } catch (e2) {
      console.error("Critical storage quota exceeded for laudos:", e2);
    }
  }
  salvarLaudoNuvem(novo).catch((err) => console.warn("Sync nuvem laudo:", err));
  return novo;
}

export function excluirLaudo(id: string): void {
  const laudos = getLaudos().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LAUDOS, JSON.stringify(laudos));
  excluirLaudoNuvem(id).catch((err) => console.warn("Sync nuvem excluir laudo:", err));
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
  auditor?: string,
  mostrarMultas: boolean = true
): string {
  const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  let blocoValores = "";
  if (mostrarMultas) {
    blocoValores =
      `💰 Passivo Financeiro em Risco (NR 28): ${formatador.format(passivoTotal)}\n` +
      `🛡️ Economia por Boas Práticas: ${formatador.format(economiaTotal)}\n\n`;
  } else {
    blocoValores =
      `👷 Foco do Relatório: Líderes Operacionais / Chão de Fábrica\n` +
      `🔒 Valores financeiros e multas da NR 28 ocultados neste relatório operacional.\n\n`;
  }

  return (
    `📋 VistorIA SST — RELATÓRIO ${mostrarMultas ? "GERENCIAL EXECUTIVO" : "OPERACIONAL PARA LÍDERES"}\n\n` +
    `🏢 Empresa Auditada: ${empresa}\n` +
    `📅 Data da Vistoria: ${dataHoje}\n` +
    `👷 Auditor Responsável: ${auditor || "Auditor Técnico SST"}\n` +
    `⚠️ Apontamentos Críticos (Não Conformidades): ${qtdNaoConformidades}\n` +
    blocoValores +
    `Laudo Técnico Pericial emitido com enquadramento legal nas Normas Regulamentadoras (NRs), ` +
    `plano de ação 5W2H, carimbos forenses com GPS e assinaturas digitais coletadas in loco.`
  );
}

export function gerarLinkEmail(
  emailDestino: string,
  empresa: string,
  passivoTotal: number,
  economiaTotal: number,
  qtdNaoConformidades: number,
  auditor?: string,
  mostrarMultas: boolean = true
): string {
  const assunto = `[Laudo Técnico SST - ${mostrarMultas ? "Gestores" : "Líderes"}] Resumo de Vistoria - ${empresa}`;
  const corpo = gerarTextoResumoExecutivo(empresa, passivoTotal, economiaTotal, qtdNaoConformidades, auditor, mostrarMultas);
  return `mailto:${encodeURIComponent(emailDestino)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

export function gerarLinkWhatsApp(
  telefone: string,
  empresa: string,
  passivoTotal: number,
  economiaTotal: number,
  qtdNaoConformidades: number,
  mostrarMultas: boolean = true
): string {
  const numLimpo = telefone.replace(/\D/g, "");
  const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  let blocoValores = "";
  if (mostrarMultas) {
    blocoValores =
      `💰 *Passivo em Risco Estimado (NR 28):* ${formatador.format(passivoTotal)}\n` +
      `🛡️ *Economia Estimada (Risco Evitado):* ${formatador.format(economiaTotal)}\n\n`;
  } else {
    blocoValores =
      `👷 *Foco do Relatório:* Líderes Operacionais & Prevenção em Campo\n` +
      `🔒 *Valores de multas NR 28:* Ocultados nesta emissão operacional.\n\n`;
  }

  const msg =
    `📋 *VistorIA SST — RELATÓRIO ${mostrarMultas ? "GERENCIAL (GESTORES)" : "OPERACIONAL (LÍDERES)"}*\n\n` +
    `🏢 *Empresa:* ${empresa}\n` +
    `📅 *Data da Vistoria:* ${dataHoje}\n` +
    `⚠️ *Apontamentos Críticos (Não Conformidades):* ${qtdNaoConformidades}\n` +
    blocoValores +
    `_O Laudo Pericial completo com plano de ação corretiva, fotos forenses e assinaturas foi gerado com sucesso._`;

  return `https://api.whatsapp.com/send?phone=${numLimpo}&text=${encodeURIComponent(msg)}`;
}

// --- GESTÃO DE PROGRAMAÇÃO DE RELATÓRIOS E VISTORIAS ---

export const PROGRAMACOES_INICIAIS_EXEMPLO: ProgramacaoRelatorio[] = [
  {
    id: "prog-demo-1",
    empresaNome: "Indústria Metalmecânica Modelo S.A.",
    tipoRelatorio: "Inspeção Mensal de NR 12 & Máquinas Operatrizes",
    periodicidade: "mensal",
    dataUltimoRelatorio: "18/08/2026",
    dataProximaProgramada: "2026-09-18",
    auditorResponsavel: "Raul Luiz de Faria",
    observacoes: "Verificar intertravamentos de segurança e paradas de emergência em prensas.",
    criadoEm: "18/08/2026",
  },
  {
    id: "prog-demo-2",
    empresaNome: "Indústria Metalmecânica Modelo S.A.",
    tipoRelatorio: "Auditoria Semestral de Elétrica NR 10 & Prontuário PIE",
    periodicidade: "semestral",
    dataUltimoRelatorio: "25/03/2026",
    dataProximaProgramada: "2026-09-25",
    auditorResponsavel: "Marcos Vinicius Ferreira Mendes",
    observacoes: "Revisar laudo SPDA e termografia dos quadros QGBT.",
    criadoEm: "25/03/2026",
  },
  {
    id: "prog-demo-3",
    empresaNome: "Construtora Horizonte Ltda",
    tipoRelatorio: "Vistoria Semanal de Canteiro de Obras NR 18",
    periodicidade: "semanal",
    dataUltimoRelatorio: "15/09/2026",
    dataProximaProgramada: "2026-09-22",
    auditorResponsavel: "Raul Luiz de Faria",
    observacoes: "Inspecionar andaimes fachadeiros, guarda-corpos e trabalho em altura NR 35.",
    criadoEm: "15/09/2026",
  },
  {
    id: "prog-demo-4",
    empresaNome: "Logística Rápida Express",
    tipoRelatorio: "Auditoria Quinzenal de Empilhadeiras e Ergonomia NR 17",
    periodicidade: "quinzenal",
    dataUltimoRelatorio: "01/09/2026",
    dataProximaProgramada: "2026-09-16",
    auditorResponsavel: "Marcos Vinicius Ferreira Mendes",
    observacoes: "Checklist de buzina, faróis, extintores e rotação de operadores.",
    criadoEm: "01/09/2026",
  },
  {
    id: "prog-demo-5",
    empresaNome: "Hospital São Lucas",
    tipoRelatorio: "Avaliação Anual do Programa de Gerenciamento de Riscos (PGR)",
    periodicidade: "anual",
    dataUltimoRelatorio: "10/11/2025",
    dataProximaProgramada: "2026-11-10",
    auditorResponsavel: "Raul Luiz de Faria",
    observacoes: "Reavaliação de riscos biológicos NR 32 e plano de ação integrado.",
    criadoEm: "10/11/2025",
  },
  {
    id: "prog-demo-6",
    empresaNome: "Hospital São Lucas",
    tipoRelatorio: "Vistoria Eventual por Demanda / Quase-Acidente",
    periodicidade: "eventual",
    dataUltimoRelatorio: "05/09/2026",
    dataProximaProgramada: "",
    auditorResponsavel: "Marcos Vinicius Ferreira Mendes",
    observacoes: "Realizada somente mediante solicitação da CIPA ou ocorrência extraordinária.",
    criadoEm: "05/09/2026",
  },
];

export function getProgramacoes(): ProgramacaoRelatorio[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRAMACOES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMACOES, JSON.stringify(PROGRAMACOES_INICIAIS_EXEMPLO));
      // Salva também no Firestore
      PROGRAMACOES_INICIAIS_EXEMPLO.forEach((p) => salvarProgramacaoNuvem(p));
      return PROGRAMACOES_INICIAIS_EXEMPLO;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function calcularProximaData(dataBase: string | Date, periodicidade: string): string {
  if (periodicidade === "eventual") return "";
  let d: Date;
  if (typeof dataBase === "string") {
    if (dataBase.includes("/")) {
      const partes = dataBase.split("/");
      d = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    } else {
      d = new Date(`${dataBase}T12:00:00`);
    }
  } else {
    d = new Date(dataBase);
  }

  if (isNaN(d.getTime())) return "";

  const proxima = new Date(d);
  switch (periodicidade) {
    case "semanal":
      proxima.setDate(proxima.getDate() + 7);
      break;
    case "quinzenal":
      proxima.setDate(proxima.getDate() + 15);
      break;
    case "mensal":
      proxima.setMonth(proxima.getMonth() + 1);
      break;
    case "semestral":
      proxima.setMonth(proxima.getMonth() + 6);
      break;
    case "anual":
      proxima.setFullYear(proxima.getFullYear() + 1);
      break;
    default:
      return "";
  }
  return proxima.toISOString().split("T")[0];
}

export function calcularStatusPrazo(
  dataProxima?: string,
  periodicidade?: string
): { status: "atrasado" | "atencao" | "em_dia" | "eventual"; diasDiferenca: number; label: string } {
  if (periodicidade === "eventual" && !dataProxima) {
    return { status: "eventual", diasDiferenca: 0, label: "Eventual (Sob Demanda)" };
  }

  if (!dataProxima) {
    return { status: "eventual", diasDiferenca: 0, label: "Sem data agendada" };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let dataAlvo: Date;
  if (dataProxima.includes("-")) {
    const [ano, mes, dia] = dataProxima.split("-").map(Number);
    dataAlvo = new Date(ano, mes - 1, dia);
  } else if (dataProxima.includes("/")) {
    const [dia, mes, ano] = dataProxima.split("/").map(Number);
    dataAlvo = new Date(ano, mes - 1, dia);
  } else {
    dataAlvo = new Date(dataProxima);
  }

  dataAlvo.setHours(0, 0, 0, 0);

  if (isNaN(dataAlvo.getTime())) {
    return { status: "eventual", diasDiferenca: 0, label: "Data não definida" };
  }

  const diffMs = dataAlvo.getTime() - hoje.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    const atraso = Math.abs(diffDias);
    return {
      status: "atrasado",
      diasDiferenca: atraso,
      label: `Atrasado (${atraso}d)`,
    };
  } else if (diffDias === 0) {
    return {
      status: "atencao",
      diasDiferenca: 0,
      label: "Vence hoje!",
    };
  } else if (diffDias <= 7) {
    return {
      status: "atencao",
      diasDiferenca: diffDias,
      label: `Vence em ${diffDias}d`,
    };
  } else {
    return {
      status: "em_dia",
      diasDiferenca: diffDias,
      label: `Em dia (${diffDias}d)`,
    };
  }
}

export function salvarProgramacao(
  prog: Omit<ProgramacaoRelatorio, "id"> & { id?: string }
): ProgramacaoRelatorio {
  const lista = getProgramacoes();
  const agoraStr = new Date().toLocaleDateString("pt-BR");

  let salvo: ProgramacaoRelatorio;
  if (prog.id) {
    salvo = {
      ...(prog as ProgramacaoRelatorio),
      atualizadoEm: agoraStr,
    };
    const idx = lista.findIndex((p) => p.id === prog.id);
    if (idx >= 0) {
      lista[idx] = salvo;
    } else {
      lista.push(salvo);
    }
  } else {
    salvo = {
      ...prog,
      id: `prog-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      criadoEm: agoraStr,
      atualizadoEm: agoraStr,
    };
    lista.push(salvo);
  }

  localStorage.setItem(STORAGE_KEYS.PROGRAMACOES, JSON.stringify(lista));
  salvarProgramacaoNuvem(salvo);
  return salvo;
}

export function excluirProgramacao(id: string): void {
  const lista = getProgramacoes().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROGRAMACOES, JSON.stringify(lista));
  excluirProgramacaoNuvem(id);
}

export function concluirCicloProgramacao(
  id: string,
  dataConclusao: string = new Date().toLocaleDateString("pt-BR"),
  idLaudoGerado?: string,
  numeroLaudoGerado?: number
): ProgramacaoRelatorio | null {
  const lista = getProgramacoes();
  const item = lista.find((p) => p.id === id);
  if (!item) return null;

  item.dataUltimoRelatorio = dataConclusao;
  if (idLaudoGerado) item.idUltimoLaudo = idLaudoGerado;
  if (numeroLaudoGerado) item.numeroUltimoLaudo = numeroLaudoGerado;
  item.concluidoEm = dataConclusao;

  // Calcula automaticamente a próxima data baseada na periodicidade
  if (item.periodicidade !== "eventual") {
    item.dataProximaProgramada = calcularProximaData(dataConclusao, item.periodicidade);
  }

  item.atualizadoEm = new Date().toLocaleDateString("pt-BR");
  localStorage.setItem(STORAGE_KEYS.PROGRAMACOES, JSON.stringify(lista));
  salvarProgramacaoNuvem(item);
  return item;
}

// --- SESSÕES DE ASSINATURA REMOTA (QR CODE) ---

export function getSessoesAssinatura(): SessaoAssinatura[] {
  const data = localStorage.getItem(STORAGE_KEYS.SESSOES_ASSINATURA);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getSessaoAssinaturaPorId(id: string): SessaoAssinatura | null {
  const lista = getSessoesAssinatura();
  return lista.find((s) => s.id === id) || null;
}

export function salvarSessaoAssinatura(sessao: SessaoAssinatura): SessaoAssinatura {
  const lista = getSessoesAssinatura();
  const index = lista.findIndex((s) => s.id === sessao.id);
  if (index >= 0) {
    lista[index] = { ...lista[index], ...sessao };
  } else {
    lista.push(sessao);
  }
  localStorage.setItem(STORAGE_KEYS.SESSOES_ASSINATURA, JSON.stringify(lista));
  criarSessaoAssinaturaNuvem(sessao);
  return sessao;
}

export function atualizarSessaoAssinatura(
  id: string,
  updates: Partial<SessaoAssinatura>
): SessaoAssinatura | null {
  const lista = getSessoesAssinatura();
  const index = lista.findIndex((s) => s.id === id);
  if (index >= 0) {
    lista[index] = { ...lista[index], ...updates, atualizadoEm: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SESSOES_ASSINATURA, JSON.stringify(lista));
    return lista[index];
  }
  return null;
}


