import React, { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    setInstalled(standalone);
    setIsIos(ios);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowIosHelp(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (installed) {
    return (
      <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-sm">
        <Smartphone size={16} />
        Instalada
      </span>
    );
  }

  const handleInstall = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => undefined);
      return;
    }

    if (isIos) {
      setShowIosHelp((current) => !current);
    }
  };

  if (!promptEvent && !isIos) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-sm text-white transition"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Instalar app</span>
      </button>
      {showIosHelp && (
        <div className="absolute right-0 top-12 w-64 rounded-xl border border-dark-600 bg-dark-800 p-3 text-xs text-gray-300 shadow-xl">
          En iPhone: abrí esta web en Safari, tocá Compartir y elegí "Agregar a pantalla de inicio".
        </div>
      )}
    </div>
  );
}
