import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin-service";
import type { SuperAdminHarvest, SuperAdminHarvestPayload, SuperAdminHarvestUpdatePayload } from "@/types/super-admin";

import {
  Feedback,
  inputClass,
  parseNumberField,
  resolveErrorMessage,
  selectClass,
  textareaClass,
  formatDateTime,
} from "./helpers";

interface HarvestFormState {
  petani: string;
  komoditas: string;
  luasPanenHa: string;
  produksiTon: string;
  lokasi: string;
  keterangan: string;
  latitude: string;
  longitude: string;
  alamat: string;
  fotoEvidence: string;
  productType: "" | "benih" | "pupuk";
  seedType: string;
  seedQuantityKg: string;
  pupukNpkKg: string;
  pupukUreaKg: string;
}

const emptyHarvestForm: HarvestFormState = {
  petani: "",
  komoditas: "",
  luasPanenHa: "",
  produksiTon: "",
  lokasi: "",
  keterangan: "",
  latitude: "",
  longitude: "",
  alamat: "",
  fotoEvidence: "",
  productType: "",
  seedType: "",
  seedQuantityKg: "",
  pupukNpkKg: "",
  pupukUreaKg: "",
};

export const HarvestManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HarvestFormState>(emptyHarvestForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const harvestQuery = useQuery({
    queryKey: ["super-admin", "harvests"],
    queryFn: () => superAdminService.listHarvestVerifications(),
  });

  const harvests = useMemo<SuperAdminHarvest[]>(() => {
    const data = harvestQuery.data ?? [];
    return [...data].sort((a, b) => b.diverifikasiAt.localeCompare(a.diverifikasiAt));
  }, [harvestQuery.data]);

  const handleField =
    (key: keyof HarvestFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const resetForm = () => {
    setForm(emptyHarvestForm);
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: (payload: SuperAdminHarvestPayload) => superAdminService.createHarvestVerification(payload),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "harvests"] });
      setFeedback({ type: "success", message: "Verifikasi panen ditambahkan." });
      resetForm();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menambahkan verifikasi panen.") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuperAdminHarvestUpdatePayload }) =>
      superAdminService.updateHarvestVerification(id, payload),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "harvests"] });
      setFeedback({ type: "success", message: "Verifikasi panen diperbarui." });
      if (editingId === variables.id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal memperbarui verifikasi panen.") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminService.deleteHarvestVerification(id),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "harvests"] });
      setFeedback({ type: "success", message: "Verifikasi panen dihapus." });
      if (editingId === id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menghapus verifikasi panen.") });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.petani.trim() || !form.komoditas.trim() || !form.lokasi.trim()) {
      setFeedback({ type: "error", message: "Lengkapi data petani, komoditas, dan lokasi panen." });
      return;
    }
    const luas = Number(form.luasPanenHa);
    const produksi = Number(form.produksiTon);
    if (!Number.isFinite(luas) || !Number.isFinite(produksi)) {
      setFeedback({ type: "error", message: "Luas panen dan produksi harus berupa angka." });
      return;
    }
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setFeedback({ type: "error", message: "Koordinat lokasi panen harus berupa angka." });
      return;
    }
    if (!form.alamat.trim()) {
      setFeedback({ type: "error", message: "Alamat koordinat wajib diisi." });
      return;
    }
    if (!form.fotoEvidence.trim()) {
      setFeedback({ type: "error", message: "Bukti foto panen wajib diisi." });
      return;
    }

    const payload: SuperAdminHarvestPayload = {
      petani: form.petani.trim(),
      komoditas: form.komoditas.trim(),
      luasPanenHa: luas,
      produksiTon: produksi,
      lokasi: form.lokasi.trim(),
      keterangan: form.keterangan.trim() || undefined,
      koordinat: {
        latitude,
        longitude,
        alamat: form.alamat.trim(),
      },
      fotoEvidence: form.fotoEvidence.trim(),
      productType: form.productType || undefined,
      seedType: form.productType === "benih" ? form.seedType.trim() || undefined : undefined,
      seedQuantityKg: form.productType === "benih" ? parseNumberField(form.seedQuantityKg) : undefined,
      pupukNpkKg: form.productType === "pupuk" ? parseNumberField(form.pupukNpkKg) : undefined,
      pupukUreaKg: form.productType === "pupuk" ? parseNumberField(form.pupukUreaKg) : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (harvest: SuperAdminHarvest) => {
    setEditingId(harvest.id);
    setForm({
      petani: harvest.petani,
      komoditas: harvest.komoditas,
      luasPanenHa: String(harvest.luasPanenHa),
      produksiTon: String(harvest.produksiTon),
      lokasi: harvest.lokasi,
      keterangan: harvest.keterangan ?? "",
      latitude: harvest.koordinat?.latitude !== undefined ? String(harvest.koordinat.latitude) : "",
      longitude: harvest.koordinat?.longitude !== undefined ? String(harvest.koordinat.longitude) : "",
      alamat: harvest.koordinat?.alamat ?? "",
      fotoEvidence: harvest.fotoEvidence ?? "",
      productType: (harvest.productType as HarvestFormState["productType"]) ?? "",
      seedType: harvest.seedType ?? "",
      seedQuantityKg: harvest.seedQuantityKg !== undefined ? String(harvest.seedQuantityKg) : "",
      pupukNpkKg: harvest.pupukNpkKg !== undefined ? String(harvest.pupukNpkKg) : "",
      pupukUreaKg: harvest.pupukUreaKg !== undefined ? String(harvest.pupukUreaKg) : "",
    });
    setFeedback({ type: "info", message: `Mengubah verifikasi panen ${harvest.petani}.` });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="space-y-5">
      {feedback && (
        <Alert variant={feedback.type === "error" ? "error" : feedback.type === "success" ? "success" : "info"}>
          {feedback.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-abu-kartu p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Nama petani
            <input className={inputClass} value={form.petani} onChange={handleField("petani")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Komoditas
            <input className={inputClass} value={form.komoditas} onChange={handleField("komoditas")} required />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Luas panen (Ha)
            <input className={inputClass} value={form.luasPanenHa} onChange={handleField("luasPanenHa")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Produksi (Ton)
            <input className={inputClass} value={form.produksiTon} onChange={handleField("produksiTon")} required />
          </label>
        </div>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Lokasi panen / gudang
          <input className={inputClass} value={form.lokasi} onChange={handleField("lokasi")} required />
        </label>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Catatan tambahan
          <textarea
            className={textareaClass}
            rows={3}
            value={form.keterangan}
            onChange={handleField("keterangan")}
            placeholder="Keterangan logistik, kondisi panen, kebutuhan dukungan"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Latitude
            <input className={inputClass} value={form.latitude} onChange={handleField("latitude")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Longitude
            <input className={inputClass} value={form.longitude} onChange={handleField("longitude")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap sm:col-span-1">
            Alamat koordinat
            <input className={inputClass} value={form.alamat} onChange={handleField("alamat")} required />
          </label>
        </div>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Bukti foto panen
          <input className={inputClass} value={form.fotoEvidence} onChange={handleField("fotoEvidence")} required />
        </label>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Jenis dukungan subsidi
          <select className={selectClass} value={form.productType} onChange={handleField("productType")}>
            <option value="">-- pilih --</option>
            <option value="benih">Benih</option>
            <option value="pupuk">Pupuk</option>
          </select>
        </label>
        {form.productType === "benih" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-teks-gelap">
              Jenis benih
              <input className={inputClass} value={form.seedType} onChange={handleField("seedType")} />
            </label>
            <label className="space-y-1 text-sm font-medium text-teks-gelap">
              Jumlah benih (Kg)
              <input className={inputClass} value={form.seedQuantityKg} onChange={handleField("seedQuantityKg")} />
            </label>
          </div>
        )}
        {form.productType === "pupuk" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-teks-gelap">
              Pupuk NPK (Kg)
              <input className={inputClass} value={form.pupukNpkKg} onChange={handleField("pupukNpkKg")} />
            </label>
            <label className="space-y-1 text-sm font-medium text-teks-gelap">
              Pupuk Urea (Kg)
              <input className={inputClass} value={form.pupukUreaKg} onChange={handleField("pupukUreaKg")} />
            </label>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {editingId ? "Simpan perubahan" : "Tambah verifikasi"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Batalkan
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {harvestQuery.isLoading ? (
          <p className="text-sm text-slate-netral">Memuat data verifikasi panen...</p>
        ) : harvests.length === 0 ? (
          <p className="text-sm text-slate-netral">Belum ada verifikasi panen.</p>
        ) : (
          harvests.map((record) => (
            <div key={record.id} className="rounded-3xl border border-abu-kartu bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-teks-gelap">
                    {record.petani} • {record.komoditas}
                  </p>
                  <p className="text-xs text-slate-netral">
                    Produksi {record.produksiTon} ton • Luas {record.luasPanenHa} Ha
                  </p>
                </div>
                <Badge variant="success">Diverifikasi {formatDateTime(record.diverifikasiAt)}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-netral">Lokasi: {record.lokasi}</p>
              {record.keterangan && <p className="mt-1 text-xs text-slate-netral">Catatan: {record.keterangan}</p>}
              <div className="mt-3 flex flex-wrap gap-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                  Ubah
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(record.id)}
                  disabled={deleteMutation.isPending}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
