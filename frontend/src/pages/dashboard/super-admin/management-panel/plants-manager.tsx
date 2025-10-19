import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin-service";
import type { SuperAdminPlantPayload, SuperAdminPlantReport, SuperAdminPlantUpdatePayload } from "@/types/super-admin";

import {
  Feedback,
  inputClass,
  parseNumberField,
  resolveErrorMessage,
  selectClass,
  textareaClass,
  formatDateTime,
} from "./helpers";

const PLANT_CONDITION_OPTIONS: Array<SuperAdminPlantPayload["kondisi"]> = ["baik", "waspada", "kritikal"];

interface PlantFormState {
  wilayah: string;
  petani: string;
  komoditas: string;
  fase: string;
  kondisi: SuperAdminPlantPayload["kondisi"];
  catatan: string;
  latitude: string;
  longitude: string;
  alamat: string;
  fotoEvidence: string;
  pupukDigunakanKg: string;
  luasLahanBersihM2: string;
  bibitDitanamKg: string;
  productType: "" | "benih" | "pupuk";
  seedType: string;
  seedQuantityKg: string;
  pupukNpkKg: string;
  pupukUreaKg: string;
}

const emptyPlantForm: PlantFormState = {
  wilayah: "",
  petani: "",
  komoditas: "",
  fase: "",
  kondisi: "baik",
  catatan: "",
  latitude: "",
  longitude: "",
  alamat: "",
  fotoEvidence: "",
  pupukDigunakanKg: "",
  luasLahanBersihM2: "",
  bibitDitanamKg: "",
  productType: "",
  seedType: "",
  seedQuantityKg: "",
  pupukNpkKg: "",
  pupukUreaKg: "",
};

export const PlantManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PlantFormState>(emptyPlantForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const plantQuery = useQuery({
    queryKey: ["super-admin", "plant-reports"],
    queryFn: () => superAdminService.listPlantReports(),
  });

  const reports = useMemo<SuperAdminPlantReport[]>(() => {
    const data = plantQuery.data ?? [];
    return [...data].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [plantQuery.data]);

  const handleField =
    (key: keyof PlantFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const resetForm = () => {
    setForm(emptyPlantForm);
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: (payload: SuperAdminPlantPayload) => superAdminService.createPlantReport(payload),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "plant-reports"] });
      setFeedback({ type: "success", message: "Laporan perkembangan tanaman ditambahkan." });
      resetForm();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menambahkan laporan tanaman.") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuperAdminPlantUpdatePayload }) =>
      superAdminService.updatePlantReport(id, payload),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "plant-reports"] });
      setFeedback({ type: "success", message: "Laporan perkembangan tanaman diperbarui." });
      if (editingId === variables.id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal memperbarui laporan tanaman.") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminService.deletePlantReport(id),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "plant-reports"] });
      setFeedback({ type: "success", message: "Laporan tanaman dihapus." });
      if (editingId === id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menghapus laporan tanaman.") });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.wilayah.trim() || !form.petani.trim() || !form.komoditas.trim() || !form.fase.trim()) {
      setFeedback({ type: "error", message: "Lengkapi informasi wilayah, petani, komoditas, dan fase." });
      return;
    }
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setFeedback({ type: "error", message: "Koordinat lokasi harus berupa angka." });
      return;
    }
    if (!form.alamat.trim()) {
      setFeedback({ type: "error", message: "Alamat lokasi wajib diisi." });
      return;
    }
    if (!form.fotoEvidence.trim()) {
      setFeedback({ type: "error", message: "Bukti foto wajib diisi." });
      return;
    }

    const payload: SuperAdminPlantPayload = {
      wilayah: form.wilayah.trim(),
      petani: form.petani.trim(),
      komoditas: form.komoditas.trim(),
      fase: form.fase.trim(),
      kondisi: form.kondisi,
      catatan: form.catatan.trim(),
      lokasi: {
        latitude,
        longitude,
        alamat: form.alamat.trim(),
      },
      fotoEvidence: form.fotoEvidence.trim(),
      pupukDigunakanKg: parseNumberField(form.pupukDigunakanKg),
      luasLahanBersihM2: parseNumberField(form.luasLahanBersihM2),
      bibitDitanamKg: parseNumberField(form.bibitDitanamKg),
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

  const handleEdit = (report: SuperAdminPlantReport) => {
    setEditingId(report.id);
    setForm({
      wilayah: report.wilayah,
      petani: report.petani,
      komoditas: report.komoditas,
      fase: report.fase,
      kondisi: report.kondisi,
      catatan: report.catatan,
      latitude: report.lokasi?.latitude !== undefined ? String(report.lokasi.latitude) : "",
      longitude: report.lokasi?.longitude !== undefined ? String(report.lokasi.longitude) : "",
      alamat: report.lokasi?.alamat ?? "",
      fotoEvidence: report.fotoEvidence ?? "",
      pupukDigunakanKg: report.pupukDigunakanKg !== undefined ? String(report.pupukDigunakanKg) : "",
      luasLahanBersihM2: report.luasLahanBersihM2 !== undefined ? String(report.luasLahanBersihM2) : "",
      bibitDitanamKg: report.bibitDitanamKg !== undefined ? String(report.bibitDitanamKg) : "",
      productType: (report.productType as PlantFormState["productType"]) ?? "",
      seedType: report.seedType ?? "",
      seedQuantityKg: report.seedQuantityKg !== undefined ? String(report.seedQuantityKg) : "",
      pupukNpkKg: report.pupukNpkKg !== undefined ? String(report.pupukNpkKg) : "",
      pupukUreaKg: report.pupukUreaKg !== undefined ? String(report.pupukUreaKg) : "",
    });
    setFeedback({ type: "info", message: `Mengubah laporan tanaman ${report.petani}.` });
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
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-teks-gelap sm:col-span-2">
            Wilayah
            <input
              className={inputClass}
              value={form.wilayah}
              onChange={handleField("wilayah")}
              placeholder="Contoh: Kabupaten Kupang"
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Kondisi
            <select className={selectClass} value={form.kondisi} onChange={handleField("kondisi")}>
              {PLANT_CONDITION_OPTIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition === "baik" ? "Baik" : condition === "waspada" ? "Waspada" : "Kritikal"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Nama petani
            <input className={inputClass} value={form.petani} onChange={handleField("petani")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Komoditas
            <input className={inputClass} value={form.komoditas} onChange={handleField("komoditas")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Fase budidaya
            <input className={inputClass} value={form.fase} onChange={handleField("fase")} required />
          </label>
        </div>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Catatan lapangan
          <textarea
            className={textareaClass}
            rows={3}
            value={form.catatan}
            onChange={handleField("catatan")}
            placeholder="Catatan perkembangan, hama/penyakit, rekomendasi tindakan"
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
            Alamat lokasi
            <input className={inputClass} value={form.alamat} onChange={handleField("alamat")} required />
          </label>
        </div>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Bukti foto (URL atau base64)
          <input className={inputClass} value={form.fotoEvidence} onChange={handleField("fotoEvidence")} required />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Pupuk digunakan (Kg)
            <input className={inputClass} value={form.pupukDigunakanKg} onChange={handleField("pupukDigunakanKg")} />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Luas lahan bersih (m²)
            <input className={inputClass} value={form.luasLahanBersihM2} onChange={handleField("luasLahanBersihM2")} />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Bibit ditanam (Kg)
            <input className={inputClass} value={form.bibitDitanamKg} onChange={handleField("bibitDitanamKg")} />
          </label>
        </div>
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
            {editingId ? "Simpan perubahan" : "Tambah laporan"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Batalkan
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {plantQuery.isLoading ? (
          <p className="text-sm text-slate-netral">Memuat laporan perkembangan tanaman...</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-slate-netral">Belum ada laporan perkembangan yang tersimpan.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="rounded-3xl border border-abu-kartu bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-teks-gelap">
                    {report.petani} • {report.komoditas}
                  </p>
                  <p className="text-xs text-slate-netral">{report.wilayah}</p>
                </div>
                <Badge variant={report.kondisi === "baik" ? "success" : report.kondisi === "waspada" ? "warning" : "warning"}>
                  Kondisi {report.kondisi}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-netral">
                Pembaruan: {formatDateTime(report.updatedAt)} • Fase: {report.fase}
              </p>
              <p className="mt-2 text-sm text-slate-netral">{report.catatan}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-netral">
                {report.pupukDigunakanKg !== undefined && <span>Pupuk: {report.pupukDigunakanKg} Kg</span>}
                {report.luasLahanBersihM2 !== undefined && <span>Luas lahan: {report.luasLahanBersihM2} m²</span>}
                {report.bibitDitanamKg !== undefined && <span>Bibit: {report.bibitDitanamKg} Kg</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(report)}>
                  Ubah
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(report.id)}
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
