import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin-service";
import type { SuperAdminAccount, SuperAdminAccountPayload } from "@/types/super-admin";
import type { BhabinStatus } from "@/types/bhabin";

import {
  Feedback,
  formatDateTime,
  inputClass,
  resolveErrorMessage,
  selectClass,
} from "./helpers";

const ACCOUNT_STATUS_OPTIONS: BhabinStatus[] = ["active", "inactive"];

interface AccountFormState {
  nama: string;
  email: string;
  agency: string;
  wilayah: string;
  phone: string;
  status: BhabinStatus;
  password: string;
}

const emptyAccountForm: AccountFormState = {
  nama: "",
  email: "",
  agency: "",
  wilayah: "",
  phone: "",
  status: "active",
  password: "",
};

export const AccountManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AccountFormState>(emptyAccountForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const accountsQuery = useQuery({
    queryKey: ["super-admin", "accounts"],
    queryFn: () => superAdminService.listAccounts(),
  });

  const accounts = useMemo<SuperAdminAccount[]>(() => {
    const data = accountsQuery.data ?? [];
    return [...data].sort((a, b) => a.nama.localeCompare(b.nama));
  }, [accountsQuery.data]);

  const handleField =
    (key: keyof AccountFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const resetForm = () => {
    setForm(emptyAccountForm);
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: (payload: SuperAdminAccountPayload) => superAdminService.createAccount(payload),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "accounts"] });
      setFeedback({ type: "success", message: "Akun Bhabinkamtibmas ditambahkan." });
      resetForm();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menambahkan akun Bhabin.") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuperAdminAccountPayload }) =>
      superAdminService.updateAccount(id, payload),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "accounts"] });
      setFeedback({ type: "success", message: "Akun Bhabinkamtibmas diperbarui." });
      resetForm();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal memperbarui akun Bhabin.") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminService.deleteAccount(id),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "accounts"] });
      setFeedback({ type: "success", message: "Akun Bhabinkamtibmas dihapus." });
      resetForm();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menghapus akun Bhabin.") });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nama.trim() || !form.email.trim()) {
      setFeedback({ type: "error", message: "Nama dan email wajib diisi." });
      return;
    }
    const payload: SuperAdminAccountPayload = {
      nama: form.nama.trim(),
      email: form.email.trim().toLowerCase(),
      agency: form.agency.trim() || undefined,
      wilayah: form.wilayah.trim() || undefined,
      phone: form.phone.trim() || undefined,
      status: form.status,
      password: form.password.trim() || undefined,
    };
    if (!editingId && !payload.password) {
      setFeedback({ type: "error", message: "Password wajib diisi untuk akun baru." });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (account: SuperAdminAccount) => {
    setEditingId(account.id);
    setForm({
      nama: account.nama,
      email: account.email,
      agency: account.agency ?? "",
      wilayah: account.wilayah ?? "",
      phone: account.phone ?? "",
      status: account.status,
      password: "",
    });
    setFeedback({ type: "info", message: `Mengubah akun ${account.nama}.` });
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
            Nama petugas
            <input className={inputClass} value={form.nama} onChange={handleField("nama")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Email dinas
            <input className={inputClass} value={form.email} onChange={handleField("email")} required />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Instansi
            <input className={inputClass} value={form.agency} onChange={handleField("agency")} />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Wilayah kerja
            <input className={inputClass} value={form.wilayah} onChange={handleField("wilayah")} />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Nomor kontak
            <input className={inputClass} value={form.phone} onChange={handleField("phone")} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Status akun
            <select className={selectClass} value={form.status} onChange={handleField("status")}>
              {ACCOUNT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "active" ? "Aktif" : "Nonaktif"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Password (isi saat membuat atau mengganti)
            <input
              className={inputClass}
              type="password"
              value={form.password}
              onChange={handleField("password")}
              placeholder={editingId ? "Biarkan kosong jika tidak berubah" : "Minimal 6 karakter"}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {editingId ? "Simpan perubahan" : "Tambah akun"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Batalkan
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {accountsQuery.isLoading ? (
          <p className="text-sm text-slate-netral">Memuat akun Bhabinkamtibmas...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-slate-netral">Belum ada akun Bhabinkamtibmas.</p>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="rounded-3xl border border-abu-kartu bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-teks-gelap">{account.nama}</p>
                  <p className="text-xs text-slate-netral">{account.email}</p>
                </div>
                <Badge variant={account.status === "active" ? "success" : "warning"}>
                  {account.status === "active" ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-slate-netral">
                {account.agency && <span>Instansi: {account.agency} • </span>}
                {account.wilayah && <span>Wilayah: {account.wilayah} • </span>}
                <span>Dibuat: {formatDateTime(account.createdAt)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(account)}>
                  Ubah
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(account.id)}
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
