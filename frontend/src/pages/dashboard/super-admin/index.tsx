import { useMemo } from "react";
import { DownloadSimple, Globe, MapPin, Shield, SignOut } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NttMapWidget } from "@/components/map/ntt-map";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import { mockAnalytics, mockReports } from "@/utils/mock-data";
import { ROUTES } from "@/utils/constants";

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOnlineStatus();

  const laporanTerbaru = useMemo(() => mockReports.slice(0, 4), []);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-biru-pemerintah/30 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-netral">Selamat datang kembali</p>
          <h1 className="text-3xl font-semibold text-biru-pemerintah">{user?.nama ?? "Super Admin"}</h1>
          <p className="text-sm text-slate-netral">
            Monitor distribusi subsidi seluruh provinsi. Terakhir diperbarui: {new Date().toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <DownloadSimple className="mr-2 h-5 w-5" weight="bold" /> Unduh Laporan
          </Button>
          <Button variant="secondary" asChild>
            <a href={ROUTES.loginAdmin}>Kelola Admin</a>
          </Button>
          <Button onClick={logout}>
            <SignOut className="mr-2 h-5 w-5" weight="bold" /> Keluar
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Distribusi</CardTitle>
            <Badge variant="success">Provinsi</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-biru-pemerintah">{mockAnalytics.distribusi.persentase}%</p>
            <p className="text-xs text-slate-netral">{mockAnalytics.distribusi.tersalurkan} dari {mockAnalytics.distribusi.totalKuota} ton</p>
            <Progress value={mockAnalytics.distribusi.persentase} />
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Laporan Baru</CardTitle>
            <Badge variant="neutral">30 Hari</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-biru-pemerintah">{mockAnalytics.laporan.bulanIni}</p>
            <p className="text-xs text-slate-netral">{mockAnalytics.laporan.outstanding} menunggu tinjauan</p>
            <Progress value={90} />
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Integritas</CardTitle>
            <Badge variant="warning">Audit</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-oranye-hangat">{mockAnalytics.pelanggaran.potensial}</p>
            <p className="text-xs text-slate-netral">{mockAnalytics.pelanggaran.tertangani} kasus tertangani</p>
            <Progress value={65} />
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Status Sistem</CardTitle>
            <Badge variant={isOnline ? "success" : "warning"}>{isOnline ? "Online" : "Offline"}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-netral">Sinkronisasi realtime antara 9 instansi</p>
            <ul className="space-y-1 text-xs text-slate-netral">
              <li>• Data API pusat</li>
              <li>• Tugas lapangan</li>
              <li>• Bukti foto</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Peta Pengawasan NTT</CardTitle>
            <CardDescription>Monitoring seluruh kabupaten beserta status distribusi.</CardDescription>
          </CardHeader>
          <CardContent>
            <NttMapWidget />
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Agenda Prioritas</CardTitle>
            <CardDescription>Pembagian tugas lintas instansi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-netral">
            <div className="flex items-start justify-between rounded-2xl bg-abu-kartu/60 p-3">
              <div>
                <p className="font-medium text-teks-gelap">Rakor Pengawasan Triwulan III</p>
                <p>Kelarifikasi stok BULOG & dukungan logistik Polda</p>
              </div>
              <Badge variant="warning">29 Sep</Badge>
            </div>
            <div className="flex items-start justify-between rounded-2xl bg-abu-kartu/60 p-3">
              <div>
                <p className="font-medium text-teks-gelap">Audit Distribusi Kupang</p>
                <p>Evaluasi 5 gudang utama & rencana penguatan</p>
              </div>
              <Badge variant="success">Selesai 80%</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Laporan Terbaru</CardTitle>
            <CardDescription>Hasil verifikasi lapangan dari petugas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {laporanTerbaru.map((laporan) => (
              <div key={laporan.id} className="flex flex-col gap-2 rounded-2xl border border-abu-kartu p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-netral">
                    <MapPin className="h-4 w-4 text-biru-pemerintah" weight="bold" />
                    <span>{laporan.lokasi.alamat}</span>
                  </div>
                  <Badge variant={laporan.status === "terkirim" ? "success" : "warning"}>
                    {laporan.status === "terkirim" ? "Tersinkron" : "Menunggu"}
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-teks-gelap">{laporan.komoditas}</p>
                <p className="text-sm text-slate-netral">Penyaluran {laporan.kuotaTersalurkan}%</p>
                <p className="text-xs text-slate-netral">Catatan: {laporan.catatan}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Kontrol Kepatuhan</CardTitle>
            <CardDescription>Aktivitas sistem yang diawasi</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="audit">
              <TabsList>
                <TabsTrigger value="audit">Audit</TabsTrigger>
                <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
              </TabsList>
              <TabsContent value="audit" className="space-y-3 text-sm text-slate-netral">
                <div className="flex items-center gap-3 rounded-2xl bg-abu-kartu/60 p-3">
                  <Shield className="h-5 w-5 text-biru-pemerintah" weight="bold" />
                  <div>
                    <p className="font-medium text-teks-gelap">Audit Trail</p>
                    <p className="text-xs">93% laporan mengandung bukti foto valid</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-abu-kartu/60 p-3">
                  <Globe className="h-5 w-5 text-oranye-hangat" weight="bold" />
                  <div>
                    <p className="font-medium text-teks-gelap">Integritas Lokasi</p>
                    <p className="text-xs">5 laporan perlu verifikasi ulang lokasi GPS</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="aktivitas" className="space-y-3 text-sm text-slate-netral">
                <p>• 12 admin aktif hari ini</p>
                <p>• 4 petugas lapangan dalam mode offline</p>
                <p>• 7 permintaan akses menunggu persetujuan</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SuperAdminDashboard;

