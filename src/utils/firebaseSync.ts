import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  Firestore,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import {
  Empresa,
  LaudoEmitido,
  ProgramacaoRelatorio,
  RascunhoVistoria,
  SessaoAssinatura,
  UsuarioAuditor,
} from "../types";
import {
  USUARIO_ADMIN_RAUL,
  USUARIO_INSPETOR_MARCOS,
  USUARIOS_PADRAO,
} from "./storage";

// Initialize Firebase App
const app = !getApps().length
  ? initializeApp({
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
    })
  : getApp();

// Initialize Firestore with custom databaseId if configured
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase offline: operando com cache local.");
    }
    return false;
  }
}

// Remove undefined values to prevent Firestore rejection
function sanitizeData<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

// --- SYNC LISTENERS ---

export function subscribeUsuariosNuvem(
  onUpdate: (usuarios: UsuarioAuditor[]) => void
): () => void {
  const colRef = collection(db, "usuarios");

  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Se a nuvem estiver vazia na primeira vez, cadastra os usuários padrão
        try {
          for (const u of USUARIOS_PADRAO) {
            await setDoc(doc(db, "usuarios", u.id), sanitizeData(u));
          }
        } catch (e) {
          console.warn("Falha ao semear usuários iniciais na nuvem:", e);
        }
        onUpdate(USUARIOS_PADRAO);
        return;
      }

      const lista: UsuarioAuditor[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UsuarioAuditor;
        lista.push({ ...data, id: docSnap.id });
      });

      // Garante que o administrador Raul exista na lista
      const temRaul = lista.some(
        (u) =>
          u.id === USUARIO_ADMIN_RAUL.id ||
          u.email.toLowerCase() === USUARIO_ADMIN_RAUL.email.toLowerCase()
      );
      if (!temRaul) {
        lista.unshift(USUARIO_ADMIN_RAUL);
        try {
          setDoc(doc(db, "usuarios", USUARIO_ADMIN_RAUL.id), sanitizeData(USUARIO_ADMIN_RAUL));
        } catch {}
      }

      onUpdate(lista);
    },
    (err) => {
      console.warn("Erro ao escutar usuários na nuvem (usando local):", err);
    }
  );

  return unsubscribe;
}

export function subscribeEmpresasNuvem(
  onUpdate: (empresas: Empresa[]) => void
): () => void {
  const colRef = collection(db, "empresas");

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) return;
      const lista: Empresa[] = [];
      snapshot.forEach((d) => lista.push({ ...(d.data() as Empresa), id: d.id }));
      onUpdate(lista);
    },
    (err) => console.warn("Erro ao escutar empresas na nuvem:", err)
  );
}

export function subscribeRascunhosNuvem(
  onUpdate: (rascunhos: RascunhoVistoria[]) => void
): () => void {
  const colRef = collection(db, "rascunhos");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const lista: RascunhoVistoria[] = [];
      snapshot.forEach((d) => lista.push({ ...(d.data() as RascunhoVistoria), id: d.id }));
      // Ordena por data de atualização decrescente
      lista.sort((a, b) => (b.dataAtualizacao > a.dataAtualizacao ? 1 : -1));
      onUpdate(lista);
    },
    (err) => console.warn("Erro ao escutar rascunhos na nuvem:", err)
  );
}

export function subscribeLaudosNuvem(
  onUpdate: (laudos: LaudoEmitido[]) => void
): () => void {
  const colRef = collection(db, "laudos");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const lista: LaudoEmitido[] = [];
      snapshot.forEach((d) => lista.push({ ...(d.data() as LaudoEmitido), id: d.id }));
      lista.sort((a, b) => (b.data > a.data ? 1 : -1));
      onUpdate(lista);
    },
    (err) => console.warn("Erro ao escutar laudos na nuvem:", err)
  );
}

export function subscribeProgramacoesNuvem(
  onUpdate: (programacoes: ProgramacaoRelatorio[]) => void
): () => void {
  const colRef = collection(db, "programacoes");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const lista: ProgramacaoRelatorio[] = [];
      snapshot.forEach((d) => lista.push({ ...(d.data() as ProgramacaoRelatorio), id: d.id }));
      lista.sort((a, b) => {
        const dataA = a.dataProximaProgramada || "";
        const dataB = b.dataProximaProgramada || "";
        return dataA.localeCompare(dataB);
      });
      onUpdate(lista);
    },
    (err) => console.warn("Erro ao escutar programações na nuvem:", err)
  );
}

// --- CLOUD CRUD OPERATIONS ---

export async function salvarUsuarioNuvem(usuario: UsuarioAuditor): Promise<void> {
  try {
    const docRef = doc(db, "usuarios", usuario.id);
    await setDoc(docRef, sanitizeData(usuario), { merge: true });
  } catch (err) {
    console.error("Erro ao salvar usuário no Firestore:", err);
  }
}

export async function excluirUsuarioNuvem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "usuarios", id));
  } catch (err) {
    console.error("Erro ao excluir usuário no Firestore:", err);
  }
}

export async function salvarEmpresaNuvem(empresa: Empresa): Promise<void> {
  try {
    const docRef = doc(db, "empresas", empresa.id);
    await setDoc(docRef, sanitizeData(empresa), { merge: true });
  } catch (err) {
    console.error("Erro ao salvar empresa no Firestore:", err);
  }
}

export async function salvarRascunhoNuvem(rascunho: RascunhoVistoria): Promise<void> {
  try {
    const docRef = doc(db, "rascunhos", rascunho.id);
    await setDoc(docRef, sanitizeData(rascunho), { merge: true });
  } catch (err) {
    console.error("Erro ao salvar rascunho no Firestore:", err);
  }
}

export async function excluirRascunhoNuvem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "rascunhos", id));
  } catch (err) {
    console.error("Erro ao excluir rascunho no Firestore:", err);
  }
}

export async function salvarLaudoNuvem(laudo: LaudoEmitido): Promise<void> {
  try {
    const docRef = doc(db, "laudos", laudo.id);
    await setDoc(docRef, sanitizeData(laudo), { merge: true });
  } catch (err) {
    console.error("Erro ao salvar laudo no Firestore:", err);
  }
}

export async function excluirLaudoNuvem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "laudos", id));
  } catch (err) {
    console.error("Erro ao excluir laudo no Firestore:", err);
  }
}

export async function salvarProgramacaoNuvem(programacao: ProgramacaoRelatorio): Promise<void> {
  try {
    const docRef = doc(db, "programacoes", programacao.id);
    await setDoc(docRef, sanitizeData(programacao), { merge: true });
  } catch (err) {
    console.error("Erro ao salvar programação no Firestore:", err);
  }
}

export async function excluirProgramacaoNuvem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "programacoes", id));
  } catch (err) {
    console.error("Erro ao excluir programação no Firestore:", err);
  }
}

// --- SESSÕES DE ASSINATURA DIGITAL REMOTA (QR CODE SEM CONTATO) ---

export async function criarSessaoAssinaturaNuvem(sessao: SessaoAssinatura): Promise<void> {
  try {
    const docRef = doc(db, "sessoesAssinatura", sessao.id);
    await setDoc(docRef, sanitizeData(sessao), { merge: true });
  } catch (err) {
    console.error("Erro ao registrar sessão de assinatura no Firestore:", err);
  }
}

export function subscribeSessaoAssinaturaNuvem(
  sessaoId: string,
  onUpdate: (sessao: SessaoAssinatura | null) => void
): () => void {
  const docRef = doc(db, "sessoesAssinatura", sessaoId);
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SessaoAssinatura);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn("Erro no listener de assinatura remota:", err);
    }
  );
  return unsubscribe;
}

export async function obterSessaoAssinaturaNuvem(sessaoId: string): Promise<SessaoAssinatura | null> {
  try {
    const docRef = doc(db, "sessoesAssinatura", sessaoId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SessaoAssinatura;
    }
    return null;
  } catch (err) {
    console.error("Erro ao buscar sessão de assinatura no Firestore:", err);
    return null;
  }
}

export async function enviarAssinaturaRemotaNuvem(
  sessaoId: string,
  dados: {
    assinaturaAcompanhante: string;
    acompNome?: string;
    acompCargo?: string;
    ipAssinante?: string;
    userAgentAssinante?: string;
  }
): Promise<void> {
  try {
    const docRef = doc(db, "sessoesAssinatura", sessaoId);
    const updates: Partial<SessaoAssinatura> = {
      status: "assinado",
      assinaturaAcompanhante: dados.assinaturaAcompanhante,
      assinadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      ...(dados.acompNome ? { acompNome: dados.acompNome } : {}),
      ...(dados.acompCargo ? { acompCargo: dados.acompCargo } : {}),
      ...(dados.ipAssinante ? { ipAssinante: dados.ipAssinante } : {}),
      ...(dados.userAgentAssinante ? { userAgentAssinante: dados.userAgentAssinante } : {}),
    };
    await setDoc(docRef, sanitizeData(updates), { merge: true });
  } catch (err) {
    console.error("Erro ao registrar assinatura remota no Firestore:", err);
    throw err;
  }
}

export async function cancelarSessaoAssinaturaNuvem(sessaoId: string): Promise<void> {
  try {
    const docRef = doc(db, "sessoesAssinatura", sessaoId);
    await setDoc(docRef, { status: "cancelado", atualizadoEm: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error("Erro ao cancelar sessão no Firestore:", err);
  }
}

/**
 * Limpa dados de teste (laudos, rascunhos, programações) e redefine a coleção de empresas
 * para conter estritamente as 3 empresas de teste interno (CNPJ, CAEPF e CEI/CNO).
 *
 * CRÍTICO: NUNCA TOCA NA COLEÇÃO 'usuarios' — todos os usuários cadastrados pelo usuário
 * são 100% preservados!
 */
export async function limparDadosDeTesteNuvem(empresasPadrao: Empresa[]): Promise<void> {
  try {
    // 1. Limpar laudos de teste da nuvem
    try {
      const laudosSnap = await getDocs(collection(db, "laudos"));
      for (const docSnap of laudosSnap.docs) {
        await deleteDoc(doc(db, "laudos", docSnap.id)).catch(() => {});
      }
    } catch (e) {
      console.warn("Erro ao limpar laudos na nuvem:", e);
    }

    // 2. Limpar rascunhos de teste da nuvem
    try {
      const rascSnap = await getDocs(collection(db, "rascunhos"));
      for (const docSnap of rascSnap.docs) {
        await deleteDoc(doc(db, "rascunhos", docSnap.id)).catch(() => {});
      }
    } catch (e) {
      console.warn("Erro ao limpar rascunhos na nuvem:", e);
    }

    // 3. Limpar programações de teste da nuvem
    try {
      const progSnap = await getDocs(collection(db, "programacoes"));
      for (const docSnap of progSnap.docs) {
        await deleteDoc(doc(db, "programacoes", docSnap.id)).catch(() => {});
      }
    } catch (e) {
      console.warn("Erro ao limpar programações na nuvem:", e);
    }

    // 4. Manter apenas as 3 empresas padrão de teste na nuvem
    try {
      const empSnap = await getDocs(collection(db, "empresas"));
      const idsPadrao = new Set(empresasPadrao.map((e) => e.id));
      for (const docSnap of empSnap.docs) {
        if (!idsPadrao.has(docSnap.id)) {
          await deleteDoc(doc(db, "empresas", docSnap.id)).catch(() => {});
        }
      }
      for (const emp of empresasPadrao) {
        await setDoc(doc(db, "empresas", emp.id), sanitizeData(emp), { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn("Erro ao redefinir empresas na nuvem:", e);
    }
  } catch (err) {
    console.error("Erro geral ao limpar dados de teste:", err);
  }
}

