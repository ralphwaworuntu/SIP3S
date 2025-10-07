import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowsClockwise,
  Camera,
  CaretDown,
  CheckCircle,
  FileImage,
  MapPinLine,
  WarningCircle,
} from "@phosphor-icons/react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useCamera } from "@/hooks/use-camera";
import { bhabinService } from "@/services/bhabin-service";
import type { PlantConditionPayload, RecipientVerification } from "@/types/bhabin";

const PLANT_PHASES = [
  "Pembersihan Lahan",
  "Mulai Penanaman",
  "Penyiraman / Pengairan",
  "Penyulaman",
  "Penyiangan",
  "Penggemburan Tanah",
  "Pengendalian Hama dan Penyakit",
  "Pemangkasan",
  "Pemupukan",
] as const;


const plantSchema = z
  .object({
    recipientId: z.string().min(1, "Pilih petani"),
    fase: z.enum(PLANT_PHASES, { errorMap: () => ({ message: "Pilih fase tanam" }) }),
    kondisi: z.enum(["baik", "waspada", "kritikal"]),
    catatan: z.string().min(5, "Jelaskan kondisinya"),
    pupukDigunakanKg: z
      .number({ invalid_type_error: "Masukkan angka" })
      .min(0, "Minimal 0")
      .optional(),
    luasLahanBersihM2: z
      .number({ invalid_type_error: "Masukkan angka" })
      .min(0, "Minimal 0")
      .optional(),
    bibitDitanamKg: z
      .number({ invalid_type_error: "Masukkan angka" })
      .min(0, "Minimal 0")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fase === "Pemupukan") {
      if (data.pupukDigunakanKg === undefined || Number.isNaN(data.pupukDigunakanKg)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pupukDigunakanKg"],
          message: "Isi jumlah pupuk (Kg)",
        });
      }
    }
    if (data.fase === "Pembersihan Lahan") {
      if (data.luasLahanBersihM2 === undefined || Number.isNaN(data.luasLahanBersihM2)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["luasLahanBersihM2"],
          message: "Isi luas lahan (m2)",
        });
      }
    }
    if (data.fase === "Mulai Penanaman") {
      if (data.bibitDitanamKg === undefined || Number.isNaN(data.bibitDitanamKg)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bibitDitanamKg"],
          message: "Isi jumlah bibit (Kg)",
        });
      }
    }
  });

type PlantFormValues = z.infer<typeof plantSchema>;

type FeedbackState = {
  type: "success" | "error" | "info";
  message: string;
};

const badgeVariant: Record<string, "success" | "neutral" | "warning"> = {
  baik: "success",
  waspada: "neutral",
  kritikal: "warning",
};

const dropdownDisplay = (recipient: RecipientVerification | null) => {
  if (!recipient) {
    return "-- pilih petani --";
  }
  return `${recipient.nama} â€¢ ${recipient.komoditas} â€¢ ${recipient.wilayah}`;
};

const formatDateTime = (iso: string) => new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

const PlantProgressPage = () => {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lokasi = useGeolocation();
  const camera = useCamera();

  const recipientsQuery = useQuery({
    queryKey: ["bhabin", "recipients"],
    queryFn: () => bhabinService.listRecipients(),
  });

  const recipients = useMemo(() => recipientsQuery.data ?? [], [recipientsQuery.data]);
  const pendingRecipients = useMemo(() => recipients.filter((item) => item.status !== "rejected"), [recipients]);
  const filteredRecipients = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return pendingRecipients;
    return pendingRecipients.filter((item) => {
      const combined = `${item.nama} ${item.nik} ${item.komoditas} ${item.wilayah}`.toLowerCase();
      return combined.includes(keyword);
    });
  }, [pendingRecipients, searchTerm]);

  const form = useForm<PlantFormValues>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      recipientId: "",
      fase: "Pembersihan Lahan",
      kondisi: "baik",
      catatan: "",
      pupukDigunakanKg: undefined,
      luasLahanBersihM2: undefined,
      bibitDitanamKg: undefined,
    },
  });

  const recipientId = form.watch("recipientId");
  const fase = form.watch("fase");
  const selectedRecipient = useMemo(
    () => recipients.find((item) => item.id === recipientId) ?? null,
    [recipientId, recipients]
  );

  useEffect(() => {
    if (!isDropdownOpen) {
      setSearchTerm("");
      return;
    }
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen) {
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isDropdownOpen]);

  useEffect(() => {
    if (fase !== "Pemupukan") {
      form.resetField("pupukDigunakanKg", { defaultValue: undefined });
    }
    if (fase !== "Pembersihan Lahan") {
      form.resetField("luasLahanBersihM2", { defaultValue: undefined });
    }
    if (fase !== "Mulai Penanaman") {
      form.resetField("bibitDitanamKg", { defaultValue: undefined });
    }
  }, [fase, form]);

  const handleRecipientSelect = (recipient: RecipientVerification) => {
    form.setValue("recipientId", recipient.id, { shouldValidate: true, shouldDirty: true });
    form.clearErrors("recipientId");
    setDropdownOpen(false);
  };

  const query = useQuery({
    queryKey: ["bhabin", "plant"],
    queryFn: () => bhabinService.listPlantProgress(),
  });

  const mutation = useMutation({
    mutationFn: (payload: PlantConditionPayload & { reporter: string }) =>
      bhabinService.submitPlantProgress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bhabin", "plant"] });
      setFeedback({ type: "success", message: "Perkembangan tanaman tersimpan." });
      form.reset({ recipientId: "", fase: "Pembersihan Lahan", kondisi: "baik", catatan: "", pupukDigunakanKg: undefined, luasLahanBersihM2: undefined, bibitDitanamKg: undefined });
      camera.restart();
    },
    onError: () => setFeedback({ type: "error", message: "Gagal menyimpan perkembangan tanaman." }),
  });

  const handleSubmit = (values: PlantFormValues) => {
    if (!selectedRecipient) {
      setFeedback({ type: "error", message: "Pilih petani terlebih dahulu." });
      setDropdownOpen(true);
      return;
    }
    if (!lokasi.latitude || !lokasi.longitude) {
      setFeedback({ type: "error", message: "GPS belum siap. Tekan segarkan dan pastikan izin lokasi aktif." });
      return;
    }
    if (!camera.preview) {
      setFeedback({ type: "error", message: "Ambil foto kondisi tanaman terlebih dahulu." });
      return;
    }
    setFeedback(null);
    const payload: PlantConditionPayload & { reporter: string } = {
      wilayah: selectedRecipient.wilayah,
      petani: selectedRecipient.nama,
      komoditas: selectedRecipient.komoditas,
      fase: values.fase,
      kondisi: values.kondisi,
      catatan: values.catatan,
      lokasi: {
        latitude: lokasi.latitude,
        longitude: lokasi.longitude,
        alamat: lokasi.alamat,
      },
      fotoEvidence: camera.preview,
      pupukDigunakanKg: values.fase === "Pemupukan" ? values.pupukDigunakanKg : undefined,
      luasLahanBersihM2: values.fase === "Pembersihan Lahan" ? values.luasLahanBersihM2 : undefined,
      bibitDitanamKg: values.fase === "Mulai Penanaman" ? values.bibitDitanamKg : undefined,
      reporter: "bhabin",
    };
    mutation.mutate(payload);
  };

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Input perkembangan tanaman</CardTitle>
          <CardDescription>Laporkan kondisi tanaman untuk koordinasi cepat dengan PPL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-netral">
          {feedback && (
            <Alert variant={feedback.type === "success" ? "success" : feedback.type === "error" ? "error" : "info"}>
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle className="h-5 w-5" weight="bold" />
                ) : (
                  <WarningCircle className="h-5 w-5" weight="bold" />
                )}
                <span>{feedback.message}</span>
              </div>
            </Alert>
          )}

          <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col gap-2">
              <span>Pilih petani penerima</span>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-abu-kartu px-3 py-2 text-left text-sm text-teks-gelap hover:border-biru-pemerintah/60"
                  onClick={() => pendingRecipients.length > 0 && setDropdownOpen((prev) => !prev)}
                  disabled={pendingRecipients.length === 0}
                >
                  <span className={selectedRecipient ? "" : "text-slate-netral"}>{dropdownDisplay(selectedRecipient)}</span>
                  <CaretDown className="ml-2 h-4 w-4 text-slate-netral" weight="bold" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-30 mt-2 w-full rounded-2xl border border-abu-kartu bg-white p-3 shadow-xl">
                    <input
                      ref={searchInputRef}
                      type="search"
                      className="w-full rounded-2xl border border-abu-kartu px-3 py-2 text-sm"
                      placeholder="Cari nama, NIK, komoditas, atau wilayah"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    <div className="mt-2 max-h-60 overflow-y-auto">
                      {filteredRecipients.length > 0 ? (
                        filteredRecipients.map((petani) => {
                          const isSelected = petani.id === recipientId;
                          return (
                            <button
                              type="button"
                              key={petani.id}
                              className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left text-sm transition hover:bg-biru-pemerintah/10 ${
                                isSelected ? "bg-biru-pemerintah/10 text-biru-pemerintah" : "text-teks-gelap"
                              }`}
                              onClick={() => handleRecipientSelect(petani)}
                            >
                              <span className="font-medium">{petani.nama}</span>
                              <span className="text-xs text-slate-netral">
                                {petani.nik} â€¢ {petani.komoditas} â€¢ {petani.wilayah}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-2 py-4 text-center text-sm text-slate-netral">Tidak ditemukan data sesuai pencarian.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {pendingRecipients.length === 0 && <span className="text-xs text-slate-netral">Belum ada data penerima.</span>}
              {form.formState.errors.recipientId && (
                <span className="text-xs text-oranye-hangat">{form.formState.errors.recipientId.message}</span>
              )}
            </div>

            {selectedRecipient && (
              <div className="rounded-2xl border border-abu-kartu bg-white p-3 text-xs text-slate-netral">
                <p className="text-sm font-semibold text-teks-gelap">{selectedRecipient.nama}</p>
                <p>NIK: {selectedRecipient.nik}</p>
                <p>Kelompok: {selectedRecipient.kelompok}</p>
                <p>Komoditas: {selectedRecipient.komoditas}</p>
                <p>Wilayah: {selectedRecipient.wilayah}</p>
                <p>Jadwal distribusi: {formatDateTime(selectedRecipient.jadwalDistribusi)}</p>
              </div>
            )}

            <label className="flex flex-col gap-1">
              Fase tanam
              <select className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("fase")}>
                {PLANT_PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </label>
            {fase === "Pemupukan" && (
              <label className="flex flex-col gap-1">
                Jumlah pupuk yang digunakan (Kg)
                <input
                  type="number"
                  step="0.1"
                  className="rounded-2xl border border-abu-kartu px-3 py-2"
                  placeholder="Contoh: 50"
                  {...form.register("pupukDigunakanKg", { valueAsNumber: true })}
                />
                {form.formState.errors.pupukDigunakanKg && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.pupukDigunakanKg.message}</span>
                )}
              </label>
            )}
            {fase === "Pembersihan Lahan" && (
              <label className="flex flex-col gap-1">
                Jumlah luas lahan yang dibersihkan (m2)
                <input
                  type="number"
                  step="0.1"
                  className="rounded-2xl border border-abu-kartu px-3 py-2"
                  placeholder="Contoh: 500"
                  {...form.register("luasLahanBersihM2", { valueAsNumber: true })}
                />
                {form.formState.errors.luasLahanBersihM2 && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.luasLahanBersihM2.message}</span>
                )}
              </label>
            )}
            {fase === "Mulai Penanaman" && (
              <label className="flex flex-col gap-1">
                Jumlah bibit yang ditanam (Kg)
                <input
                  type="number"
                  step="0.1"
                  className="rounded-2xl border border-abu-kartu px-3 py-2"
                  placeholder="Contoh: 30"
                  {...form.register("bibitDitanamKg", { valueAsNumber: true })}
                />
                {form.formState.errors.bibitDitanamKg && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.bibitDitanamKg.message}</span>
                )}
              </label>
            )}
            <label className="flex flex-col gap-1">
              Kondisi
              <select className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("kondisi")}>
                <option value="baik">Baik</option>
                <option value="waspada">Perlu perhatian</option>
                <option value="kritikal">Butuh tindak lanjut</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Catatan lapangan
              <textarea className="rounded-2xl border border-abu-kartu px-3 py-2" rows={3} {...form.register("catatan")} />
              {form.formState.errors.catatan && <span className="text-xs text-oranye-hangat">{form.formState.errors.catatan.message}</span>}
            </label>

            <div className="space-y-2 rounded-2xl border border-abu-kartu p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-teks-gelap">Koordinat lokasi</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={lokasi.refresh}
                  disabled={lokasi.isLoading}
                  className="inline-flex items-center gap-1"
                >
                  <ArrowsClockwise className={`h-4 w-4 ${lokasi.isLoading ? "animate-spin" : ""}`} weight="bold" />
                  <span>{lokasi.isLoading ? "Memuat" : "Segarkan"}</span>
                </Button>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-netral">
                <MapPinLine className="mt-0.5 h-4 w-4" weight="bold" />
                <div>
                  {lokasi.latitude && lokasi.longitude ? (
                    <>
                      <p>{lokasi.alamat}</p>
                      <p>
                        Lat {lokasi.latitude.toFixed(4)} | Long {lokasi.longitude.toFixed(4)}
                      </p>
                    </>
                  ) : lokasi.isLoading ? (
                    <p>Mengambil lokasi terkini...</p>
                  ) : (
                    <p>Lokasi belum tersedia. Pastikan izin GPS aktif lalu tekan segarkan.</p>
                  )}
                  {lokasi.error && <p className="text-oranye-hangat">{lokasi.error}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-abu-kartu p-3">
              <p className="text-sm font-medium text-teks-gelap">Dokumentasi kondisi tanaman</p>
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
                  <img src={camera.preview} alt="Dokumentasi tanaman" className="h-56 w-full rounded-2xl object-cover" />
                  <Button type="button" variant="outline" onClick={camera.restart}>
                    <FileImage className="mr-2 h-5 w-5" weight="bold" /> Ambil Ulang
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Kirim laporan"}
            </Button>
            <Alert variant="info" className="text-xs">
              Data disimpan otomatis meski offline dan akan tersinkron ketika koneksi kembali.
            </Alert>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Riwayat perkembangan</CardTitle>
          <CardDescription>Data terbaru dari lapangan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-netral">
          {(query.data ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-abu-kartu p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-teks-gelap">{item.petani}</span>
                <Badge variant={badgeVariant[item.kondisi]}>{item.kondisi.toUpperCase()}</Badge>
              </div>
              <p>Wilayah: {item.wilayah}</p>
              <p>Komoditas: {item.komoditas}</p>
              <p>Fase: {item.fase}</p>
              <p>Catatan: {item.catatan}</p>
              <p>Update: {formatDateTime(item.updatedAt)}</p>
              {item.lokasi && (
                <p>
                  Lokasi: Lat {item.lokasi.latitude.toFixed(4)} | Long {item.lokasi.longitude.toFixed(4)}
                </p>
              )}
              {item.fotoEvidence && (
                <img src={item.fotoEvidence} alt={`Dokumentasi ${item.petani}`} className="mt-2 h-32 w-full rounded-2xl object-cover" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default PlantProgressPage;


















