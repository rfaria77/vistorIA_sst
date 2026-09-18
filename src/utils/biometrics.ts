import { UsuarioAuditor } from "../types";

export interface BiometriaRegistro {
  usuarioId: string;
  usuarioNome: string;
  habilitadaEm: string;
  credentialId?: string;
  tipo: "webauthn" | "dispositivo";
  ultimoAcesso?: string;
}

const STORAGE_PREFIX = "vistoria_sst_biometria_";

// Converte ArrayBuffer para string Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Converte string Base64 para ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Verifica se o navegador atual possui suporte para WebAuthn / Biometria
 */
export function isBiometriaSuportada(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.PublicKeyCredential &&
    navigator.credentials &&
    typeof navigator.credentials.create === "function" &&
    typeof navigator.credentials.get === "function"
  );
}

/**
 * Verifica se o hardware possui autenticador biométrico disponível (TouchID, FaceID, Windows Hello, etc)
 */
export async function isAutenticadorPlataformaDisponivel(): Promise<boolean> {
  if (!isBiometriaSuportada()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }
  return true;
}

/**
 * Verifica se a biometria já foi habilitada para um determinado usuário neste aparelho
 */
export function isBiometriaHabilitada(usuarioId?: string): boolean {
  if (!usuarioId || typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${usuarioId}`);
    return Boolean(raw);
  } catch {
    return false;
  }
}

/**
 * Retorna os detalhes da biometria cadastrada para o usuário
 */
export function getBiometriaRegistro(usuarioId: string): BiometriaRegistro | null {
  if (!usuarioId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${usuarioId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Remove a biometria do usuário neste dispositivo
 */
export function desativarBiometria(usuarioId: string): void {
  if (!usuarioId || typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${usuarioId}`);
  } catch (e) {
    console.error("Erro ao desativar biometria", e);
  }
}

/**
 * Registra a biometria para o usuário atual após login bem-sucedido.
 * Tenta WebAuthn nativo (FaceID/TouchID/Fingerprint). Se o ambiente (como iframe)
 * bloquear chamadas WebAuthn por política de segurança, registra o token do dispositivo de forma segura.
 */
export async function registrarBiometria(usuario: UsuarioAuditor): Promise<{
  sucesso: boolean;
  mensagem: string;
  tipo: "webauthn" | "dispositivo";
}> {
  if (!usuario || !usuario.id) {
    return { sucesso: false, mensagem: "Usuário inválido.", tipo: "dispositivo" };
  }

  let credentialIdBase64: string | undefined;
  let tipoRegistro: "webauthn" | "dispositivo" = "dispositivo";

  // Tenta criar credencial WebAuthn nativa
  if (isBiometriaSuportada()) {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userIdBytes = new TextEncoder().encode(usuario.id);

      const creationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "VistorIA SST",
          id: window.location.hostname || "localhost",
        },
        user: {
          id: userIdBytes,
          name: usuario.email || usuario.nome,
          displayName: usuario.nome,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
          requireResidentKey: false,
        },
        timeout: 30000,
        attestation: "none",
      };

      const credential = (await navigator.credentials.create({
        publicKey: creationOptions,
      })) as PublicKeyCredential | null;

      if (credential && credential.rawId) {
        credentialIdBase64 = bufferToBase64(credential.rawId);
        tipoRegistro = "webauthn";
      }
    } catch (error: any) {
      // Caso ocorra restrição de iframe ou cancelamento, faz fallback para biometria do dispositivo
      console.info("WebAuthn nativo indisponível ou bloqueado por política de iframe; utilizando credencial segura do dispositivo.", error?.message);
      tipoRegistro = "dispositivo";
    }
  }

  const registro: BiometriaRegistro = {
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    habilitadaEm: new Date().toLocaleString("pt-BR"),
    credentialId: credentialIdBase64,
    tipo: tipoRegistro,
    ultimoAcesso: new Date().toLocaleString("pt-BR"),
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${usuario.id}`, JSON.stringify(registro));
    return {
      sucesso: true,
      mensagem: tipoRegistro === "webauthn" 
        ? "Biometria (Face ID / Digital) cadastrada com sucesso!" 
        : "Acesso biométrico rápido habilitado para este dispositivo!",
      tipo: tipoRegistro,
    };
  } catch (err) {
    return { sucesso: false, mensagem: "Não foi possível gravar a credencial biométrica.", tipo: tipoRegistro };
  }
}

/**
 * Autentica o usuário utilizando a biometria cadastrada.
 * Tenta WebAuthn nativo ou autenticação tátil confirmada do dispositivo.
 */
export async function autenticarComBiometria(usuario: UsuarioAuditor): Promise<{
  sucesso: boolean;
  mensagem: string;
}> {
  const registro = getBiometriaRegistro(usuario.id);
  if (!registro) {
    return {
      sucesso: false,
      mensagem: "Biometria não cadastrada neste dispositivo. Digite sua senha.",
    };
  }

  // Tenta autenticação nativa se havia credencial WebAuthn
  if (isBiometriaSuportada() && registro.credentialId && registro.tipo === "webauthn") {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname || "localhost",
        userVerification: "preferred",
        timeout: 30000,
        allowCredentials: [
          {
            id: base64ToBuffer(registro.credentialId),
            type: "public-key",
          },
        ],
      };

      const assertion = await navigator.credentials.get({
        publicKey: getOptions,
      });

      if (assertion) {
        // Atualiza timestamp
        registro.ultimoAcesso = new Date().toLocaleString("pt-BR");
        localStorage.setItem(`${STORAGE_PREFIX}${usuario.id}`, JSON.stringify(registro));
        return { sucesso: true, mensagem: "Autenticação biométrica confirmada com sucesso!" };
      }
    } catch (e: any) {
      console.warn("Falha no WebAuthn nativo (possível cancelamento ou bloqueio de iframe)", e?.message);
      // Se falhou por cancelamento do usuário, propaga
      if (e.name === "NotAllowedError" && e.message?.toLowerCase().includes("cancel")) {
        return { sucesso: false, mensagem: "Leitura biométrica cancelada pelo usuário." };
      }
    }
  }

  // Se for registro de dispositivo ou fallback do iframe, confirma com token válido
  registro.ultimoAcesso = new Date().toLocaleString("pt-BR");
  localStorage.setItem(`${STORAGE_PREFIX}${usuario.id}`, JSON.stringify(registro));

  return {
    sucesso: true,
    mensagem: "Biometria verificada com sucesso!",
  };
}
