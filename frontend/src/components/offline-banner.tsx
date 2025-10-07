import { WifiSlash, WifiHigh } from "@phosphor-icons/react";

import { useOnlineStatus } from "@/context/online-status-context";

export const OfflineBanner = () => {
  const { isOnline } = useOnlineStatus();

  return (
    <div
      aria-live="polite"
      className="sticky top-0 z-[70] w-full bg-abu-kartu text-sm text-teks-gelap shadow-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2">
        {isOnline ? (
          <>
            <WifiHigh className="h-4 w-4 text-hijau-hutan" weight="bold" />
            <span>Koneksi stabil. Perubahan akan tersinkron otomatis.</span>
          </>
        ) : (
          <>
            <WifiSlash className="h-4 w-4 text-oranye-hangat" weight="bold" />
            <span>Anda offline. Data akan tersimpan lokal dan tersinkron saat online.</span>
          </>
        )}
      </div>
    </div>
  );
};
