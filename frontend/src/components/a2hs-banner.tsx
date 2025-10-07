import { ArrowUpRight, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useAddToHomeScreen } from "@/hooks/use-a2hs";

export const A2HSBanner = () => {
  const { isAvailable, promptInstall, dismiss } = useAddToHomeScreen();

  if (!isAvailable) return null;

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 bg-white/95 shadow-xl backdrop-blur-sm md:inset-x-auto md:right-6 md:w-[360px]">
      <div className={cn("flex items-start gap-4 rounded-3xl border border-biru-pemerintah/30 bg-white p-4 text-sm text-teks-gelap")}> 
        <div className="flex-1 space-y-2">
          <p className="text-base font-semibold text-biru-pemerintah">Pasang SIP3S</p>
          <p className="text-xs text-slate-netral">
            Tambahkan aplikasi ke layar utama agar bisa diakses cepat dan tetap siap digunakan meski tanpa koneksi.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={promptInstall} className="gap-2">
              <ArrowUpRight className="h-4 w-4" weight="bold" /> Tambahkan ke layar utama
            </Button>
            <Button size="sm" variant="outline" onClick={dismiss}>
              Nanti saja
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Tutup"
          className="mt-1 rounded-full p-1 text-slate-netral transition hover:bg-abu-kartu"
          onClick={dismiss}
        >
          <X className="h-4 w-4" weight="bold" />
        </button>
      </div>
    </div>
  );
};
