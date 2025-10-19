import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { ClipboardText, DownloadSimple, Globe, MapPin, Shield, ShieldCheck, SignOut, CheckCircle, Leaf, UsersThree } from "@phosphor-icons/react";

import type { IconProps } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { NttMapWidget } from "@/components/map/ntt-map";

import { SuperAdminManagementPanel } from "@/pages/dashboard/super-admin/management-panel";

import { useAuth } from "@/context/auth-context";

import { useOnlineStatus } from "@/context/online-status-context";

import { superAdminService } from "@/services/super-admin-service";

import { ROUTES } from "@/utils/constants";

type SummaryCard = {
  title: string;
  badge: string;
  badgeVariant: "success" | "warning" | "neutral";
  total: number;
  detail: string;
  progress?: number;
};

const plantConditionBadge: Record<"baik" | "waspada" | "kritikal", { label: string; variant: "success" | "warning" | "neutral" }> = {
  baik: { label: "Baik", variant: "success" },
  waspada: { label: "Waspada", variant: "warning" },
  kritikal: { label: "Kritikal", variant: "warning" },
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

const SuperAdminDashboard = () => {

  const { user, logout } = useAuth();

  const { isOnline } = useOnlineStatus();


  const overviewQuery = useQuery({
    queryKey: ["super-admin", "overview"],
    queryFn: () => superAdminService.overview(),
  });

  const plantReportsQuery = useQuery({
    queryKey: ["super-admin", "plant-reports"],
    queryFn: () => superAdminService.listPlantReports(),
  });

  const summaryCards = useMemo<SummaryCard[]>(() => {
    const data = overviewQuery.data;
    const tasksTotal = data?.totals.tasks ?? 0;
    const tasksPending = data?.pending.tasks ?? 0;
    const recipientsTotal = data?.totals.recipients ?? 0;
    const recipientsPending = data?.pending.recipients ?? 0;
    const plantTotal = data?.totals.plantReports ?? 0;
    const escortTotal = data?.totals.escortRequests ?? 0;
    const escortPending = data?.pending.escortRequests ?? 0;
    const accountTotal = data?.totals.bhabinAccounts ?? 0;

    const calcProgress = (completed: number, total: number) => {
      if (total <= 0) return 0;
      return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
    };

    const plantCoverage = recipientsTotal > 0 ? Math.round(Math.min(plantTotal / recipientsTotal, 1) * 100) : 0;

    return [
      {
        title: "Tugas Lapangan",
        badge: "Operasional",
        badgeVariant: "success",
        total: tasksTotal,
        detail: data ? `${tasksPending} tugas menunggu selesai` : "Memuat data...",
        progress: data ? calcProgress(tasksTotal - tasksPending, tasksTotal) : undefined,
      },
      {
        title: "Verifikasi Penyaluran",
        badge: "Distribusi",
        badgeVariant: "warning",
        total: recipientsTotal,
        detail: data ? `${recipientsPending} penerima menunggu verifikasi` : "Memuat data...",
        progress: data ? calcProgress(recipientsTotal - recipientsPending, recipientsTotal) : undefined,
      },
      {
        title: "Perkembangan Tanaman",
        badge: "Monitoring",
        badgeVariant: "neutral",
        total: plantTotal,
        detail: data ? `${plantTotal} laporan aktif` : "Memuat data...",
        progress: data ? plantCoverage : undefined,
      },
      {
        title: "Permintaan Pengawalan",
        badge: "Kawalan",
        badgeVariant: "warning",
        total: escortTotal,
        detail: data ? `${escortPending} permintaan menunggu penjadwalan` : "Memuat data...",
        progress: data ? calcProgress(escortTotal - escortPending, escortTotal) : undefined,
      },
      {
        title: "Akun Bhabin",
        badge: "SDM",
        badgeVariant: "success",
        total: accountTotal,
        detail: data ? `${accountTotal} akun terdaftar` : "Memuat data...",
      },
    ];
  }, [overviewQuery.data]);

  const latestReports = useMemo(() => {
    const list = plantReportsQuery.data ?? [];
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  }, [plantReportsQuery.data]);


  const operationalShortcuts = useMemo<

    Array<{ label: string; description: string; route: string; Icon: (props: IconProps) => JSX.Element }>

  >(() => [

    {

      label: "Kelola Tugas & Akun Bhabin",

      description: "Tambahkan atau revisi tugas lapangan serta kelola akun Bhabinkamtibmas lintas wilayah.",

      route: ROUTES.adminSpesialis,

      Icon: ClipboardText,

    },

    {

      label: "Verifikasi Penyaluran",

      description: "Validasi penerima bantuan, unggah bukti, dan sinkronkan penyaluran seluruh kabupaten.",

      route: `${ROUTES.bhabinkamtibmas}/verifikasi`,

      Icon: CheckCircle,

    },

    {

      label: "Perkembangan Tanaman",

      description: "Pantau progres budidaya, catatan hama, dan dukungan lapangan dari semua kawasan.",

      route: `${ROUTES.bhabinkamtibmas}/tanaman`,

      Icon: Leaf,

    },

    {

      label: "Verifikasi Hasil Panen",

      description: "Konfirmasi hasil panen, dukung logistik gudang, dan tindak lanjut kebutuhan petani.",

      route: `${ROUTES.bhabinkamtibmas}/panen`,

      Icon: ShieldCheck,

    },

    {

      label: "Permintaan Pengawalan",

      description: "Atur permintaan kawalan panen, distribusi logistik, serta status penjadwalan Polres.",

      route: `${ROUTES.bhabinkamtibmas}/pengawalan`,

      Icon: UsersThree,

    },

  ], []);


  return (

    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-10">

      <header className="flex flex-col gap-4 rounded-3xl border border-biru-pemerintah/30 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-sm text-slate-netral">Selamat datang kembali</p>

          <h1 className="text-3xl font-semibold text-biru-pemerintah">{user?.nama ?? "Super Admin"}</h1>

          <p className="text-sm text-slate-netral">

            Monitor distribusi subsidi seluruh provinsi. Terakhir diperbarui: {new Date().toLocaleString("id-ID")}

          </p>

          <Badge variant={isOnline ? "success" : "warning"} className="mt-3 w-fit">

            {isOnline ? "Terhubung" : "Mode Offline"}

          </Badge>

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <Card key={card.title} className="bg-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{card.title}</CardTitle>
              <Badge variant={card.badgeVariant}>{card.badge}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold text-biru-pemerintah">
                {overviewQuery.isLoading ? "..." : card.total.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-netral">{card.detail}</p>
              {card.progress !== undefined && (
                <Progress value={card.progress} />
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section>

        <Card className="bg-white">

          <CardHeader>

            <CardTitle>Peta Pengawasan NTT</CardTitle>

            <CardDescription>Monitoring seluruh kabupaten beserta status distribusi.</CardDescription>

          </CardHeader>

          <CardContent>

            <NttMapWidget />

          </CardContent>

        </Card>

      </section>

      <section>

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

      <section>

        <Card className="bg-white">

          <CardHeader>

            <CardTitle>Akses Operasional</CardTitle>

            <CardDescription>Kelola seluruh wilayah dan unit kerja dari satu dasbor.</CardDescription>

          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

            {operationalShortcuts.map((shortcut) => (

              <div

                key={shortcut.route}

                className="flex flex-col gap-3 rounded-2xl border border-abu-kartu/80 bg-abu-kartu/20 p-4"

              >

                <div className="flex items-start gap-3">

                  <shortcut.Icon className="mt-1 h-5 w-5 text-biru-pemerintah" weight="bold" />

                  <div className="space-y-1">

                    <p className="text-sm font-semibold text-teks-gelap">{shortcut.label}</p>

                    <p className="text-xs text-slate-netral">{shortcut.description}</p>

                  </div>

                </div>

                <Button asChild size="sm" className="w-full sm:w-auto">

                  <a href={shortcut.route}>Buka modul</a>

                </Button>

              </div>

            ))}

          </CardContent>

        </Card>

      </section>

      <section>

        {/* <SuperAdminManagementPanel /> */}

      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">

        <Card className="bg-white">

          <CardHeader>

            <CardTitle>Laporan Terbaru</CardTitle>

            <CardDescription>Hasil verifikasi lapangan dari petugas</CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            {plantReportsQuery.isLoading ? (
              <p className="text-sm text-slate-netral">Memuat laporan terbaru...</p>
            ) : latestReports.length === 0 ? (
              <p className="text-sm text-slate-netral">Belum ada laporan perkembangan.</p>
            ) : (
              latestReports.map((report) => (
                <div key={report.id} className="flex flex-col gap-2 rounded-2xl border border-abu-kartu p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-netral">
                      <MapPin className="h-4 w-4 text-biru-pemerintah" weight="bold" />
                      <span>{report.lokasi?.alamat ?? report.wilayah}</span>
                    </div>
                    <Badge variant={plantConditionBadge[report.kondisi].variant}>
                      {plantConditionBadge[report.kondisi].label}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-teks-gelap">{report.komoditas}</p>
                  <p className="text-sm text-slate-netral">Update terakhir: {formatDateTime(report.updatedAt)}</p>
                  <p className="text-xs text-slate-netral">Catatan: {report.catatan}</p>
                </div>
              ))
            )}

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

                <p>� 12 admin aktif hari ini</p>

                <p>� 4 petugas lapangan dalam mode offline</p>

                <p>� 7 permintaan akses menunggu persetujuan</p>

              </TabsContent>

            </Tabs>

          </CardContent>

        </Card>

      </section>

    </main>

  );

};

export default SuperAdminDashboard;

