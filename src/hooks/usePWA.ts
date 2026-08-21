/**
 * PWA Management Hook
 * Manages install prompts, standalone mode detection, online/offline state, and SW updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { skipWaitingAndReload, checkForSWUpdate } from '../pwa/registerServiceWorker';

// Web API Interface for beforeinstallprompt
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAState {
  /** True if the browser has fired beforeinstallprompt and installation is available */
  isInstallable: boolean;
  /** True if the app has been installed or is running in standalone mode */
  isInstalled: boolean;
  /** True if currently running in standalone PWA window / display-mode */
  isStandalone: boolean;
  /** True if the browser/device is currently offline */
  isOffline: boolean;
  /** True if an updated Service Worker is waiting to activate */
  updateAvailable: boolean;
  /** True if client is iOS Safari (which requires manual 'Add to Home Screen' action) */
  isIOS: boolean;
  /** ServiceWorkerRegistration instance */
  registration: ServiceWorkerRegistration | null;
}

export interface PWAActions {
  /** Trigger the native browser install prompt */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** Apply pending Service Worker update (skip waiting and reload) */
  applyUpdate: () => void;
  /** Dismiss the update notification */
  dismissUpdate: () => void;
  /** Dismiss the install banner */
  dismissInstall: () => void;
  /** Manually trigger an update check */
  checkForUpdates: () => Promise<void>;
}

export function usePWA(): PWAState & PWAActions {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  // 1. Detect standalone mode and iOS environment
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'));
      setIsStandalone(Boolean(isStandaloneMode));
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) setIsInstalled(true);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  // 2. Manage beforeinstallprompt and appinstalled events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      console.info('[PWA] beforeinstallprompt event captured and deferred.');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      console.info('[PWA] appinstalled event fired: App was successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 3. Manage online / offline connectivity status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 4. Listen for custom PWA registration update events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdateAvailable = (e: Event) => {
      const customEvent = e as CustomEvent<{ registration: ServiceWorkerRegistration }>;
      if (customEvent.detail?.registration) {
        setRegistration(customEvent.detail.registration);
      }
      setUpdateAvailable(true);
    };

    window.addEventListener('pwa:update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa:update-available', handleUpdateAvailable);
    };
  }, []);

  // 5. Action: Prompt user to install
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) {
      console.warn('[PWA] Install prompt called but no deferredPrompt available.');
      return 'unavailable';
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.info(`[PWA] Install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      return outcome;
    } catch (err) {
      console.error('[PWA] Error during install prompt:', err);
      return 'unavailable';
    }
  }, [deferredPrompt]);

  // 6. Action: Apply pending Service Worker update
  const applyUpdate = useCallback(() => {
    skipWaitingAndReload(registration);
  }, [registration]);

  // 7. Action: Dismiss update notification
  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  // 8. Action: Dismiss install banner
  const dismissInstall = useCallback(() => {
    setIsInstallable(false);
  }, []);

  // 9. Action: Check for updates
  const checkForUpdates = useCallback(async () => {
    await checkForSWUpdate(registration);
  }, [registration]);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isOffline,
    updateAvailable,
    isIOS,
    registration,
    promptInstall,
    applyUpdate,
    dismissUpdate,
    dismissInstall,
    checkForUpdates,
  };
}
