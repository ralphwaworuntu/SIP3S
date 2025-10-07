import { useState } from "react";
import { ArrowsClockwise, Database, Factory, SignOut, WifiHigh, WifiSlash } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import { mockReports } from "@/utils/mock-data";

const SuperUserDashboard = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOnlineStatus();
  const [syncProgress, setSyncProgress] = useState(isOnline ? 100 : 65);

  const handleSync = () => {
    if (!isOnline) return;
    setSyncProgress(30);
    setTimeout(() => setSyncProgress(100), 1500);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-biru-pemerintah/30 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-netral">Super User</p>
          <h1 className="text-3xl font-semibold text-biru-pemerintah">{user?.agency ?? "BULOG"}</h1>
          <p className="text-sm text-slate-netral">Pantau stok dan distribusi komoditas subsidi untuk wilayah Kupang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={isOnline ? "success" : "warning"}>
            {isOnline ? (
              <span className="flex items-center gap-1"><WifiHigh className="h-4 w-4" /> Online</span>
            ) : (
              <span className="flex items-center gap-1"><WifiSlash className="h-4 w-4" /> Offline</span>
            )}
          </Badge>
          <Button variant="outline" onClick={handleSync} disabled={!isOnline}>
            <ArrowsClockwise className="mr-2 h-5 w-5" weight="bold" /> Sinkronisasi
          </Button>
          <Button onClick={logout}>
            <SignOut className="mr-2 h-5 w-5" weight="bold" /> Keluar
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Stok Gudang</CardTitle>
            <CardDescription>Ketersediaan komoditas utama (dalam ton)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-netral">
            <div className="rounded-2xl border border-abu-kartu p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-teks-gelap">Pupuk Urea</span>
                <span>560 / 700</span>
              </div>
              <Progress value={80} className="mt-2" />
            </div>
            <div className="rounded-2xl border border-abu-kartu p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-teks-gelap">Benih Jagung</span>
                <span>420 / 600</span>
              </div>
              <Progress value={70} className="mt-2" />
            </div>
            <div className="rounded-2xl border border-abu-kartu p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-teks-gelap">Pupuk NPK</span>
                <span>315 / 500</span>
              </div>
              <Progress value={63} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Status Sinkronisasi</CardTitle>
            <CardDescription>Terakhir sinkron: {new Date().toLocaleTimeString("id-ID")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={syncProgress} />
            <Alert variant={syncProgress === 100 ? "success" : "warning"}>
              {syncProgress === 100 ? "Data gudang sudah mutakhir" : "Proses sinkronisasi berjalan..."}
            </Alert>
            <div className="rounded-2xl border border-abu-kartu p-3 text-sm text-slate-netral">
              <p className="font-medium text-teks-gelap">Integrasi Sistem</p>
              <p>BULOG <Database className="ml-2 inline h-4 w-4" /> SIP3S</p>
              <p className="text-xs">Sinkron otomatis setiap 15 menit atau saat tombol ditekan.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Distribusi Per Komoditas</CardTitle>
          <CardDescription>Realisasi penyaluran dan permintaan dari lapangan</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="urea">
            <TabsList>
              <TabsTrigger value="urea">Pupuk Urea</TabsTrigger>
              <TabsTrigger value="npk">Pupuk NPK</TabsTrigger>
              <TabsTrigger value="benih">Benih Jagung</TabsTrigger>
            </TabsList>
            <TabsContent value="urea" className="space-y-3 text-sm text-slate-netral">
              <p>• Total permintaan minggu ini: 120 ton</p>
              <p>• Penyaluran terselesaikan: 86 ton (72%)</p>
              <p>• Pending karena transportasi: 2 gudang</p>
            </TabsContent>
            <TabsContent value="npk" className="space-y-3 text-sm text-slate-netral">
              <p>• Total permintaan minggu ini: 78 ton</p>
              <p>• Penyaluran terselesaikan: 65 ton (83%)</p>
              <p>• Sisa dialokasikan untuk Kecamatan Amarasi</p>
            </TabsContent>
            <TabsContent value="benih" className="space-y-3 text-sm text-slate-netral">
              <p>• Total permintaan minggu ini: 96 ton</p>
              <p>• Penyaluran terselesaikan: 70 ton (73%)</p>
              <p>• Perlu booster logistik ke Amarasi Timur</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Laporan Terkait BULOG</CardTitle>
            <CardDescription>Data sinkron dari petugas lapangan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-netral">
            {mockReports.map((laporan) => (
              <div key={laporan.id} className="rounded-2xl border border-abu-kartu p-3">
                <div className="flex justify-between">
                  <span className="font-medium text-teks-gelap">{laporan.komoditas}</span>
                  <Badge variant={laporan.status === "terkirim" ? "success" : "warning"}>{laporan.status}</Badge>
                </div>
                <p>{laporan.lokasi.alamat}</p>
                <p className="text-xs">{new Date(laporan.createdAt ?? "").toLocaleString("id-ID")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Rencana Distribusi</CardTitle>
            <CardDescription>Jadwal kirim 7 hari ke depan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-netral">
            <div className="rounded-2xl border border-abu-kartu p-3">
              <div className="mb-2 flex items-center gap-2 font-medium text-teks-gelap">
                <Factory className="h-4 w-4 text-biru-pemerintah" /> Gudang Oebobo → Desa Sulamu
              </div>
              <p>Tanggal: 27 Sep • Komoditas: Pupuk NPK • Volume: 20 ton</p>
            </div>
            <div className="rounded-2xl border border-abu-kartu p-3">
              <div className="mb-2 flex items-center gap-2 font-medium text-teks-gelap">
                <Factory className="h-4 w-4 text-hijau-hutan" /> Gudang Noelbaki → Amarasi
              </div>
              <p>Tanggal: 29 Sep • Komoditas: Benih Jagung • Volume: 18 ton</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SuperUserDashboard;
