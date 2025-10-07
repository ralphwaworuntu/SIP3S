import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarBlank, MapPinLine, UsersThree } from "@phosphor-icons/react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import { taskService } from "@/services/task-service";
import type { Task } from "@/types/task";

const statusCopy: Record<Task["status"], { label: string; variant: "success" | "warning" | "neutral" }> = {
  baru: { label: "Baru", variant: "warning" },
  proses: { label: "Proses", variant: "neutral" },
  selesai: { label: "Selesai", variant: "success" },
};

const priorityLabel: Record<Task["priority"], string> = {
  low: "Prioritas rendah",
  medium: "Prioritas sedang",
  high: "Prioritas tinggi",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

const BhabinTasksPage = () => {
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "bhabin"],
    queryFn: () => taskService.list(),
  });

  const assignedTasks = useMemo(() => {
    if (!user?.email) return tasks;
    return tasks.filter((task) => task.assignedTo.includes(user.email));
  }, [tasks, user?.email]);

  const jointTasks = useMemo(() => assignedTasks.filter((task) => task.assignedTo.length > 1), [assignedTasks]);
  const personalTasks = useMemo(() => assignedTasks.filter((task) => task.assignedTo.length === 1), [assignedTasks]);

  return (
    <section className="space-y-4">
      {!isOnline && (
        <Alert variant="warning">Data tugas diambil dari cache. Periksa kembali saat koneksi sudah normal.</Alert>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Tugas prioritas Bhabinkamtibmas</CardTitle>
          <CardDescription>Koordinasikan dengan PPL dan petugas lapangan sesuai wilayah penugasan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-netral">
          {isLoading ? (
            <p>Memuat daftar tugas...</p>
          ) : assignedTasks.length === 0 ? (
            <p>Belum ada tugas yang ditetapkan untuk Anda.</p>
          ) : (
            assignedTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-abu-kartu p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-teks-gelap">{task.title}</p>
                    <p className="text-xs text-slate-netral">{priorityLabel[task.priority]}</p>
                  </div>
                  <Badge variant={statusCopy[task.status].variant}>{statusCopy[task.status].label}</Badge>
                </div>
                <p className="mt-2 text-sm">{task.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-netral">
                  <span className="inline-flex items-center gap-1"><MapPinLine weight="bold" className="h-4 w-4" /> {task.region}</span>
                  <span className="inline-flex items-center gap-1"><CalendarBlank weight="bold" className="h-4 w-4" /> {formatDate(task.dueDate)}</span>
                  {task.assignedTo.length > 1 && (
                    <span className="inline-flex items-center gap-1 text-biru-pemerintah">
                      <UsersThree weight="bold" className="h-4 w-4" /> Kerja tim lintas instansi
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Tugas kolaboratif</CardTitle>
            <CardDescription>Libatkan PPL atau petugas lapangan untuk percepatan tindakan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-netral">
            {jointTasks.length === 0 ? (
              <p>Tidak ada tugas gabungan yang aktif.</p>
            ) : (
              jointTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-abu-kartu/70 p-3">
                  <p className="font-medium text-teks-gelap">{task.title}</p>
                  <p className="text-xs">Update terakhir: {new Date(task.updatedAt).toLocaleString("id-ID")}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Tugas mandiri</CardTitle>
            <CardDescription>Fokus pada pengecekan lapangan harian.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-netral">
            {personalTasks.length === 0 ? (
              <p>Semua tugas saat ini bersifat kolaboratif.</p>
            ) : (
              personalTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-abu-kartu p-3">
                  <p className="font-medium text-teks-gelap">{task.title}</p>
                  <p className="text-xs">Target selesai: {formatDate(task.dueDate)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BhabinTasksPage;
