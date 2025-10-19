import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaretDown,
  FunnelSimple,
  MagnifyingGlass,
  PaperPlaneTilt,
  PencilSimple,
  PlusCircle,
  SignOut,
  Tag,
  TrashSimple,
  UserPlus,
  Broom,
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
import { bhabinService } from "@/services/bhabin-service";
import { taskService } from "@/services/task-service";
import type { BhabinAccount, HarvestVerification, PlantConditionReport, RecipientVerification } from "@/types/bhabin";
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
  const [isWilayahDropdownOpen, setIsWilayahDropdownOpen] = useState(false);
  const [wilayahSearch, setWilayahSearch] = useState("");
  const wilayahDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isTaskWilayahDropdownOpen, setIsTaskWilayahDropdownOpen] = useState(false);
  const [taskWilayahSearch, setTaskWilayahSearch] = useState("");
  const taskWilayahDropdownRef = useRef<HTMLDivElement | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskService.list(),
  });

  const recipientsQuery = useQuery({
    queryKey: ["bhabin-recipients"],
    queryFn: () => bhabinService.listRecipients(),
  });

  const plantProgressQuery = useQuery({
    queryKey: ["bhabin-plant-progress"],
    queryFn: () => bhabinService.listPlantProgress(),
  });

  const harvestQuery = useQuery({
    queryKey: ["bhabin-harvests"],
    queryFn: () => bhabinService.listHarvestVerifications(),
  });

  useEffect(() => {
    if (!isWilayahDropdownOpen) {
      setWilayahSearch("");
    }
  }, [isWilayahDropdownOpen]);

  useEffect(() => {
    if (!isTaskWilayahDropdownOpen) {
      setTaskWilayahSearch("");
    }
  }, [isTaskWilayahDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wilayahDropdownRef.current && !wilayahDropdownRef.current.contains(event.target as Node)) {
        setIsWilayahDropdownOpen(false);
      }
      if (taskWilayahDropdownRef.current && !taskWilayahDropdownRef.current.contains(event.target as Node)) {
        setIsTaskWilayahDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const queueTasks = useMemo(() => filteredTasks.filter((task) => task.status !== "selesai"), [filteredTasks]);

  const wilayahOptions = useMemo(() => {
    const map = new Map<string, string>();
    const push = (value?: string | null) => {
      if (!value) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      map.set(trimmed.toLowerCase(), trimmed);
    };

    bhabinAccounts.forEach((account) => push(account.wilayah));
    recipientsQuery.data?.forEach((item) => push(item.wilayah));
    plantProgressQuery.data?.forEach((item) => push(item.wilayah));
    harvestQuery.data?.forEach((item) => push(item.lokasi));

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "id-ID"));
  }, [bhabinAccounts, recipientsQuery.data, plantProgressQuery.data, harvestQuery.data]);

  const filteredWilayahOptions = useMemo(() => {
    const keyword = wilayahSearch.trim().toLowerCase();
    if (!keyword) return wilayahOptions;
    return wilayahOptions.filter((item) => item.toLowerCase().includes(keyword));
  }, [wilayahOptions, wilayahSearch]);

  const filteredTaskWilayahOptions = useMemo(() => {
    const keyword = taskWilayahSearch.trim().toLowerCase();
    if (!keyword) return wilayahOptions;
    return wilayahOptions.filter((item) => item.toLowerCase().includes(keyword));
  }, [wilayahOptions, taskWilayahSearch]);

  const recipientStats = useMemo(() => {
    const list: RecipientVerification[] = recipientsQuery.data ?? [];
    const verified = list.filter((item) => item.status === "verified");
    const pending = list.filter((item) => item.status === "pending");
    const rejected = list.filter((item) => item.status === "rejected");

    const latestVerifiedAt = verified
      .map((item) => item.verifiedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b ?? "").getTime() - new Date(a ?? "").getTime())[0];

    const recentVerified = verified
      .slice()
      .sort((a, b) => new Date(b.verifiedAt ?? "").getTime() - new Date(a.verifiedAt ?? "").getTime())
      .slice(0, 3);

    return {
      total: list.length,
      verified: verified.length,
      pending: pending.length,
      rejected: rejected.length,
      latestVerifiedAt,
      recentVerified,
    };
  }, [recipientsQuery.data]);

  const plantStats = useMemo(() => {
    const list: PlantConditionReport[] = plantProgressQuery.data ?? [];
    const kondisi = {
      baik: 0,
      waspada: 0,
      kritikal: 0,
    };
    const faseCounter: Record<string, number> = {};

    list.forEach((item) => {
      kondisi[item.kondisi] = (kondisi[item.kondisi] ?? 0) + 1;
      faseCounter[item.fase] = (faseCounter[item.fase] ?? 0) + 1;
    });

    const fase = Object.entries(faseCounter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const latestUpdate = list
      .map((item) => item.updatedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b ?? "").getTime() - new Date(a ?? "").getTime())[0];

    return {
      total: list.length,
      kondisi: {
        baik: kondisi.baik ?? 0,
        waspada: kondisi.waspada ?? 0,
        kritikal: kondisi.kritikal ?? 0,
      },
      fase,
      latestUpdate,
    };
  }, [plantProgressQuery.data]);

  const harvestStats = useMemo(() => {
    const list: HarvestVerification[] = harvestQuery.data ?? [];

    const totalArea = list.reduce((sum, item) => sum + (item.luasPanenHa ?? 0), 0);
    const totalYield = list.reduce((sum, item) => sum + (item.produksiTon ?? 0), 0);

    const latestHarvest = list
      .slice()
      .sort((a, b) => new Date(b.diverifikasiAt ?? "").getTime() - new Date(a.diverifikasiAt ?? "").getTime())[0];

    return {
      total: list.length,
      totalArea,
      totalYield,
      latestHarvest,
    };
  }, [harvestQuery.data]);

  const handleCreateTask = async () => {
    if (!draftTask.title.trim() || !draftTask.region.trim()) {
      setTaskFeedback({ type: "error", message: "Lengkapi judul dan pilih wilayah sebelum menugaskan." });
      return;
    }
    const wilayahTrimmed = draftTask.region.trim();
    const bhabinEmails = bhabinAccounts
      .filter((account) => account.wilayah?.trim().toLowerCase() === wilayahTrimmed.toLowerCase())
      .map((account) => account.email);

    const assignedTo = Array.from(new Set([
      ...bhabinEmails,
      "petugas@kab.kupang.id",
    ])).filter(Boolean);

    const nextTask: Task = {
      id: uuid(),
      title: draftTask.title.trim(),
      description: draftTask.description.trim(),
      region: wilayahTrimmed,
      dueDate: draftTask.dueDate,
      priority: draftTask.priority,
      status: "baru",
      assignedTo: assignedTo.length > 0 ? assignedTo : ["petugas@kab.kupang.id"],
      updatedAt: new Date().toISOString(),
    };

    setIsSavingTask(true);
    setTaskFeedback(null);
    try {
      const created = await taskService.assign(nextTask);
      setTaskFeedback({
        type: "success",
        message: `Tugas "${created.title}" berhasil ditugaskan.`,
      });
      setDraftTask({ title: "", description: "", region: "", priority: "medium", dueDate: new Date().toISOString().slice(0, 10) });
      setIsTaskWilayahDropdownOpen(false);
      refetch();
    } catch (error) {
      console.error("Gagal membuat tugas", error);
      setTaskFeedback({ type: "error", message: "Gagal menyimpan tugas. Coba lagi nanti." });
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleClearCache = async () => {
    const confirmed = window.confirm(
      "Bersihkan cache aplikasi ini? Service worker, cache offline, dan data lokal akan dihapus lalu halaman dimuat ulang."
    );
    if (!confirmed) {
      return;
    }
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }
      const STORAGE_KEYS = [
        "sip3s.admin.bhabin.accounts",
        "sip3s.bhabin.recipients",
        "sip3s.bhabin.plant",
        "sip3s.bhabin.harvest",
        "sip3s.bhabin.escort",
        "sip3s.pendingReports",
      ];
      STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      alert("Cache aplikasi telah dibersihkan. Halaman akan dimuat ulang.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear cache", error);
      alert("Gagal membersihkan cache. Harap bersihkan cache browser secara manual.");
    }
  }

  const handleTaskStatusChange = async (task: Task, status: TaskStatus) => {
    setTaskFeedback(null);
    setUpdatingTaskId(task.id);
    try {
      const updated = await taskService.updateStatus(task.id, status);
      if (!updated) {
        throw new Error("Tugas tidak ditemukan");
      }
      setTaskFeedback({
        type: "success",
        message: status === "selesai"
          ? `Tugas "${task.title}" disetujui.`
          : `Tugas "${task.title}" ditandai untuk ditinjau.`,
      });
      refetch();
    } catch (error) {
      console.error("Gagal memperbarui status tugas", error);
      setTaskFeedback({ type: "error", message: "Gagal memperbarui status tugas." });
    } finally {
      setUpdatingTaskId(null);
    }
  };

;

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
          <p className="text-sm text-slate-netral">Admin Polres Kupang</p>
          <h1 className="text-3xl font-semibold text-hijau-hutan">{user?.nama ?? "Admin"}</h1>
          <p className="text-sm text-slate-netral">Kelola laporan lapangan dan koordinasi tugas wilayah Kupang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleClearCache} className="flex items-center gap-2">
            <Broom className="h-4 w-4" weight="bold" />
            <span>Bersihkan Cache</span>
          </Button>
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
          {taskFeedback && (
            <Alert variant={taskFeedback.type === "success" ? "success" : "error"}>{taskFeedback.message}</Alert>
          )}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Distribusi Produk Subsidi</CardTitle>
                <CardDescription>Akumulasi verifikasi dari seluruh Bhabinkamtibmas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-netral">
                <div className="flex items-center justify-between">
                  <span>Total penerima</span>
                  <span className="text-lg font-semibold text-teks-gelap">{recipientStats.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-2xl border border-hijau-hutan/30 px-3 py-2">
                    <span>Diverifikasi</span>
                    <Badge variant="success">{recipientStats.verified.toLocaleString("id-ID")}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-biru-pemerintah/30 px-3 py-2">
                    <span>Menunggu</span>
                    <Badge variant="neutral">{recipientStats.pending.toLocaleString("id-ID")}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-oranye/30 px-3 py-2">
                    <span>Ditolak</span>
                    <Badge variant="warning">{recipientStats.rejected.toLocaleString("id-ID")}</Badge>
                  </div>
                </div>
                {recipientsQuery.isLoading ? (
                  <p className="text-xs text-slate-netral">Memuat data penerima</p>
                ) : (
                  <>
                    {recipientStats.latestVerifiedAt && (
                      <p className="text-xs text-slate-netral">
                        Verifikasi terbaru:{" "}
                        {new Date(recipientStats.latestVerifiedAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    {recipientStats.recentVerified.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-teks-gelap">Penerima terbaru</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          {recipientStats.recentVerified.map((recipient) => (
                            <li key={recipient.id} className="flex justify-between rounded-xl bg-abu-kartu/20 px-3 py-2">
                              <span>{recipient.nama}</span>
                              <span className="text-slate-netral">{recipient.komoditas}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Kondisi Tanaman</CardTitle>
                <CardDescription>Ringkasan laporan perkembangan lapangan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-netral">
                <div className="flex items-center justify-between">
                  <span>Total laporan</span>
                  <span className="text-lg font-semibold text-teks-gelap">{plantStats.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-2xl border border-hijau-hutan/30 px-3 py-2">
                    <span>Baik</span>
                    <Badge variant="success">{plantStats.kondisi.baik.toLocaleString("id-ID")}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-biru-pemerintah/30 px-3 py-2">
                    <span>Perlu perhatian</span>
                    <Badge variant="neutral">{plantStats.kondisi.waspada.toLocaleString("id-ID")}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-oranye/30 px-3 py-2">
                    <span>Kritikal</span>
                    <Badge variant="warning">{plantStats.kondisi.kritikal.toLocaleString("id-ID")}</Badge>
                  </div>
                </div>
                {plantProgressQuery.isLoading ? (
                  <p className="text-xs text-slate-netral">Memuat laporan tanaman</p>
                ) : plantStats.latestUpdate ? (
                  <p className="text-xs text-slate-netral">
                    Update terakhir:{" "}
                    {new Date(plantStats.latestUpdate).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                ) : (
                  <p className="text-xs text-slate-netral">Belum ada laporan tanaman.</p>
                )}
                {plantStats.fase.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-teks-gelap">Fase paling sering</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      {plantStats.fase.map(([fase, count]) => (
                        <li key={fase} className="flex justify-between rounded-xl bg-abu-kartu/20 px-3 py-2">
                          <span>{fase}</span>
                          <span className="text-slate-netral">{count.toLocaleString("id-ID")} laporan</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Verifikasi Hasil Panen</CardTitle>
                <CardDescription>Ikhtisar panen yang diverifikasi lapangan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-netral">
                <div className="flex items-center justify-between">
                  <span>Total verifikasi</span>
                  <span className="text-lg font-semibold text-teks-gelap">{harvestStats.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="rounded-2xl border border-abu-kartu px-3 py-2">
                  <p className="text-xs text-slate-netral">Akumulasi luas panen</p>
                  <p className="text-lg font-semibold text-teks-gelap">
                    {harvestStats.totalArea.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ha
                  </p>
                </div>
                <div className="rounded-2xl border border-abu-kartu px-3 py-2">
                  <p className="text-xs text-slate-netral">Total produksi</p>
                  <p className="text-lg font-semibold text-teks-gelap">
                    {harvestStats.totalYield.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ton
                  </p>
                </div>
                {harvestQuery.isLoading ? (
                  <p className="text-xs text-slate-netral">Memuat data panen</p>
                ) : harvestStats.latestHarvest ? (
                  <div className="rounded-2xl bg-abu-kartu/20 px-3 py-2 text-xs">
                    <p className="font-medium text-teks-gelap">{harvestStats.latestHarvest.petani}</p>
                    <p className="text-slate-netral">{harvestStats.latestHarvest.komoditas}</p>
                    <p className="text-slate-netral">
                      Diverifikasi:{" "}
                      {new Date(harvestStats.latestHarvest.diverifikasiAt ?? "").toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-netral">Belum ada verifikasi panen.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Antrian Laporan</CardTitle>
                <CardDescription>Verifikasi dan beri keputusan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {queueTasks.slice(0, 3).map((task) => (
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
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={updatingTaskId === task.id}
                        onClick={() => handleTaskStatusChange(task, "selesai")}
                      >
                        <PaperPlaneTilt className="mr-2 h-4 w-4" weight="bold" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingTaskId === task.id}
                        onClick={() => handleTaskStatusChange(task, "proses")}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                {queueTasks.length === 0 && <p className="text-sm text-slate-netral">Belum ada laporan masuk.</p>}
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
                        <div ref={taskWilayahDropdownRef} className="relative">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-2xl border border-abu-kartu px-3 py-2 text-left text-sm transition hover:border-biru-pemerintah/40"
                            onClick={() => setIsTaskWilayahDropdownOpen((prev) => !prev)}
                          >
                            <span className={draftTask.region ? "text-teks-gelap" : "text-slate-netral"}>
                              {draftTask.region || "Pilih kelurahan/desa"}
                            </span>
                            <CaretDown className={`h-4 w-4 text-slate-netral transition ${isTaskWilayahDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isTaskWilayahDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full rounded-2xl border border-abu-kartu bg-white shadow-lg">
                              <div className="border-b border-abu-kartu px-3 py-2">
                                <input
                                  autoFocus
                                  value={taskWilayahSearch}
                                  onChange={(event) => setTaskWilayahSearch(event.target.value)}
                                  placeholder="Cari kelurahan/desa"
                                  className="w-full rounded-xl border border-abu-kartu px-3 py-2 text-sm outline-none focus:border-biru-pemerintah"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto py-1">
                                {filteredTaskWilayahOptions.length > 0 ? (
                                  filteredTaskWilayahOptions.map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      className="w-full px-3 py-2 text-left text-sm text-slate-netral hover:bg-biru-pemerintah/10"
                                      onClick={() => {
                                        setDraftTask((prev) => ({ ...prev, region: option }));
                                        setIsTaskWilayahDropdownOpen(false);
                                      }}
                                    >
                                      {option}
                                    </button>
                                  ))
                                ) : (
                                  <p className="px-3 py-2 text-xs text-slate-netral">Wilayah tidak ditemukan.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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
                      <Button className="w-full" onClick={handleCreateTask} disabled={isSavingTask}>
                        {isSavingTask ? "Menyimpan..." : "Simpan & Tugaskan"}
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
                  Wilayah
                  <div ref={wilayahDropdownRef} className="relative">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl border border-abu-kartu px-3 py-2 text-left text-sm transition hover:border-biru-pemerintah/40"
                      onClick={() => setIsWilayahDropdownOpen((prev) => !prev)}
                    >
                      <span className={draftTask.region ? "text-teks-gelap" : "text-slate-netral"}>
                        {draftTask.region || "Pilih kelurahan/desa"}
                      </span>
                      <CaretDown className={`h-4 w-4 text-slate-netral transition ${isWilayahDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isWilayahDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-2xl border border-abu-kartu bg-white shadow-lg">
                        <div className="border-b border-abu-kartu px-3 py-2">
                          <input
                            autoFocus
                            value={wilayahSearch}
                            onChange={(event) => setWilayahSearch(event.target.value)}
                            placeholder="Cari kelurahan/desa"
                            className="w-full rounded-xl border border-abu-kartu px-3 py-2 text-sm outline-none focus:border-biru-pemerintah"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto py-1">
                          {filteredWilayahOptions.length > 0 ? (
                            filteredWilayahOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm text-slate-netral hover:bg-biru-pemerintah/10"
                                onClick={() => {
                                  setDraftTask((prev) => ({ ...prev, region: option }));
                                  setIsWilayahDropdownOpen(false);
                                }}
                              >
                                {option}
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-2 text-xs text-slate-netral">Wilayah tidak ditemukan.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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


