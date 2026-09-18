import { registerSW } from 'virtual:pwa-register';

// Register service worker with automatic update checks
export function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Automatically activate new updates
        updateSW(true);
      },
      onOfflineReady() {
        console.log('VistorIA SST está pronto para uso 100% offline.');
      },
    });
  }
}
