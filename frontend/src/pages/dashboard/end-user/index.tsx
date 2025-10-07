import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowsClockwise, Camera, CircleWavyCheckIcon, FileImage, Info, SignOut, WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import { reportService, type LaporanLapangan } from "@/services/report-service";
import { taskService } from "@/services/task-service";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useCamera } from "@/hooks/use-camera";
import type { Task } from "@/types/task";

const schema = z.object({
  komoditas: z.string().min(2, "Wajib diisi"),
  kuotaTersalurkan: z.number().min(0, "Wajib diisi").max(10000, "Maksimal 10.000 Kg"),
  catatan: z.string().min(5, "Jelaskan temuan di lapangan"),
});

const unitsLabel = "Kg";

type FormValues = z.infer<typeof schema>;

type FieldOfficerRole = "end-user" | "bhabinkamtibmas" | "ppl";

interface FeedbackState {
  type: "success" | "info" | "error";
  message: string;
}

const iconMap: Record<FeedbackState["type"], JSX.Element> = {
  success: <CircleWavyCheckIcon className="h-5 w-5" weight="bold" />,
  info: <Info className="h-5 w-5" weight="bold" />,
  error: <WarningCircle className="h-5 w-5" weight="bold" />,
};

const roleCopy: Record<FieldOfficerRole, { title: string; subtitle: string; heroHighlight: string }> = {
  "end-user": {
    title: "Petugas Lapangan",
    subtitle: "Semua data disimpan otomatis walau tanpa koneksi.",
    heroHighlight: "Petugas Lapangan",
  },
  bhabinkamtibmas: {
    title: "Bhabinkamtibmas",
    subtitle: "Catat kondisi keamanan distribusi dan koordinasikan dengan PPL.",
    heroHighlight: "Bhabinkamtibmas",
  },
  ppl: {
    title: "Penyuluh Pertanian Lapangan",
    subtitle: "Laporkan perkembangan distribusi dan dukung petani di wilayah kerja Anda.",
    heroHighlight: "Penyuluh Pertanian Lapangan",
  },
};

const EndUserDashboard = () => {
  const { user, logout } = useAuth();
  const fieldRole = (user?.role ?? "end-user") as FieldOfficerRole;
  const roleDetails = roleCopy[fieldRole];
  const counterpartRole: FieldOfficerRole | null =
    fieldRole === "bhabinkamtibmas" ? "ppl" : fieldRole === "ppl" ? "bhabinkamtibmas" : null;
  const { isOnline } = useOnlineStatus();
  const lokasi = useGeolocation();
  const camera = useCamera();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["tasks", "assigned"], queryFn: () => taskService.list() });

  const assignedTasks = useMemo(() => {
    if (!user?.email) return tasks;
    return tasks.filter((task) => task.assignedTo.includes(user.email));
  }, [tasks, user?.email]);

  const collaborativeTasks = useMemo(
    () => assignedTasks.filter((task) => task.assignedTo.length > 1),
    [assignedTasks]
  );

  const personalTasks = useMemo(
    () => assignedTasks.filter((task) => task.assignedTo.length === 1),
    [assignedTasks]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      komoditas: "",
      kuotaTersalurkan: 0,
      catatan: "",
    },
  });

  const laporanMutation = useMutation({
    mutationFn: reportService.kirimLaporan,
    onSuccess: (response: LaporanLapangan) => {
      form.reset();
      camera.restart();
      if (response.status === "pending") {
        setFeedback({
          type: "info",
          message: "Laporan tersimpan offline dan akan tersinkron otomatis ketika koneksi kembali.",
        });
      } else {
        setFeedback({ type: "success", message: "Laporan berhasil dikirim ke server." });
      }
    },
    onError: () => {
      setFeedback({ type: "error", message: "Gagal mengirim laporan. Periksa koneksi atau coba ulang." });
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFeedback(null);
    if (!lokasi.latitude || !lokasi.longitude) {
      form.setError("catatan", { message: "GPS belum siap. Aktifkan lokasi." });
      return;
    }
    if (!camera.preview) {
      form.setError("catatan", { message: "Ambil foto lapangan terlebih dahulu." });
      return;
    }

    await laporanMutation.mutateAsync({
      komoditas: values.komoditas,
      kuotaTersalurkan: values.kuotaTersalurkan,
      catatan: values.catatan,
      fotoUrl: camera.preview,
      authorId: user?.email ?? "",
      lokasi: {
        latitude: lokasi.latitude,
        longitude: lokasi.longitude,
        alamat: lokasi.alamat,
      },
    });
  };

  useEffect(() => {
    if (!isOnline) return;
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage("force-sync");
    }
  }, [isOnline]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      {feedback && (
        <Alert
          variant={feedback.type === "error" ? "error" : feedback.type === "info" ? "info" : "success"}
          className="flex items-center gap-3 text-sm"
        >
          {iconMap[feedback.type]}
          <span>{feedback.message}</span>
        </Alert>
      )}

      <header className="rounded-3xl border border-hijau-hutan/30 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-netral">{roleDetails.title}</p>
            <h1 className="text-2xl font-semibold text-hijau-hutan">{user?.nama ?? roleDetails.heroHighlight}</h1>
            <p className="text-xs text-slate-netral">{roleDetails.subtitle}</p>
            {counterpartRole && (
              <p className="mt-2 text-xs text-slate-netral">
                Kolaborasi dengan {roleCopy[counterpartRole].heroHighlight} memastikan distribusi aman dan tepat sasaran.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? "success" : "warning"}>{isOnline ? "Online" : "Offline"}</Badge>
            <Button variant="outline" onClick={logout}>
              <SignOut className="mr-2 h-4 w-4" weight="bold" /> Keluar
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Input Laporan Lapangan</CardTitle>
            <CardDescription>Pastikan foto diambil langsung dari lokasi.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <label className="flex flex-col gap-2 text-sm text-teks-gelap">
                Komoditas
                <input
                  className="rounded-2xl border border-abu-kartu px-3 py-2"
                  placeholder="Contoh: Pupuk Urea"
                  {...form.register("komoditas")}
                />
                {form.formState.errors.komoditas && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.komoditas.message}</span>
                )}
              </label>
              <label className="flex flex-col gap-2 text-sm text-teks-gelap">
                Kuota tersalurkan ({unitsLabel})
                <input
                  type="number"
                  min="0"
                  className="rounded-2xl border border-abu-kartu px-3 py-2"
                  {...form.register("kuotaTersalurkan", { valueAsNumber: true })}
                />
                <span className="text-xs text-slate-netral">Masukkan jumlah penyaluran dalam kilogram.</span>
                {form.formState.errors.kuotaTersalurkan && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.kuotaTersalurkan.message}</span>
                )}
              </label>
              <label className="flex flex-col gap-2 text-sm text-teks-gelap">
                Catatan lapangan
                <textarea
                  rows={3}
                  className="rounded-2xl border border-abu-kartu px-3 py-2"
                  placeholder="Tuliskan kondisi distribusi atau kendala"
                  {...form.register("catatan")}
                />
                {form.formState.errors.catatan && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.catatan.message}</span>
                )}
              </label>

              <div className="space-y-2 rounded-2xl border border-abu-kartu p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-teks-gelap">Lokasi</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={lokasi.refresh}
                    disabled={lokasi.isLoading}
                    className="inline-flex items-center gap-1"
                  >
                    <ArrowsClockwise
                      className={`h-4 w-4 ${lokasi.isLoading ? "animate-spin" : ""}`}
                      weight="bold"
                    />
                    <span>{lokasi.isLoading ? "Memuat" : "Segarkan"}</span>
                  </Button>
                </div>
                <p className="text-xs text-slate-netral">
                  {lokasi.latitude && lokasi.longitude
                    ? lokasi.alamat
                    : lokasi.isLoading
                      ? "Mengambil koordinat..."
                      : "Lokasi belum tersedia. Tekan segarkan untuk mencoba kembali."}
                </p>
                {lokasi.error && <p className="text-xs text-oranye-hangat">GPS: {lokasi.error}</p>}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-teks-gelap">Foto Lapangan</p>
                {camera.streamError && <Alert variant="warning">{camera.streamError}</Alert>}
                {!camera.preview ? (
                  <div className="space-y-3">
                    <video ref={camera.videoRef} autoPlay playsInline className="h-56 w-full rounded-2xl bg-black/60 object-cover" />
                    <canvas ref={camera.canvasRef} className="hidden" />
                    <Button type="button" className="w-full" onClick={camera.capturePhoto}>
                      <Camera className="mr-2 h-5 w-5" weight="bold" /> Ambil Foto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <img
                      src={camera.preview}
                      alt="Hasil foto lapangan"
                      className="h-56 w-full rounded-2xl object-cover"
                    />
                    <Button type="button" variant="outline" onClick={camera.restart}>
                      <FileImage className="mr-2 h-5 w-5" weight="bold" /> Ambil Ulang
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={laporanMutation.isPending}>
                {laporanMutation.isPending ? "Menyimpan..." : "Kirim Laporan"}
              </Button>
              <Alert variant="info" className="text-xs">
                {isOnline ? "Laporan akan langsung dikirim ke server." : "Anda offline. Data disimpan dan akan tersinkron otomatis."}
              </Alert>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Tugas Anda</CardTitle>
              <CardDescription>Disusun oleh Admin Spesialis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-netral">
              {assignedTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-abu-kartu p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-teks-gelap">{task.title}</span>
                    <Badge variant={task.status === "selesai" ? "success" : "warning"}>{task.status}</Badge>
                  </div>
                  <p>{task.description}</p>
                  <p className="text-xs">Wilayah: {task.region} • Batas {new Date(task.dueDate).toLocaleDateString("id-ID")}</p>
                  {task.assignedTo.length > 1 && counterpartRole && (
                    <p className="text-xs text-biru-pemerintah">Koordinasi dengan {roleCopy[counterpartRole].heroHighlight}</p>
                  )}
                </div>
              ))}
              {assignedTasks.length === 0 && <p>Tidak ada tugas aktif.</p>}
            </CardContent>
          </Card>

          {counterpartRole && (
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle>Kolaborasi Lapangan</CardTitle>
                <CardDescription>Perbarui progres bersama {roleCopy[counterpartRole].heroHighlight}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-netral">
                {collaborativeTasks.length > 0 ? (
                  collaborativeTasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-abu-kartu/70 p-3">
                      <p className="font-medium text-teks-gelap">{task.title}</p>
                      <p className="text-xs text-slate-netral">Progres terakhir: {new Date(task.updatedAt).toLocaleString("id-ID")}</p>
                    </div>
                  ))
                ) : (
                  <p>Belum ada tugas gabungan aktif. Terus sinkronkan temuan di lapangan.</p>
                )}
                {personalTasks.length > 0 && (
                  <Alert variant="info" className="text-xs">
                    Catat hal kritis dari tugas mandiri untuk dibagikan kepada {roleCopy[counterpartRole].heroHighlight}.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
};

export default EndUserDashboard;
