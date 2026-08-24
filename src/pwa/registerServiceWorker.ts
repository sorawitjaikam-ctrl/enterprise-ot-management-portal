/**
 * Service Worker Registration and Lifecycle Manager
 * Enterprise OT Management Portal - Double A Terminal
 */

export interface SWRegistrationCallbacks {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onError?: (error: Error) => void;
}

export interface SWRegistrationOptions extends SWRegistrationCallbacks {
  swUrl?: string;
  scope?: string;
  enableInDev?: boolean;
}

let registrationInstance: ServiceWorkerRegistration | null = null;
let isRefreshing = false;

/**
 * Register the Service Worker in a browser-safe, production-optimized manner.
 * Automatically avoids interfering with Vite HMR in development unless explicitly enabled.
 */
export async function registerServiceWorker(
  options: SWRegistrationOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  const {
    swUrl = '/sw.js',
    scope = '/',
    enableInDev = false,
    onSuccess,
    onUpdate,
    onOfflineReady,
    onError,
  } = options;

  // 1. Guard against non-browser environments or unsupported browsers
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  // 2. Prevent breaking Vite HMR in development mode unless explicitly enabled
  const isDev = import.meta.env.DEV;
  const forceEnable = 
    enableInDev || 
    (typeof window !== 'undefined' && window.location.search.includes('enable_sw=1'));

  if (isDev && !forceEnable) {
    console.info('[PWA] Service Worker registration skipped in development mode to preserve Vite HMR.');
    return null;
  }

  // 3. Listen for controllerchange without forcing disruptive page reload
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.info('[PWA] Service Worker controller updated smoothly in background.');
  });

  // 4. Register when page finishes loading to protect Critical Rendering Path (LCP / FID)
  const registerAction = async () => {
    try {
      const registration = await navigator.serviceWorker.register(swUrl, { scope });
      registrationInstance = registration;

      // Check if an updated worker is already waiting
      if (registration.waiting) {
        if (navigator.serviceWorker.controller) {
          onUpdate?.(registration);
          dispatchPWAEvent('pwa:update-available', { registration });
        }
      }

      // Track updates when a new worker is discovered
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // A new update is available and waiting
              console.info('[PWA] New content is available and waiting to activate.');
              onUpdate?.(registration);
              dispatchPWAEvent('pwa:update-available', { registration });
            } else {
              // Content is cached for offline use for the first time
              console.info('[PWA] Content is cached for offline use.');
              onOfflineReady?.();
              dispatchPWAEvent('pwa:offline-ready', { registration });
            }
          }
        });
      });

      onSuccess?.(registration);
      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      onError?.(error as Error);
      return null;
    }
  };

  if (document.readyState === 'complete') {
    return registerAction();
  }

  return new Promise((resolve) => {
    window.addEventListener('load', () => {
      resolve(registerAction());
    });
  });
}

/**
 * Unregister all active Service Workers (useful for troubleshooting or resetting cache)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.info('[PWA] Service Worker unregistered:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('[PWA] Failed to unregister Service Worker:', error);
    return false;
  }
}

/**
 * Tell the waiting Service Worker to skip waiting and take control immediately
 */
export function skipWaitingAndReload(registration?: ServiceWorkerRegistration | null): void {
  const reg = registration || registrationInstance;
  if (!reg || !reg.waiting) {
    // If no waiting worker, fallback to hard reload
    window.location.reload();
    return;
  }

  reg.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Check if a Service Worker update is available
 */
export async function checkForSWUpdate(registration?: ServiceWorkerRegistration | null): Promise<void> {
  const reg = registration || registrationInstance;
  if (reg) {
    try {
      await reg.update();
    } catch (err) {
      console.warn('[PWA] Service Worker update check failed:', err);
    }
  }
}

/**
 * Helper to dispatch custom PWA DOM events
 */
function dispatchPWAEvent(eventName: string, detail: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}
