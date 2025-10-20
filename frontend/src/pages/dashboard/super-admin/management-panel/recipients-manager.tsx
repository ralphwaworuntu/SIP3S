import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin-service";
import type { SuperAdminRecipient, SuperAdminRecipientUpdatePayload } from "@/types/super-admin";
import type { VerificationStatus } from "@/types/bhabin";

import {
  Feedback,
  inputClass,
  resolveErrorMessage,
  selectClass,
  textareaClass,
  parseNumberField,
  formatDateTime,
} from "./helpers";

const RECIPIENT_STATUS_OPTIONS: VerificationStatus[] = ["pending", "verified", "rejected"];

const recipientStatusBadge: Record<VerificationStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  pending: { label: "Menunggu", variant: "warning" },
  verified: { label: "Terverifikasi", variant: "success" },
  rejected: { label: "Ditolak", variant: "warning" },
};

interface RecipientFormState {
  status: VerificationStatus;
  notes: string;
  productType: "" | "benih" | "pupuk";
  seedType: string;
  seedQuantityKg: string;
  pupukNpkKg: string;
  pupukUreaKg: string;
  latitude: string;
  longitude: string;
  alamat: string;
  fotoEvidence: string;
}

const emptyRecipientForm: RecipientFormState = {
  status: "pending",
  notes: "",
  productType: "",
  seedType: "",
  seedQuantityKg: "",
  pupukNpkKg: "",
  pupukUreaKg: "",
  latitude: "",
  longitude: "",
  alamat: "",
  fotoEvidence: "",
};

export const RecipientManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SuperAdminRecipient | null>(null);
  const [form, setForm] = useState<RecipientFormState>(emptyRecipientForm);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const recipientsQuery = useQuery({
    queryKey: ["super-admin", "recipients"],
    queryFn: () => superAdminService.listRecipients(),
  });

  const recipients = recipientsQuery.data ?? [];

  const updateRecipientMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuperAdminRecipientUpdatePayload }) =>
      superAdminService.updateRecipient(id, payload),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "recipients"] });
      setFeedback({ type: "success", message: "Data penerima berhasil diperbarui." });
      setSelected(null);
      setForm(emptyRecipientForm);
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal memperbarui data penerima.") });
    },
  });

  const handleSelect = (recipient: SuperAdminRecipient) => {
    setSelected(recipient);
    setForm({
      status: recipient.status,
      notes: recipient.notes ?? "",
      productType: (recipient.productType as RecipientFormState["productType"]) ?? "",
      seedType: recipient.seedType ?? "",
      seedQuantityKg: recipient.seedQuantityKg !== undefined ? String(recipient.seedQuantityKg) : "",
      pupukNpkKg: recipient.pupukNpkKg !== undefined ? String(recipient.pupukNpkKg) : "",
      pupukUreaKg: recipient.pupukUreaKg !== undefined ? String(recipient.pupukUreaKg) : "",
      latitude: recipient.lokasi?.latitude !== undefined ? String(recipient.lokasi.latitude) : "",
      longitude: recipient.lokasi?.longitude !== undefined ? String(recipient.lokasi.longitude) : "",
      alamat: recipient.lokasi?.alamat ?? "",
      fotoEvidence: recipient.fotoEvidence ?? "",
    });
    setFeedback({ type: "info", message: `Mengelola verifikasi ${recipient.nama}.` });
  };

  const handleRecipientField =
    (key: keyof RecipientFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) {
      setFeedback({ type: "error", message: "Pilih penerima yang ingin diperbarui." });
      return;
    }

    let lokasi: SuperAdminRecipientUpdatePayload["lokasi"];
    if (form.latitude || form.longitude || form.alamat) {
      const latitude = Number(form.latitude);
      const longitude = Number(form.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setFeedback({ type: "error", message: "Koordinat lokasi harus berupa angka." });
        return;
      }
      if (!form.alamat.trim()) {
        setFeedback({ type: "error", message: "Alamat lokasi wajib diisi bila koordinat diberikan." });
        return;
      }
      lokasi = {
        latitude,
        longitude,
        alamat: form.alamat.trim(),
      };
    }

    const payload: SuperAdminRecipientUpdatePayload = {
      id: selected.id,
      status: form.status,
      notes: form.notes.trim() || undefined,
      productType: form.productType || undefined,
      seedType: form.productType === "benih" ? form.seedType.trim() || undefined : undefined,
      seedQuantityKg: form.productType === "benih" ? parseNumberField(form.seedQuantityKg) : undefined,
      pupukNpkKg: form.productType === "pupuk" ? parseNumberField(form.pupukNpkKg) : undefined,
      pupukUreaKg: form.productType === "pupuk" ? parseNumberField(form.pupukUreaKg) : undefined,
      lokasi,
      fotoEvidence: form.fotoEvidence.trim() || undefined,
    };

    updateRecipientMutation.mutate({ id: selected.id, payload });
  };

  return (
    <section className="space-y-5">
      {feedback && (
        <Alert variant={feedback.type === "error" ? "error" : feedback.type === "success" ? "success" : "info"}>
          {feedback.message}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-teks-gelap">Daftar penerima bantuan</h3>
          {recipientsQuery.isLoading ? (
            <p className="text-sm text-slate-netral">Memuat data penerima...</p>
          ) : recipients.length === 0 ? (
            <p className="text-sm text-slate-netral">Belum ada data penerima.</p>
          ) : (
            recipients.map((recipient) => (
              <div key={recipient.id} className="rounded-3xl border border-abu-kartu bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teks-gelap">{recipient.nama}</p>
                    <p className="text-xs text-slate-netral">
                      {recipient.komoditas} • {recipient.wilayah}
                    </p>
                  </div>
                  <Badge variant={recipientStatusBadge[recipient.status].variant}>
                    {recipientStatusBadge[recipient.status].label}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-netral">
                  Jadwal distribusi: {formatDateTime(recipient.jadwalDistribusi)}
                </p>
                {recipient.notes && <p className="mt-1 text-xs text-slate-netral">Catatan: {recipient.notes}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleSelect(recipient)}>
                    Kelola
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-3xl border border-abu-kartu bg-white/80 p-4">
          <h3 className="text-base font-semibold text-teks-gelap">Perbarui status penyaluran</h3>
          {!selected ? (
            <p className="mt-3 text-sm text-slate-netral">Pilih penerima dari daftar untuk mengubah status.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 font-medium text-teks-gelap">
                  Status
                  <select className={selectClass} value={form.status} onChange={handleRecipientField("status")}>
                    {RECIPIENT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {recipientStatusBadge[status].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 font-medium text-teks-gelap">
                  Jenis produk
                  <select className={selectClass} value={form.productType} onChange={handleRecipientField("productType")}>
                    <option value="">-- pilih --</option>
                    <option value="benih">Benih</option>
                    <option value="pupuk">Pupuk</option>
                  </select>
                </label>
              </div>
              {form.productType === "benih" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 font-medium text-teks-gelap">
                    Jenis benih
                    <input className={inputClass} value={form.seedType} onChange={handleRecipientField("seedType")} />
                  </label>
                  <label className="space-y-1 font-medium text-teks-gelap">
                    Jumlah benih (Kg)
                    <input
                      className={inputClass}
                      value={form.seedQuantityKg}
                      onChange={handleRecipientField("seedQuantityKg")}
                    />
                  </label>
                </div>
              )}
              {form.productType === "pupuk" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 font-medium text-teks-gelap">
                    Pupuk NPK (Kg)
                    <input
                      className={inputClass}
                      value={form.pupukNpkKg}
                      onChange={handleRecipientField("pupukNpkKg")}
                    />
                  </label>
                  <label className="space-y-1 font-medium text-teks-gelap">
                    Pupuk Urea (Kg)
                    <input
                      className={inputClass}
                      value={form.pupukUreaKg}
                      onChange={handleRecipientField("pupukUreaKg")}
                    />
                  </label>
                </div>
              )}
              <label className="space-y-1 font-medium text-teks-gelap">
                Catatan lapangan
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={form.notes}
                  onChange={handleRecipientField("notes")}
                  placeholder="Masukkan catatan penting hasil verifikasi"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1 font-medium text-teks-gelap">
                  Latitude
                  <input className={inputClass} value={form.latitude} onChange={handleRecipientField("latitude")} />
                </label>
                <label className="space-y-1 font-medium text-teks-gelap">
                  Longitude
                  <input className={inputClass} value={form.longitude} onChange={handleRecipientField("longitude")} />
                </label>
                <label className="space-y-1 font-medium text-teks-gelap sm:col-span-1 md:col-span-1 lg:col-span-1">
                  Alamat lokasi
                  <input className={inputClass} value={form.alamat} onChange={handleRecipientField("alamat")} />
                </label>
              </div>
              <label className="space-y-1 font-medium text-teks-gelap">
                Link / bukti foto
                <input
                  className={inputClass}
                  value={form.fotoEvidence}
                  onChange={handleRecipientField("fotoEvidence")}
                  placeholder="URL bukti foto (opsional)"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={updateRecipientMutation.isPending}>
                  Simpan perubahan
                </Button>
                <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                  Batalkan
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
