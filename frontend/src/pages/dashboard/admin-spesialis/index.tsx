import { useEffect, useMemo, useState } from "react";
import {
  FunnelSimple,
  MagnifyingGlass,
  PaperPlaneTilt,
  PencilSimple,
  PlusCircle,
  SignOut,
  Tag,
  TrashSimple,
  UserPlus,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import { adminBhabinService } from "@/services/admin-bhabin-service";
import { taskService } from "@/services/task-service";
import type { BhabinAccount } from "@/types/bhabin";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

type AdminPanelKey = "tasks" | "accounts";

type AccountFormState = {
  nama: string;
  email: string;
  agency: string;
  wilayah: string;
  phone: string;
  password: string;
  status: "active" | "inactive";
};

const priorityColor: Record<TaskPriority, string> = {
  high: "bg-oranye-hangat/20 text-oranye-hangat",
  medium: "bg-biru-pemerintah/10 text-biru-pemerintah",
  low: "bg-hijau-hutan/10 text-hijau-hutan",
};

const statusLabel: Record<TaskStatus, string> = {
  baru: "Baru",
  proses: "Diproses",
  selesai: "Selesai",
};

const createEmptyAccountForm = (): AccountFormState => ({
  nama: "",
  email: "",
  agency: "",
  wilayah: "",
  phone: "",
  password: "",
  status: "active",
});

const AdminSpesialisDashboard = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOnlineStatus();

  const [activePanel, setActivePanel] = useState<AdminPanelKey>("tasks");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "semua">("semua");
  const [draftTask, setDraftTask] = useState({
    title: "",
    description: "",
    region: "",
    priority: "medium" as TaskPriority,
    dueDate: new Date().toISOString().slice(0, 10),
  });

  const [accountSearch, setAccountSearch] = useState("");
  const [accountForm, setAccountForm] = useState<AccountFormState>(() => createEmptyAccountForm());
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BhabinAccount | null>(null);
  const [accountAlert, setAccountAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [accountModalAlert, setAccountModalAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskService.list(),
  });

  const {
    data: bhabinAccounts = [],
    refetch: refetchAccounts,
    isLoading: isLoadingAccounts,
  } = useQuery({
    queryKey: ["bhabin-accounts"],
    queryFn: () => adminBhabinService.list(),
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = selectedStatus === "semua" ? true : task.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [search, selectedStatus, tasks]);

  const filteredAccounts = useMemo(() => {
    const keyword = accountSearch.trim().toLowerCase();
    if (!keyword) return bhabinAccounts;
    return bhabinAccounts.filter((account) => {
      const haystack = [account.nama, account.email, account.wilayah ?? "", account.agency ?? ""].join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }, [accountSearch, bhabinAccounts]);

  const handleCreateTask = async () => {
    const nextTask: Task = {
      id: uuid(),
      title: draftTask.title,
      description: draftTask.description,
      region: draftTask.region,
      dueDate: draftTask.dueDate,
      priority: draftTask.priority,
      status: "baru",
      assignedTo: ["petugas@kab.kupang.id"],
      updatedAt: new Date().toISOString(),
    };
    await taskService.assign(nextTask);
    setDraftTask({ title: "", description: "", region: "", priority: "medium", dueDate: new Date().toISOString().slice(0, 10) });
    refetch();
  };

  const openCreateAccountModal = () => {
    setEditingAccount(null);
    setAccountForm(createEmptyAccountForm());
    setAccountModalAlert(null);
    setAccountModalOpen(true);
  };

  const openEditAccountModal = (account: BhabinAccount) => {
    setEditingAccount(account);
    setAccountForm({
      nama: account.nama,
      email: account.email,
      agency: account.agency ?? "",
      wilayah: account.wilayah ?? "",
      phone: account.phone ?? "",
      password: "",
      status: account.status,
    });
    setAccountModalAlert(null);
    setAccountModalOpen(true);
  };

  const handleSubmitAccount = async () => {
    setAccountModalAlert(null);
    if (!accountForm.nama.trim() || !accountForm.email.trim()) {
      setAccountModalAlert({ type: "error", message: "Nama dan email wajib diisi." });
      return;
    }

    setIsSavingAccount(true);
    const payload = {
      nama: accountForm.nama.trim(),
      email: accountForm.email.trim(),
      agency: accountForm.agency.trim() || undefined,
      wilayah: accountForm.wilayah.trim() || undefined,
      phone: accountForm.phone.trim() || undefined,
      status: accountForm.status,
      password: accountForm.password.trim() || undefined,
    };

    try {
      if (editingAccount) {
        await adminBhabinService.update(editingAccount.id, payload);
        setAccountAlert({ type: "success", message: "Data akun berhasil diperbarui." });
      } else {
        await adminBhabinService.create(payload);
        setAccountAlert({ type: "success", message: "Akun baru berhasil ditambahkan." });
      }
      await refetchAccounts();
      setAccountModalOpen(false);
      setEditingAccount(null);
      setAccountForm(createEmptyAccountForm());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan akun.";
      setAccountModalAlert({ type: "error", message });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleDeleteAccount = async (account: BhabinAccount) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Hapus akun ${account.nama}?`);
      if (!confirmed) {
        return;
      }
    }
    setDeletingAccountId(account.id);
    setAccountAlert(null);
    try {
      await adminBhabinService.remove(account.id);
      await refetchAccounts();
      setAccountAlert({ type: "success", message: "Akun berhasil dihapus." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus akun.";
      setAccountAlert({ type: "error", message });
    } finally {
      setDeletingAccountId(null);
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-hijau-hutan/30 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-netral">Admin Spesialis</p>
          <h1 className="text-3xl font-semibold text-hijau-hutan">{user?.nama ?? "Admin"}</h1>
          <p className="text-sm text-slate-netral">Kelola laporan lapangan dan koordinasi tugas wilayah Kupang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={isOnline ? "success" : "warning"}>{isOnline ? "Online" : "Offline"}</Badge>
          <Button variant="outline" onClick={logout}>
            <SignOut className="mr-2 h-5 w-5" weight="bold" /> Keluar
          </Button>
        </div>
      </header>

      <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as AdminPanelKey)} className="flex flex-col gap-6">
        <TabsList className="w-full max-w-xl self-start rounded-2xl bg-white/80 p-1">
          <TabsTrigger value="tasks" className="flex-1">Koordinasi Tugas</TabsTrigger>
          <TabsTrigger value="accounts" className="flex-1">Akun Bhabinkamtibmas</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Antrian Laporan</CardTitle>
                <CardDescription>Verifikasi dan beri keputusan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex flex-col gap-2 rounded-2xl border border-abu-kartu p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge className={priorityColor[task.priority]}>{task.priority.toUpperCase()}</Badge>
                      <Badge variant="neutral">Batas {new Date(task.dueDate).toLocaleDateString("id-ID")}</Badge>
                    </div>
                    <p className="text-lg font-semibold text-teks-gelap">{task.title}</p>
                    <p className="text-sm text-slate-netral">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-netral">
                      <Tag className="h-4 w-4 text-hijau-hutan" /> {task.region}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm">
                        <PaperPlaneTilt className="mr-2 h-4 w-4" weight="bold" /> Approve
                      </Button>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-sm text-slate-netral">Belum ada laporan masuk.</p>}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-col gap-3">
                <CardTitle>Buat tugas lapangan</CardTitle>
                <CardDescription>Koordinasikan tindak lanjut bersama Bhabin dan PPL.</CardDescription>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-5 w-5" weight="bold" /> Tugas baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Buat tugas lapangan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-slate-netral">
                      <label className="flex flex-col gap-1">
                        Judul
                        <input
                          className="rounded-2xl border border-abu-kartu px-3 py-2"
                          value={draftTask.title}
                          onChange={(event) => setDraftTask((prev) => ({ ...prev, title: event.target.value }))}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Deskripsi
                        <textarea
                          className="rounded-2xl border border-abu-kartu px-3 py-2"
                          rows={3}
                          value={draftTask.description}
                          onChange={(event) => setDraftTask((prev) => ({ ...prev, description: event.target.value }))}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Wilayah
                        <input
                          className="rounded-2xl border border-abu-kartu px-3 py-2"
                          value={draftTask.region}
                          onChange={(event) => setDraftTask((prev) => ({ ...prev, region: event.target.value }))}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Prioritas
                        <select
                          className="rounded-2xl border border-abu-kartu px-3 py-2"
                          value={draftTask.priority}
                          onChange={(event) => setDraftTask((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
                        >
                          <option value="high">Tinggi</option>
                          <option value="medium">Sedang</option>
                          <option value="low">Rendah</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        Batas Waktu
                        <input
                          type="date"
                          className="rounded-2xl border border-abu-kartu px-3 py-2"
                          value={draftTask.dueDate}
                          onChange={(event) => setDraftTask((prev) => ({ ...prev, dueDate: event.target.value }))}
                        />
                      </label>
                      <Button className="w-full" onClick={handleCreateTask}>
                        Simpan & Tugaskan
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>
          </section>

          <Card className="bg-white">
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Daftar tugas aktif</CardTitle>
                  <CardDescription>Pastikan prioritas tertangani.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-2xl border border-abu-kartu px-4 py-3">
                    <MagnifyingGlass className="h-4 w-4 text-slate-netral" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari tugas"
                      className="flex-1 border-none text-sm outline-none"
                    />
                  </div>
                  <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as typeof selectedStatus)}>
                    <TabsList>
                      <TabsTrigger value="semua">Semua</TabsTrigger>
                      <TabsTrigger value="baru">Baru</TabsTrigger>
                      <TabsTrigger value="proses">Proses</TabsTrigger>
                      <TabsTrigger value="selesai">Selesai</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="outline">
                    <FunnelSimple className="mr-2 h-4 w-4" /> Filter lanjutan
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex flex-col gap-3 rounded-2xl border border-abu-kartu p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-teks-gelap">{task.title}</h3>
                    <Badge className={priorityColor[task.priority]}>{task.priority.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-slate-netral">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-netral">
                    <span>Wilayah: {task.region}</span>
                    <span>Batas: {new Date(task.dueDate).toLocaleDateString("id-ID")}</span>
                    <span>Status: {statusLabel[task.status]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {task.assignedTo.map((person) => (
                      <Badge key={person} variant="neutral">{person}</Badge>
                    ))}
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && <p className="text-sm text-slate-netral">Belum ada tugas sesuai filter.</p>}
            </CardContent>
            <CardFooter className="justify-end text-xs text-slate-netral">Diurutkan berdasarkan prioritas & pembaruan terbaru</CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card className="bg-white">
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Manajemen akun Bhabinkamtibmas</CardTitle>
                  <CardDescription>Tambah atau sesuaikan akses petugas lapangan di wilayah Anda.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={openCreateAccountModal}>
                    <UserPlus className="mr-2 h-5 w-5" weight="bold" /> Tambah akun
                  </Button>
                </div>
              </div>
              {accountAlert && (
                <Alert variant={accountAlert.type === "success" ? "success" : "error"}>{accountAlert.message}</Alert>
              )}
              {!isOnline && (
                <Alert variant="warning">Perubahan akan disimpan lokal dan tersinkron saat koneksi kembali.</Alert>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-abu-kartu px-4 py-3">
                  <MagnifyingGlass className="h-4 w-4 text-slate-netral" />
                  <input
                    value={accountSearch}
                    onChange={(event) => setAccountSearch(event.target.value)}
                    placeholder="Cari nama, email, atau wilayah"
                    className="flex-1 border-none text-sm outline-none"
                  />
                </div>
                <Badge variant="neutral">Total: {bhabinAccounts.length}</Badge>
              </div>

              {isLoadingAccounts ? (
                <p className="text-sm text-slate-netral">Memuat data akun...</p>
              ) : (
                <div className="space-y-3">
                  {filteredAccounts.map((account) => (
                    <div key={account.id} className="flex flex-col gap-3 rounded-2xl border border-abu-kartu p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-teks-gelap">{account.nama}</p>
                          <p className="text-xs text-slate-netral">{account.email}</p>
                        </div>
                        <Badge variant={account.status === "active" ? "success" : "neutral"}>
                          {account.status === "active" ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-netral">
                        {account.agency && <span>Lembaga: {account.agency}</span>}
                        {account.wilayah && <span>Wilayah: {account.wilayah}</span>}
                        {account.phone && <span>Kontak: {account.phone}</span>}
                        <span>
                          Pembaruan: {new Date(account.updatedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditAccountModal(account)}>
                          <PencilSimple className="mr-2 h-4 w-4" weight="bold" /> Ubah
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-transparent text-oranye-hangat hover:bg-oranye-hangat/10"
                          disabled={deletingAccountId === account.id}
                          onClick={() => handleDeleteAccount(account)}
                        >
                          <TrashSimple className="mr-2 h-4 w-4" weight="bold" />\n                          {deletingAccountId === account.id ? "Menghapus..." : "Hapus"}\n                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <p className="text-sm text-slate-netral">Belum ada akun yang cocok dengan pencarian.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog
            open={accountModalOpen}
            onOpenChange={(open) => {
              setAccountModalOpen(open);
              if (!open) {
                setEditingAccount(null);
                setAccountModalAlert(null);
                setAccountForm(createEmptyAccountForm());
              }
            }}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingAccount ? "Ubah akun Bhabin" : "Tambah akun Bhabin"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm text-slate-netral">
                {accountModalAlert && (
                  <Alert variant={accountModalAlert.type === "success" ? "success" : "error"}>{accountModalAlert.message}</Alert>
                )}
                <label className="flex flex-col gap-1">
                  Nama lengkap
                  <input
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    value={accountForm.nama}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, nama: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Email dinas
                  <input
                    type="email"
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    value={accountForm.email}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Lembaga / Polsek
                  <input
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    value={accountForm.agency}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, agency: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Wilayah tugas
                  <input
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    value={accountForm.wilayah}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, wilayah: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Nomor telepon
                  <input
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    value={accountForm.phone}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Kata sandi sementara
                  <input
                    type="password"
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    value={accountForm.password}
                    onChange={(event) => setAccountForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder={editingAccount ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                  />
                  {editingAccount && <span className="text-xs text-slate-netral">Kosongkan jika tidak ingin mengubah kata sandi.</span>}
                </label>
                <label className="flex flex-col gap-1">
                  Status akun
                  <select
                    className="rounded-2xl border border-abu-kartu px-3 py-2"
                    value={accountForm.status}
                    onChange={(event) =>
                      setAccountForm((prev) => ({ ...prev, status: event.target.value === "inactive" ? "inactive" : "active" }))
                    }
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1" onClick={handleSubmitAccount} disabled={isSavingAccount}>
                    {isSavingAccount ? "Menyimpan..." : editingAccount ? "Simpan perubahan" : "Tambah akun"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAccountModalOpen(false)}
                    disabled={isSavingAccount}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AdminSpesialisDashboard;

