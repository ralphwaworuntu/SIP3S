import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin-service";
import type {
  SuperAdminEscortPayload,
  SuperAdminEscortRequest,
  SuperAdminEscortUpdatePayload,
} from "@/types/super-admin";
import type { EscortStatus } from "@/types/bhabin";

import {
  Feedback,
  formatDateTime,
  inputClass,
  resolveErrorMessage,
  selectClass,
  textareaClass,
  toDateTimeInputValue,
} from "./helpers";

const ESCORT_STATUS_OPTIONS: EscortStatus[] = ["baru", "dijadwalkan", "approved", "selesai"];

interface EscortFormState {
  wilayah: string;
  jadwal: string;
  titikKumpul: string;
  estimasiPeserta: string;
  kebutuhanPersonel: string;
  catatan: string;
  diajukanOleh: string;
  status: "" | EscortStatus;
}

const emptyEscortForm: EscortFormState = {
  wilayah: "",
  jadwal: "",
  titikKumpul: "",
  estimasiPeserta: "",
  kebutuhanPersonel: "",
  catatan: "",
  diajukanOleh: "",
  status: "",
};

export const EscortManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EscortFormState>(emptyEscortForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const escortQuery = useQuery({
    queryKey: ["super-admin", "escort-requests"],
    queryFn: () => superAdminService.listEscortRequests(),
  });

  const requests = useMemo<SuperAdminEscortRequest[]>(() => {
    const data = escortQuery.data ?? [];
    return [...data].sort((a, b) => b.jadwal.localeCompare(a.jadwal));
  }, [escortQuery.data]);

  const handleField =
    (key: keyof EscortFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const resetForm = () => {
    setForm(emptyEscortForm);
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: (payload: SuperAdminEscortPayload) => superAdminService.createEscortRequest(payload),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "escort-requests"] });
      setFeedback({ type: "success", message: "Permintaan pengawalan ditambahkan." });
      resetForm();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menambahkan pengawalan.") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuperAdminEscortUpdatePayload }) =>
      superAdminService.updateEscortRequest(id, payload),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "escort-requests"] });
      setFeedback({ type: "success", message: "Permintaan pengawalan diperbarui." });
      if (editingId === variables.id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal memperbarui pengawalan.") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminService.deleteEscortRequest(id),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "escort-requests"] });
      setFeedback({ type: "success", message: "Permintaan pengawalan dihapus." });
      if (editingId === id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menghapus pengawalan.") });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.wilayah.trim() || !form.jadwal || !form.titikKumpul.trim() || !form.diajukanOleh.trim()) {
      setFeedback({ type: "error", message: "Lengkapi wilayah, jadwal, titik kumpul, dan pengaju." });
      return;
    }
    const estimasi = Number(form.estimasiPeserta);
    const personel = Number(form.kebutuhanPersonel);
    if (!Number.isFinite(estimasi) || estimasi <= 0 || !Number.isFinite(personel) || personel <= 0) {
      setFeedback({ type: "error", message: "Estimasi peserta dan kebutuhan personel harus lebih dari 0." });
      return;
    }

    const basePayload: SuperAdminEscortPayload = {
      wilayah: form.wilayah.trim(),
      jadwal: new Date(form.jadwal).toISOString(),
      titikKumpul: form.titikKumpul.trim(),
      estimasiPeserta: estimasi,
      kebutuhanPersonel: personel,
      catatan: form.catatan.trim() || undefined,
      diajukanOleh: form.diajukanOleh.trim(),
    };

    if (editingId) {
      const updatePayload: SuperAdminEscortUpdatePayload = {
        ...basePayload,
        status: form.status || undefined,
      };
      updateMutation.mutate({ id: editingId, payload: updatePayload });
    } else {
      createMutation.mutate(basePayload);
    }
  };

  const handleEdit = (request: SuperAdminEscortRequest) => {
    setEditingId(request.id);
    setForm({
      wilayah: request.wilayah,
      jadwal: toDateTimeInputValue(request.jadwal),
      titikKumpul: request.titikKumpul,
      estimasiPeserta: String(request.estimasiPeserta),
      kebutuhanPersonel: String(request.kebutuhanPersonel),
      catatan: request.catatan ?? "",
      diajukanOleh: request.diajukanOleh,
      status: request.status,
    });
    setFeedback({ type: "info", message: `Mengubah permintaan pengawalan wilayah ${request.wilayah}.` });
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
            Wilayah
            <input className={inputClass} value={form.wilayah} onChange={handleField("wilayah")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Jadwal pengawalan
            <input
              className={inputClass}
              type="datetime-local"
              value={form.jadwal}
              onChange={handleField("jadwal")}
              required
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Titik kumpul
            <input className={inputClass} value={form.titikKumpul} onChange={handleField("titikKumpul")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Estimasi peserta
            <input className={inputClass} value={form.estimasiPeserta} onChange={handleField("estimasiPeserta")} required />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Kebutuhan personel
            <input
              className={inputClass}
              value={form.kebutuhanPersonel}
              onChange={handleField("kebutuhanPersonel")}
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Diajukan oleh (email)
            <input className={inputClass} value={form.diajukanOleh} onChange={handleField("diajukanOleh")} required />
          </label>
        </div>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Catatan tambahan
          <textarea
            className={textareaClass}
            rows={3}
            value={form.catatan}
            onChange={handleField("catatan")}
            placeholder="Keterangan kebutuhan khusus atau sinergi"
          />
        </label>
        {editingId && (
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Status permintaan
            <select className={selectClass} value={form.status} onChange={handleField("status")}>
              <option value="">-- tidak berubah --</option>
              {ESCORT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "baru"
                    ? "Baru"
                    : status === "dijadwalkan"
                    ? "Dijadwalkan"
                    : status === "approved"
                    ? "Disetujui"
                    : "Selesai"}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {editingId ? "Simpan perubahan" : "Tambah permintaan"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Batalkan
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {escortQuery.isLoading ? (
          <p className="text-sm text-slate-netral">Memuat permintaan pengawalan...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-netral">Belum ada permintaan pengawalan.</p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="rounded-3xl border border-abu-kartu bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-teks-gelap">{request.wilayah}</p>
                  <p className="text-xs text-slate-netral">
                    Jadwal: {formatDateTime(request.jadwal)} • Titik kumpul: {request.titikKumpul}
                  </p>
                </div>
                <Badge
                  variant={
                    request.status === "baru"
                      ? "warning"
                      : request.status === "approved"
                      ? "success"
                      : request.status === "dijadwalkan"
                      ? "neutral"
                      : "success"
                  }
                >
                  Status: {request.status}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-netral">
                Estimasi {request.estimasiPeserta} peserta • Personel {request.kebutuhanPersonel}
              </p>
              {request.catatan && <p className="mt-1 text-xs text-slate-netral">Catatan: {request.catatan}</p>}
              <p className="mt-1 text-xs text-slate-netral">Diajukan oleh: {request.diajukanOleh}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(request)}>
                  Ubah
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(request.id)}
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
