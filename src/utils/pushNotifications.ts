export async function solicitarPermissaoNotificacao(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

export function dispararNotificacaoLocal(titulo: string, corpo: string, icone?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(titulo, {
            body: corpo,
            icon: icone || "/favicon.ico",
            badge: "/favicon.ico",
          });
        });
      } else {
        new Notification(titulo, {
          body: corpo,
          icon: icone || "/favicon.ico",
        });
      }
    } catch (err) {
      console.warn("Erro ao disparar notificação push:", err);
    }
  }
}
