import { db } from "./firebaseSync";
import { collection, doc, setDoc } from "firebase/firestore";
import { getEmpresas, getLaudos, getRascunhos, getProgramacoes, getUsuarios, getLogoConsultoria } from "./storage";

export interface BackupLogItem {
  id: string;
  dataHora: string;
  totalItens: number;
  tipo: "automatico" | "manual";
}

export interface BackupConfig {
  ativo: boolean;
  intervaloMinutos: number; // Ex: 5, 15, 30, 60, 360, 1440
  ultimaSincronizacao?: string;
  status?: "sucesso" | "erro" | "sincronizando" | "aguardando";
  historicoLogs?: BackupLogItem[];
}

const BACKUP_CONFIG_KEY = "vistorias_backup_config_v1";

export function getBackupConfig(): BackupConfig {
  try {
    const raw = localStorage.getItem(BACKUP_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ativo: Boolean(parsed.ativo),
        intervaloMinutos: Number(parsed.intervaloMinutos) || 15,
        ultimaSincronizacao: parsed.ultimaSincronizacao,
        status: parsed.status || "aguardando",
        historicoLogs: Array.isArray(parsed.historicoLogs) ? parsed.historicoLogs : [],
      };
    }
  } catch {}
  return {
    ativo: false,
    intervaloMinutos: 15,
    status: "aguardando",
    historicoLogs: [],
  };
}

export function salvarBackupConfig(config: BackupConfig): void {
  try {
    localStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}

// Remove undefined values to prevent Firestore errors
function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

export async function executarBackupManualOuAutomatico(tipo: "automatico" | "manual" = "manual"): Promise<{ sucesso: boolean; dataHora: string; totalItens: number; erro?: string }> {
  try {
    const empresas = getEmpresas();
    const laudos = getLaudos();
    const rascunhos = getRascunhos();
    const programacoes = getProgramacoes();
    const usuarios = getUsuarios();
    const logo = getLogoConsultoria();

    let count = 0;

    // 1. Salvar Empresas
    for (const emp of empresas) {
      await setDoc(doc(db, "backup_empresas", emp.id), sanitize(emp), { merge: true });
      count++;
    }

    // 2. Salvar Laudos
    for (const laudo of laudos) {
      await setDoc(doc(db, "backup_laudos", laudo.id), sanitize(laudo), { merge: true });
      count++;
    }

    // 3. Salvar Rascunhos
    for (const rasc of rascunhos) {
      await setDoc(doc(db, "backup_rascunhos", rasc.id), sanitize(rasc), { merge: true });
      count++;
    }

    // 4. Salvar Programações
    for (const prog of programacoes) {
      await setDoc(doc(db, "backup_programacoes", prog.id), sanitize(prog), { merge: true });
      count++;
    }

    // 5. Salvar Usuários
    for (const usr of usuarios) {
      await setDoc(doc(db, "backup_usuarios", usr.id), sanitize(usr), { merge: true });
      count++;
    }

    // 6. Salvar Metadados Gerais (incluindo logo)
    await setDoc(doc(db, "backup_metadata", "geral"), sanitize({
      ultimaSincronizacao: new Date().toISOString(),
      totalEmpresas: empresas.length,
      totalLaudos: laudos.length,
      totalRascunhos: rascunhos.length,
      totalProgramacoes: programacoes.length,
      logoConsultoriaPresente: Boolean(logo),
    }), { merge: true });

    const dataHoraStr = new Date().toLocaleString("pt-BR");
    const novoLog: BackupLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dataHora: dataHoraStr,
      totalItens: count,
      tipo,
    };

    const config = getBackupConfig();
    const historicoAtual = config.historicoLogs || [];
    // Mantém apenas os últimos 5 logs (mais recentes no topo)
    const novoHistorico = [novoLog, ...historicoAtual].slice(0, 5);

    config.ultimaSincronizacao = dataHoraStr;
    config.status = "sucesso";
    config.historicoLogs = novoHistorico;
    salvarBackupConfig(config);

    return {
      sucesso: true,
      dataHora: dataHoraStr,
      totalItens: count,
    };
  } catch (err: any) {
    const config = getBackupConfig();
    config.status = "erro";
    salvarBackupConfig(config);
    return {
      sucesso: false,
      dataHora: new Date().toLocaleString("pt-BR"),
      totalItens: 0,
      erro: err?.message || "Erro desconhecido ao executar backup",
    };
  }
}
