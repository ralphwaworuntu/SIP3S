import { useCallback, useEffect, useMemo, useState } from "react";

import type { BeforeInstallPromptEvent } from "@/types/before-install-prompt";

interface A2HSState {
  isAvailable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

export const useAddToHomeScreen = (): A2HSState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDismissed(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      } else {
        setDismissed(true);
      }
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return useMemo(
    () => ({
      isAvailable: !!deferredPrompt && !dismissed && !isInstalled,
      isInstalled,
      promptInstall,
      dismiss,
    }),
    [deferredPrompt, dismissed, isInstalled, promptInstall, dismiss]
  );
};
