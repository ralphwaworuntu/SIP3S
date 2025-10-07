import { type ChangeEvent, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  CloudArrowUp,
  DownloadSimple,
  FileArrowUp,
  ListMagnifyingGlass,
  MapPin,
  SignOut,
  WarningCircle,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import { pplUploadService } from "@/services/ppl-upload-service";
import type { PplAssignment, PplUploadCategory, PplUploadRecord } from "@/types/ppl";

const uploadOptions: Record<PplUploadCategory, { title: string; description: string; template: string; accept: string; note: string }> = {
  simluhtan: {
    title: "Unggah Data Petani SIMLUHTAN",
    description:
      "Gunakan format CSV sesuai template agar data petani, kelompok, dan lahan dapat diproses otomatis.",
    template: "/templates/simluhtan-template.csv",
    accept: ".csv,.xlsx,.xls",
    note: "Pastikan data sudah diverifikasi dengan dinas dan tidak ada baris kosong di tengah file.",
  },
  erdkk: {
    title: "Unggah Data E-RDKK",
    description: "Import rencana kebutuhan pupuk bersubsidi per petani. Sistem akan memvalidasi NIK dan luas tanam.",
    template: "/templates/erdkk-template.csv",
    accept: ".csv,.xlsx,.xls,.pdf",
    note: "Bila mengunggah PDF/Excel, Admin Spesialis akan membantu proses konversi ke format SIP3S.",
  },
};

const statusVariant: Record<PplUploadRecord["status"], { badge: "success" | "warning" | "neutral"; label: string }> = {
  selesai: { badge: "success", label: "Selesai" },
  "tersimpan-offline": { badge: "warning", label: "Tersimpan Offline" },
  diproses: { badge: "neutral", label: "Sedang Diproses" },
  gagal: { badge: "warning", label: "Gagal" },
};

interface FeedbackState {
  type: "success" | "error" | "info";
  message: string;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const PplDashboard = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOnlineStatus();
  const queryClient = useQueryClient();

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [activeCategory, setActiveCategory] = useState<PplUploadCategory | null>(null);

  const fileInputRefs: Record<PplUploadCategory, RefObject<HTMLInputElement>> = {
    simluhtan: useRef<HTMLInputElement>(null),
    erdkk: useRef<HTMLInputElement>(null),
  };

  const assignmentsQuery = useQuery({
    queryKey: ["ppl-assignments", user?.email],
    queryFn: () => pplUploadService.listAssignments(user?.email),
    enabled: Boolean(user?.email),
  });

  const uploadsQuery = useQuery({
    queryKey: ["ppl-uploads", user?.email],
    queryFn: () => pplUploadService.listUploads(user?.email),
    enabled: Boolean(user?.email),
  });

  useEffect(() => {
    if (!selectedAssignmentId && assignmentsQuery.data && assignmentsQuery.data.length > 0) {
      setSelectedAssignmentId(assignmentsQuery.data[0].id);
    }
  }, [assignmentsQuery.data, selectedAssignmentId]);

  const selectedAssignment: PplAssignment | undefined = useMemo(() => {
    return assignmentsQuery.data?.find((assignment) => assignment.id === selectedAssignmentId) ?? undefined;
  }, [assignmentsQuery.data, selectedAssignmentId]);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File; category: PplUploadCategory }) => {
      if (!user?.email) {
        throw new Error("Sesi tidak valid. Silakan login ulang.");
      }
      if (!selectedAssignment) {
        throw new Error("Pilih wilayah kerja terlebih dahulu.");
      }
      return pplUploadService.upload({
        file,
        type: category,
        assignment: selectedAssignment,
        uploader: user.email,
      });
    },
    onMutate: ({ category }) => {
      setActiveCategory(category);
      setFeedback(null);
    },
    onSuccess: (record) => {
      setFeedback({
        type: "success",
        message: `Berkas ${record.filename} siap diproses. Status: ${statusVariant[record.status].label}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["ppl-uploads", user?.email] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Upload gagal. Coba ulangi.";
      setFeedback({ type: "error", message });
    },
    onSettled: () => {
      setActiveCategory(null);
    },
  });

  const handleSelectFile = (category: PplUploadCategory) => {
    fileInputRefs[category].current?.click();
  };

  const handleFileChange = async (category: PplUploadCategory, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadMutation.mutateAsync({ file, category });
    event.target.value = "";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
      {feedback && (
        <Alert
          variant={feedback.type === "error" ? "error" : feedback.type === "success" ? "success" : "info"}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="h-5 w-5" weight="bold" />
            ) : feedback.type === "error" ? (
              <WarningCircle className="h-5 w-5" weight="bold" />
            ) : (
              <ListMagnifyingGlass className="h-5 w-5" weight="bold" />
            )}
            <span>{feedback.message}</span>
          </div>
        </Alert>
      )}

      <header className="rounded-3xl border border-hijau-hutan/30 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-netral">Penyuluh Pertanian Lapangan</p>
            <h1 className="text-2xl font-semibold text-hijau-hutan">{user?.nama ?? "PPL"}</h1>
            <p className="text-xs text-slate-netral">
              Unggah data resmi dari Dinas Pertanian untuk disinkronkan dengan Bhabinkamtibmas di wilayah tugas Anda.
            </p>
            {selectedAssignment && (
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-netral">
                <MapPin className="h-4 w-4 text-biru-pemerintah" weight="bold" />
                <span>
                  {selectedAssignment.wilayahName} · Kecamatan {selectedAssignment.kecamatan}
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={isOnline ? "success" : "warning"}>{isOnline ? "Online" : "Offline"}</Badge>
            <Button variant="outline" onClick={logout}>
              <SignOut className="mr-2 h-4 w-4" weight="bold" /> Keluar
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-netral">
          <label className="flex flex-col gap-1">
            Wilayah kerja aktif
            <select
              value={selectedAssignmentId ?? ""}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              className="w-full rounded-2xl border border-abu-kartu px-3 py-2 text-sm"
            >
              {assignmentsQuery.data?.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.wilayahName} · Kecamatan {assignment.kecamatan}
                </option>
              ))}
            </select>
          </label>
          {assignmentsQuery.isLoading && <span className="text-xs text-slate-netral">Memuat wilayah tugas...</span>}
          {assignmentsQuery.data?.length === 0 && !assignmentsQuery.isLoading && (
            <span className="text-xs text-oranye-hangat">
              Belum ada wilayah terdaftar. Hubungi Admin Spesialis untuk mendapatkan assignment.
            </span>
          )}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        {(Object.keys(uploadOptions) as PplUploadCategory[]).map((category) => {
          const option = uploadOptions[category];
          const isUploading = uploadMutation.isPending && activeCategory === category;
          return (
            <Card key={category} className="bg-white">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                  <Badge variant="neutral">CSV / Excel{category === "erdkk" ? " / PDF" : ""}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(option.template, "_blank")}
                  >
                    <DownloadSimple className="h-4 w-4" weight="bold" /> Unduh Template
                  </Button>
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => handleSelectFile(category)}
                    disabled={isUploading || !selectedAssignment}
                  >
                    <CloudArrowUp className="h-4 w-4" weight="bold" />
                    {isUploading ? "Mengunggah..." : "Pilih Berkas"}
                  </Button>
                </div>
                <input
                  ref={fileInputRefs[category]}
                  type="file"
                  accept={option.accept}
                  className="hidden"
                  onChange={(event) => handleFileChange(category, event)}
                />
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-netral">
                <div className="rounded-2xl border border-dashed border-abu-kartu p-4 text-center">
                  <FileArrowUp className="mx-auto mb-2 h-8 w-8 text-biru-pemerintah" weight="bold" />
                  <p className="font-medium text-teks-gelap">
                    {selectedAssignment
                      ? `Unggah untuk ${selectedAssignment.wilayahName}`
                      : "Pilih wilayah tugas terlebih dahulu"}
                  </p>
                  <p className="text-xs">{option.note}</p>
                  {isUploading && <p className="mt-2 text-xs text-biru-pemerintah">Memproses berkas...</p>}
                </div>
                <ul className="list-disc space-y-1 pl-4 text-xs">
                  <li>Gunakan nama file yang mencantumkan kecamatan, desa, dan periode (contoh: erdkk_nekamese_2025.csv).</li>
                  <li>Periksa kembali jumlah baris dan validitas NIK sebelum mengunggah.</li>
                  <li>Sistem akan mengirim notifikasi ke Bhabinkamtibmas yang bertugas di wilayah yang sama.</li>
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="bg-white">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Riwayat Unggahan</CardTitle>
            <CardDescription>Monitor status sinkronisasi data SIMLUHTAN dan E-RDKK.</CardDescription>
          </div>
          <Badge variant="neutral">Terurut terbaru</Badge>
        </CardHeader>
        <CardContent>
          {uploadsQuery.isLoading ? (
            <p className="text-sm text-slate-netral">Memuat riwayat...</p>
          ) : uploadsQuery.data && uploadsQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-netral">
                <thead>
                  <tr className="text-xs uppercase text-slate-netral/80">
                    <th className="py-2 pr-4">Berkas</th>
                    <th className="py-2 pr-4">Wilayah</th>
                    <th className="py-2 pr-4">Jenis</th>
                    <th className="py-2 pr-4">Total Baris</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Diunggah</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadsQuery.data.map((record) => (
                    <tr key={record.id} className="border-t border-abu-kartu/60">
                      <td className="py-3 pr-4 font-medium text-teks-gelap">{record.filename}</td>
                      <td className="py-3 pr-4">
                        <span className="block text-xs uppercase text-slate-netral/70">{record.wilayahId}</span>
                        {record.wilayahName}
                      </td>
                      <td className="py-3 pr-4 capitalize">{record.type}</td>
                      <td className="py-3 pr-4">{record.totalRecords ?? "-"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant[record.status].badge}>
                          {statusVariant[record.status].label}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs">{formatDateTime(record.uploadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-netral">Belum ada berkas yang diunggah.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default PplDashboard;


