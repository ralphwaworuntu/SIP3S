import { useEffect, useState } from "react";
import { ArrowLeft, CloudArrowUp } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/utils/constants";
import { offlineCache } from "@/utils/offline-cache";

interface PendingItem {
  id: string;
  createdAt: number;
  payload: {
    komoditas?: string;
    lokasi?: { alamat?: string };
    catatan?: string;
  };
}

const OfflinePage = () => {
  const [pending, setPending] = useState<PendingItem[]>([]);

  useEffect(() => {
    offlineCache
      .listPendingReports()
      .then((items) => setPending(items as PendingItem[]))
      .catch((error) => console.error(error));
  }, []);

  const handleSync = async () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage("force-sync");
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-5xl flex-col gap-8 px-4 py-10">
      <Link to={ROUTES.beranda} className="flex items-center gap-2 text-sm text-biru-pemerintah">
        <ArrowLeft className="h-4 w-4" weight="bold" /> Kembali ke beranda
      </Link>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Anda sedang offline</CardTitle>
          <CardDescription>
            Semua perubahan akan disimpan sementara. Sambungkan perangkat ke internet untuk sinkronisasi otomatis
            atau tekan tombol sinkronisasi manual di bawah.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning" className="text-sm">
            Pastikan koneksi stabil sebelum mengunggah ulang foto dan data besar.
          </Alert>
          <Button onClick={handleSync} className="w-full">
            <CloudArrowUp className="mr-2 h-5 w-5" weight="bold" /> Paksa Sinkronisasi
          </Button>
        </CardContent>
      </Card>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-teks-gelap">Laporan menunggu sinkronisasi</h2>
        <div className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-slate-netral">Tidak ada data menunggu.</p>}
          {pending.map((item) => (
            <div key={item.id} className="rounded-2xl border border-abu-kartu bg-abu-kartu/50 p-4 text-sm text-slate-netral">
              <p className="font-medium text-teks-gelap">{item.payload?.komoditas ?? "Laporan Lapangan"}</p>
              <p>{item.payload?.lokasi?.alamat ?? "Lokasi belum tersedia"}</p>
              <p className="text-xs">Catatan: {item.payload?.catatan ?? "-"}</p>
              <p className="text-xs text-slate-netral/80">Disimpan: {new Date(item.createdAt).toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default OfflinePage;
