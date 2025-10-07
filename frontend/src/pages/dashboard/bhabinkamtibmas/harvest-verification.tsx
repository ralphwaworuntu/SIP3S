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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useCamera } from "@/hooks/use-camera";
import { bhabinService } from "@/services/bhabin-service";
import type { GeoPoint, RecipientVerification } from "@/types/bhabin";

const harvestSchema = z.object({
  recipientId: z.string().min(1, "Pilih petani"),
  luasPanenHa: z.coerce.number().min(0.1, "Minimal 0.1 Ha"),
  produksiTon: z.coerce.number().min(0, "Minimal 0"),
  lokasi: z.string().min(2, "Wajib diisi"),
  keterangan: z.string().optional(),
});

type HarvestFormValues = z.infer<typeof harvestSchema>;

type FeedbackState = {
  type: "success" | "error" | "info";
  message: string;
};

const dropdownDisplay = (recipient: RecipientVerification | null) => {
  if (!recipient) {
    return "-- pilih petani --";
  }
  return `${recipient.nama} • ${recipient.komoditas} • ${recipient.wilayah}`;
};

const formatDateTime = (iso: string) => new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

const HarvestVerificationPage = () => {
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
  const selectableRecipients = useMemo(() => recipients.filter((item) => item.status !== "rejected"), [recipients]);
  const filteredRecipients = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return selectableRecipients;
    return selectableRecipients.filter((item) => {
      const combined = `${item.nama} ${item.nik} ${item.komoditas} ${item.wilayah}`.toLowerCase();
      return combined.includes(keyword);
    });
  }, [selectableRecipients, searchTerm]);

  const form = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      recipientId: "",
      luasPanenHa: 1,
      produksiTon: 0,
      lokasi: "",
      keterangan: "",
    },
  });

  const recipientId = form.watch("recipientId");
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

  const handleRecipientSelect = (recipient: RecipientVerification) => {
    form.setValue("recipientId", recipient.id, { shouldValidate: true, shouldDirty: true });
    form.clearErrors("recipientId");
    setDropdownOpen(false);
  };

  const query = useQuery({
    queryKey: ["bhabin", "harvest"],
    queryFn: () => bhabinService.listHarvestVerifications(),
  });

  const mutation = useMutation({
    mutationFn: (payload: HarvestFormValues & { koordinat: GeoPoint; fotoEvidence: string; verifier: string; petani: string; komoditas: string }) =>
      bhabinService.submitHarvestVerification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bhabin", "harvest"] });
      setFeedback({ type: "success", message: "Verifikasi hasil panen tersimpan." });
      form.reset({ recipientId: "", luasPanenHa: 1, produksiTon: 0, lokasi: "", keterangan: "" });
      camera.restart();
    },
    onError: () => setFeedback({ type: "error", message: "Gagal menyimpan verifikasi panen." }),
  });

  const handleSubmit = (values: HarvestFormValues) => {
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
      setFeedback({ type: "error", message: "Ambil foto hasil panen terlebih dahulu." });
      return;
    }

    setFeedback(null);
    mutation.mutate({
      ...values,
      petani: selectedRecipient.nama,
      komoditas: selectedRecipient.komoditas,
      koordinat: {
        latitude: lokasi.latitude,
        longitude: lokasi.longitude,
        alamat: lokasi.alamat,
      },
      fotoEvidence: camera.preview,
      verifier: "bhabin",
    });
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Verifikasi hasil panen</CardTitle>
          <CardDescription>Catat hasil panen yang sudah diverifikasi di lapangan.</CardDescription>
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
                  onClick={() => selectableRecipients.length > 0 && setDropdownOpen((prev) => !prev)}
                  disabled={selectableRecipients.length === 0}
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
              {selectableRecipients.length === 0 && <span className="text-xs text-slate-netral">Belum ada data penerima.</span>}
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

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                Luas panen (Ha)
                <input type="number" step="0.01" min={0.1} className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("luasPanenHa", { valueAsNumber: true })} />
                {form.formState.errors.luasPanenHa && <span className="text-xs text-oranye-hangat">{form.formState.errors.luasPanenHa.message}</span>}
              </label>
              <label className="flex flex-col gap-1">
                Produksi (Ton)
                <input type="number" step="0.01" min={0} className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("produksiTon", { valueAsNumber: true })} />
                {form.formState.errors.produksiTon && <span className="text-xs text-oranye-hangat">{form.formState.errors.produksiTon.message}</span>}
              </label>
            </div>
            <label className="flex flex-col gap-1">
              Lokasi penyimpanan hasil panen
              <input className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("lokasi")} />
              {form.formState.errors.lokasi && <span className="text-xs text-oranye-hangat">{form.formState.errors.lokasi.message}</span>}
            </label>
            <label className="flex flex-col gap-1">
              Keterangan tambahan
              <textarea className="rounded-2xl border border-abu-kartu px-3 py-2" rows={3} {...form.register("keterangan")} />
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
              <p className="text-sm font-medium text-teks-gelap">Dokumentasi hasil panen</p>
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
                  <img src={camera.preview} alt="Dokumentasi panen" className="h-56 w-full rounded-2xl object-cover" />
                  <Button type="button" variant="outline" onClick={camera.restart}>
                    <FileImage className="mr-2 h-5 w-5" weight="bold" /> Ambil Ulang
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Simpan verifikasi"}
            </Button>
            <Alert variant="info" className="text-xs">
              Data disimpan otomatis meski offline dan akan tersinkron ketika koneksi kembali.
            </Alert>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Riwayat verifikasi panen</CardTitle>
          <CardDescription>Daftar panen yang telah Anda cek.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-netral">
          {(query.data ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-abu-kartu p-3">
              <p className="text-sm font-medium text-teks-gelap">{item.petani}</p>
              <p>Komoditas: {item.komoditas}</p>
              <p>Luas panen: {item.luasPanenHa} Ha</p>
              <p>Produksi: {item.produksiTon} Ton</p>
              <p>Lokasi penyimpanan: {item.lokasi}</p>
              <p>Diverifikasi: {formatDateTime(item.diverifikasiAt)}</p>
              {item.koordinat && (
                <p>
                  Koordinat: Lat {item.koordinat.latitude.toFixed(4)} | Long {item.koordinat.longitude.toFixed(4)}
                </p>
              )}
              {item.keterangan && <p>Keterangan: {item.keterangan}</p>}
              {item.fotoEvidence && (
                <img src={item.fotoEvidence} alt={`Dokumentasi panen ${item.petani}`} className="mt-2 h-32 w-full rounded-2xl object-cover" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default HarvestVerificationPage;
