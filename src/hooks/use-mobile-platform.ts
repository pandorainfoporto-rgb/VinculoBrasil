/**
 * Hook para detectar plataforma mobile e funcionalidades disponíveis
 *
 * Detecta se o app está rodando como:
 * - PWA instalada
 * - App nativo (Capacitor)
 * - Browser mobile
 * - Browser desktop
 */

import { useState, useEffect, useCallback } from 'react';

export type Platform = 'web' | 'pwa' | 'android' | 'ios' | 'unknown';

export interface MobilePlatformInfo {
  /** Plataforma atual */
  platform: Platform;

  /** Se está rodando como PWA instalada */
  isPwa: boolean;

  /** Se está rodando em app nativo (Capacitor) */
  isNative: boolean;

  /** Se está em dispositivo mobile (inclui tablets) */
  isMobile: boolean;

  /** Se está em tablet */
  isTablet: boolean;

  /** Se está em iOS */
  isIos: boolean;

  /** Se está em Android */
  isAndroid: boolean;

  /** Se está online */
  isOnline: boolean;

  /** Se suporta notificações push */
  supportsPushNotifications: boolean;

  /** Se suporta biometria */
  supportsBiometrics: boolean;

  /** Se suporta câmera */
  supportsCamera: boolean;

  /** Se suporta geolocalização */
  supportsGeolocation: boolean;

  /** Se suporta compartilhamento nativo */
  supportsShare: boolean;

  /** Solicitar instalação PWA (se disponível) */
  promptInstall: (() => Promise<boolean>) | null;

  /** Se pode instalar como PWA */
  canInstallPwa: boolean;
}

// Evento de instalação PWA
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useMobilePlatform(): MobilePlatformInfo {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // Detectar plataforma
  const detectPlatform = useCallback((): Platform => {
    if (typeof window === 'undefined') return 'unknown';

    // Verificar se é Capacitor (app nativo)
    const isCapacitor = !!(window as { Capacitor?: unknown }).Capacitor;

    if (isCapacitor) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('android')) return 'android';
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
      return 'unknown';
    }

    // Verificar se é PWA instalada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone) return 'pwa';

    return 'web';
  }, []);

  // Detectar se é mobile
  const detectMobile = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Detectar se é tablet
  const detectTablet = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /ipad|android(?!.*mobile)/i.test(userAgent);
  }, []);

  // Detectar iOS
  const detectIos = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  // Detectar Android
  const detectAndroid = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  }, []);

  // Verificar suporte a funcionalidades
  const checkPushSupport = useCallback((): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }, []);

  const checkBiometricsSupport = useCallback((): boolean => {
    // Web Authn para biometria no browser
    return 'credentials' in navigator && 'PublicKeyCredential' in window;
  }, []);

  const checkCameraSupport = useCallback((): boolean => {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  }, []);

  const checkGeolocationSupport = useCallback((): boolean => {
    return 'geolocation' in navigator;
  }, []);

  const checkShareSupport = useCallback((): boolean => {
    return 'share' in navigator;
  }, []);

  // Solicitar instalação PWA
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      setCanInstallPwa(false);
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, []);

  // Listeners de eventos
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstallPwa(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setCanInstallPwa(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const platform = detectPlatform();
  const isIos = detectIos();
  const isAndroid = detectAndroid();

  return {
    platform,
    isPwa: platform === 'pwa',
    isNative: platform === 'android' || platform === 'ios',
    isMobile: detectMobile(),
    isTablet: detectTablet(),
    isIos,
    isAndroid,
    isOnline,
    supportsPushNotifications: checkPushSupport(),
    supportsBiometrics: checkBiometricsSupport(),
    supportsCamera: checkCameraSupport(),
    supportsGeolocation: checkGeolocationSupport(),
    supportsShare: checkShareSupport(),
    promptInstall: canInstallPwa ? promptInstall : null,
    canInstallPwa,
  };
}

/**
 * Hook simplificado para detectar apenas se é mobile
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobilePlatform();
  return isMobile;
}

/**
 * Hook para detectar status online/offline
 */
export function useIsOnline(): boolean {
  const { isOnline } = useMobilePlatform();
  return isOnline;
}
