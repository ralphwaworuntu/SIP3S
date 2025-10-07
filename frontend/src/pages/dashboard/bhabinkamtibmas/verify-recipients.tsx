import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowsClockwise,
  Camera,
  CaretDown,
  CheckCircle,
  FileImage,
  MapPinLine,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useCamera } from "@/hooks/use-camera";
import { bhabinService } from "@/services/bhabin-service";
import type { GeoPoint, RecipientVerification } from "@/types/bhabin";

const verifySchema = z
  .object({
    recipientId: z.string().min(1, "Pilih petani"),
    productType: z.enum(["benih", "pupuk"], { errorMap: () => ({ message: "Pilih jenis produk" }) }),
    seedType: z.string().optional(),
    seedQuantityKg: z
      .number({ invalid_type_error: "Masukkan angka" })
      .min(0, "Minimal 0 Kg")
      .optional(),
    pupukNpkKg: z
      .number({ invalid_type_error: "Masukkan angka" })
      .min(0, "Minimal 0 Kg")
      .optional(),
    pupukUreaKg: z
      .number({ invalid_type_error: "Masukkan angka" })
      .min(0, "Minimal 0 Kg")
      .optional(),
    notes: z.string().max(280, "Maksimal 280 karakter").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.productType === "benih") {
      if (!data.seedType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["seedType"], message: "Pilih jenis benih" });
      }
      if (data.seedQuantityKg === undefined || Number.isNaN(data.seedQuantityKg)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["seedQuantityKg"], message: "Isi jumlah benih (Kg)" });
      }
    }
    if (data.productType === "pupuk") {
      if (data.pupukNpkKg === undefined || Number.isNaN(data.pupukNpkKg)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pupukNpkKg"], message: "Isi jumlah pupuk NPK" });
      }
      if (data.pupukUreaKg === undefined || Number.isNaN(data.pupukUreaKg)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pupukUreaKg"], message: "Isi jumlah pupuk Urea" });
      }
    }
  });

type VerifyFormValues = z.infer<typeof verifySchema>;

interface FeedbackState {
  type: "success" | "error" | "info";
  message: string;
}

const statusBadge: Record<RecipientVerification["status"], { label: string; variant: "success" | "warning" | "neutral" }> = {
  pending: { label: "Menunggu", variant: "warning" },
  verified: { label: "Terverifikasi", variant: "success" },
  rejected: { label: "Ditolak", variant: "warning" },
};

const formatDateTime = (iso: string | undefined) =>
  iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";

const dropdownDisplay = (recipient: RecipientVerification | null) => {
  if (!recipient) {
    return "-- pilih petani --";
  }
  return `${recipient.nama} • ${recipient.komoditas} • ${recipient.wilayah}`;
};

const VerifyRecipientsPage = () => {
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
  const pending = useMemo(() => recipients.filter((item) => item.status === "pending"), [recipients]);
  const filteredPending = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return pending;
    return pending.filter((item) => {
      const combined = `${item.nama} ${item.nik} ${item.komoditas} ${item.wilayah}`.toLowerCase();
      return combined.includes(keyword);
    });
  }, [pending, searchTerm]);

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      recipientId: "",
      productType: "benih",
      seedType: "",
      seedQuantityKg: undefined,
      pupukNpkKg: undefined,
      pupukUreaKg: undefined,
      notes: "",
    },
  });

  const recipientId = form.watch("recipientId");
  const selectedProduct = form.watch("productType");
  const selectedSeed = form.watch("seedType");
  const selectedRecipient = useMemo(
    () => recipients.find((item) => item.id === recipientId) ?? null,
    [recipientId, recipients]
  );

  const verifyMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      notes?: string;
      lokasi: GeoPoint;
      fotoEvidence: string;
      productType: VerifyFormValues["productType"];
      seedType?: string;
      seedQuantityKg?: number;
      pupukNpkKg?: number;
      pupukUreaKg?: number;
    }) => bhabinService.verifyRecipient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bhabin", "recipients"] });
      setFeedback({ type: "success", message: "Petani berhasil diverifikasi." });
      form.reset({
        recipientId: "",
        productType: "benih",
        seedType: "",
        seedQuantityKg: undefined,
        pupukNpkKg: undefined,
        pupukUreaKg: undefined,
        notes: "",
      });
      camera.restart();
      setDropdownOpen(false);
    },
    onError: () => setFeedback({ type: "error", message: "Gagal memverifikasi. Coba ulangi." }),
  });

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
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen) {
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isDropdownOpen]);

  useEffect(() => {
    if (selectedProduct === "benih") {
      form.resetField("pupukNpkKg", { defaultValue: undefined });
      form.resetField("pupukUreaKg", { defaultValue: undefined });
    } else {
      form.resetField("seedType", { defaultValue: "" });
      form.resetField("seedQuantityKg", { defaultValue: undefined });
    }
  }, [selectedProduct, form]);

  const handleRecipientSelect = (recipient: RecipientVerification) => {
    form.setValue("recipientId", recipient.id, { shouldValidate: true, shouldDirty: true });
    form.clearErrors("recipientId");
    setDropdownOpen(false);
  };

  const handleSubmit = (values: VerifyFormValues) => {
    if (!selectedRecipient) {
      setFeedback({ type: "error", message: "Pilih petani yang akan diverifikasi." });
      setDropdownOpen(true);
      return;
    }
    if (!lokasi.latitude || !lokasi.longitude) {
      setFeedback({ type: "error", message: "GPS belum siap. Tekan segarkan dan pastikan izin lokasi aktif." });
      return;
    }
    if (!camera.preview) {
      setFeedback({ type: "error", message: "Ambil foto dokumentasi penyaluran terlebih dahulu." });
      return;
    }
    setFeedback(null);
    verifyMutation.mutate({
      id: selectedRecipient.id,
      notes: values.notes,
      productType: values.productType,
      seedType: values.productType === "benih" ? values.seedType : undefined,
      seedQuantityKg: values.productType === "benih" ? values.seedQuantityKg : undefined,
      pupukNpkKg: values.productType === "pupuk" ? values.pupukNpkKg : undefined,
      pupukUreaKg: values.productType === "pupuk" ? values.pupukUreaKg : undefined,
      lokasi: {
        latitude: lokasi.latitude,
        longitude: lokasi.longitude,
        alamat: lokasi.alamat,
      },
      fotoEvidence: camera.preview,
    });
  };

  return (
    <section className="space-y-4">
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

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Verifikasi penyaluran subsidi</CardTitle>
          <CardDescription>Pilih petani, ambil lokasi dan dokumentasi untuk mengirim verifikasi resmi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-netral">
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col gap-2">
              <span>Pilih petani penerima</span>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-abu-kartu px-3 py-2 text-left text-sm text-teks-gelap hover:border-biru-pemerintah/60"
                  onClick={() => pending.length > 0 && setDropdownOpen((prev) => !prev)}
                  disabled={pending.length === 0}
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
                      {filteredPending.length > 0 ? (
                        filteredPending.map((petani) => {
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
                                {petani.nik} • {petani.komoditas} • {petani.wilayah}
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
              {pending.length === 0 && <span className="text-xs text-slate-netral">Tidak ada data menunggu verifikasi.</span>}
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
              Jenis produk subsidi
              <select className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("productType")}>
                <option value="benih">Benih</option>
                <option value="pupuk">Pupuk</option>
              </select>
              {form.formState.errors.productType && (
                <span className="text-xs text-oranye-hangat">{form.formState.errors.productType.message}</span>
              )}
            </label>

            {selectedProduct === "benih" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  Pilih jenis benih
                  <select className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("seedType")}
                    defaultValue=""
                  >
                    <option value="">-- pilih jenis benih --</option>
                    <option value="padi">Padi</option>
                    <option value="jagung">Jagung</option>
                  </select>
                  {form.formState.errors.seedType && (
                    <span className="text-xs text-oranye-hangat">{form.formState.errors.seedType.message}</span>
                  )}
                </label>
                {selectedSeed && (
                  <label className="flex flex-col gap-1">
                    Jumlah benih (Kg)
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      className="rounded-2xl border border-abu-kartu px-3 py-2"
                      {...form.register("seedQuantityKg", { valueAsNumber: true })}
                    />
                    {form.formState.errors.seedQuantityKg && (
                      <span className="text-xs text-oranye-hangat">{form.formState.errors.seedQuantityKg.message}</span>
                    )}
                  </label>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  Jumlah pupuk NPK (Kg)
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    {...form.register("pupukNpkKg", { valueAsNumber: true })}
                  />
                  {form.formState.errors.pupukNpkKg && (
                    <span className="text-xs text-oranye-hangat">{form.formState.errors.pupukNpkKg.message}</span>
                  )}
                </label>
                <label className="flex flex-col gap-1">
                  Jumlah pupuk Urea (Kg)
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    {...form.register("pupukUreaKg", { valueAsNumber: true })}
                  />
                  {form.formState.errors.pupukUreaKg && (
                    <span className="text-xs text-oranye-hangat">{form.formState.errors.pupukUreaKg.message}</span>
                  )}
                </label>
              </div>
            )}

            <label className="flex flex-col gap-1">
              Catatan lapangan (opsional)
              <textarea
                className="rounded-2xl border border-abu-kartu px-3 py-2"
                rows={3}
                placeholder="Contoh: Produk subsidi diterima dengan baik"
                {...form.register("notes")}
              />
              {form.formState.errors.notes && (
                <span className="text-xs text-oranye-hangat">{form.formState.errors.notes.message}</span>
              )}
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
              <p className="text-sm font-medium text-teks-gelap">Dokumentasi penyaluran</p>
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
                  <img src={camera.preview} alt="Dokumentasi penyaluran" className="h-56 w-full rounded-2xl object-cover" />
                  <Button type="button" variant="outline" onClick={camera.restart}>
                    <FileImage className="mr-2 h-5 w-5" weight="bold" /> Ambil Ulang
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
              <ShieldCheck className="mr-2 h-4 w-4" weight="bold" />
              {verifyMutation.isPending ? "Memverifikasi..." : "Kirim verifikasi"}
            </Button>
            <Alert variant="info" className="text-xs">
              Data disimpan otomatis meski offline dan akan tersinkron ketika koneksi kembali.
            </Alert>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Riwayat verifikasi</CardTitle>
          <CardDescription>Lihat catatan penerima yang sudah diverifikasi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-netral">
          {recipients.map((item) => (
            <div key={item.id} className="rounded-2xl border border-abu-kartu p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-teks-gelap">{item.nama}</span>
                <Badge variant={statusBadge[item.status].variant}>{statusBadge[item.status].label}</Badge>
              </div>
              <p>Komoditas: {item.komoditas}</p>
              <p>Wilayah: {item.wilayah}</p>
              <p>Jadwal distribusi: {formatDateTime(item.jadwalDistribusi)}</p>
              {item.verifiedAt && <p>Diverifikasi: {formatDateTime(item.verifiedAt)}</p>}
              {item.notes && <p>Catatan: {item.notes}</p>}
              {item.lokasi && (
                <p>
                  Lokasi verifikasi: Lat {item.lokasi.latitude.toFixed(4)} | Long {item.lokasi.longitude.toFixed(4)}
                </p>
              )}
              {item.fotoEvidence && (
                <img src={item.fotoEvidence} alt={`Dokumentasi ${item.nama}`} className="mt-2 h-40 w-full rounded-2xl object-cover" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default VerifyRecipientsPage;

