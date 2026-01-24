/**
 * Banner de Instalacao PWA
 *
 * Exibe um banner sugerindo ao usuario instalar o app como PWA.
 * Aparece apenas quando:
 * - O usuario esta em um dispositivo mobile
 * - O app ainda nao foi instalado
 * - O browser suporta instalacao PWA
 */

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobilePlatform } from '@/hooks/use-mobile-platform';

interface PwaInstallBannerProps {
  /** Delay em ms antes de mostrar o banner */
  delay?: number;
  /** Callback quando o usuario instala o app */
  onInstall?: () => void;
  /** Callback quando o usuario fecha o banner */
  onDismiss?: () => void;
}

export function PwaInstallBanner({ delay = 3000, onInstall, onDismiss }: PwaInstallBannerProps) {
  const { canInstallPwa, promptInstall, isMobile, isPwa, isIos } = useMobilePlatform();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Verificar se ja foi dispensado anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Mostrar novamente apos 7 dias
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      }
    }
  }, []);

  // Mostrar banner apos delay
  useEffect(() => {
    if (isDismissed || isPwa) return;
    if (!canInstallPwa && !isIos) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [canInstallPwa, isIos, isDismissed, isPwa, delay]);

  const handleInstall = async () => {
    if (promptInstall) {
      const installed = await promptInstall();
      if (installed) {
        setIsVisible(false);
        onInstall?.();
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    onDismiss?.();
  };

  if (!isVisible) return null;

  // Instrucoes especificas para iOS (nao suporta beforeinstallprompt)
  if (isIos && isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg animate-in slide-in-from-bottom duration-300">
        <div className="max-w-lg mx-auto flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Instale o Vinculo</h3>
            <p className="text-sm text-indigo-100 mt-1">
              Toque em{' '}
              <span className="inline-flex items-center px-1 bg-white/20 rounded">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 16L16 11H13V4H11V11H8L12 16Z" />
                  <path d="M20 18H4V11H2V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V11H20V18Z" />
                </svg>
              </span>{' '}
              e depois em <strong>Adicionar a Tela de Inicio</strong>
            </p>
          </div>
          <button onClick={handleDismiss} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Banner padrao para Android/Desktop
  if (canInstallPwa) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg animate-in slide-in-from-bottom duration-300">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl">
            <Download className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Instale o Vinculo</h3>
            <p className="text-sm text-indigo-100">Acesso rapido direto da sua tela inicial</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20"
            >
              Depois
            </Button>
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Instalar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Componente de status offline
 */
export function OfflineBanner() {
  const { isOnline } = useMobilePlatform();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2 bg-amber-500 text-amber-900 text-center text-sm font-medium">
      Voce esta offline. Algumas funcionalidades podem nao estar disponiveis.
    </div>
  );
}
