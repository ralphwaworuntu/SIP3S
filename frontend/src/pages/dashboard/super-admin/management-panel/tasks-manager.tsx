import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin-service";
import type { SuperAdminTask, SuperAdminTaskPayload, SuperAdminTaskUpdatePayload } from "@/types/super-admin";
import type { TaskPriority, TaskStatus } from "@/types/task";

import {
  Feedback,
  inputClass,
  resolveErrorMessage,
  selectClass,
  textareaClass,
  toDateInputValue,
  formatDate,
  formatDateTime,
} from "./helpers";

const TASK_STATUS_OPTIONS: TaskStatus[] = ["baru", "proses", "selesai"];
const TASK_PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"];

const taskStatusBadge: Record<TaskStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  baru: { label: "Baru", variant: "warning" },
  proses: { label: "Dalam Proses", variant: "neutral" },
  selesai: { label: "Selesai", variant: "success" },
};

interface TaskFormState {
  title: string;
  description: string;
  region: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
}

const emptyTaskForm: TaskFormState = {
  title: "",
  description: "",
  region: "",
  dueDate: "",
  priority: "medium",
  status: "baru",
  assignedTo: "",
};

export const TaskManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TaskFormState>(emptyTaskForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const tasksQuery = useQuery({
    queryKey: ["super-admin", "tasks"],
    queryFn: () => superAdminService.listTasks(),
  });

  const tasks = useMemo<SuperAdminTask[]>(() => {
    const list = tasksQuery.data ?? [];
    return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasksQuery.data]);

  const resetForm = () => {
    setForm(emptyTaskForm);
    setEditingId(null);
  };

  const updateField =
    (key: keyof TaskFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const createMutation = useMutation({
    mutationFn: (payload: SuperAdminTaskPayload) => superAdminService.createTask(payload),
    onMutate: () => setFeedback(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "tasks"] });
      setFeedback({ type: "success", message: "Tugas baru berhasil ditambahkan." });
      resetForm();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menambahkan tugas baru.") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuperAdminTaskUpdatePayload }) =>
      superAdminService.updateTask(id, payload),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "tasks"] });
      setFeedback({ type: "success", message: "Tugas berhasil diperbarui." });
      if (editingId === variables.id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal memperbarui tugas.") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminService.deleteTask(id),
    onMutate: () => setFeedback(null),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "tasks"] });
      setFeedback({ type: "success", message: "Tugas dihapus." });
      if (editingId === id) {
        resetForm();
      }
    },
    onError: (error) => {
      setFeedback({ type: "error", message: resolveErrorMessage(error, "Gagal menghapus tugas.") });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const assignedEmails = form.assignedTo
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (assignedEmails.length === 0) {
      setFeedback({ type: "error", message: "Minimal satu email petugas harus diisi." });
      return;
    }
    if (!form.dueDate) {
      setFeedback({ type: "error", message: "Tanggal jatuh tempo wajib diisi." });
      return;
    }
    const payload: SuperAdminTaskPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      region: form.region.trim(),
      dueDate: new Date(form.dueDate).toISOString(),
      priority: form.priority,
      status: form.status,
      assignedTo: assignedEmails,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (task: SuperAdminTask) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      region: task.region,
      dueDate: toDateInputValue(task.dueDate),
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo.join(", "),
    });
    setFeedback({ type: "info", message: `Mengubah tugas "${task.title}".` });
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
            Judul tugas
            <input
              className={inputClass}
              value={form.title}
              onChange={updateField("title")}
              placeholder="Contoh: Monitoring distribusi benih Nagekeo"
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Wilayah penugasan
            <input
              className={inputClass}
              value={form.region}
              onChange={updateField("region")}
              placeholder="Kabupaten / Kecamatan"
              required
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Jatuh tempo
            <input className={inputClass} type="date" value={form.dueDate} onChange={updateField("dueDate")} required />
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Prioritas
            <select className={selectClass} value={form.priority} onChange={updateField("priority")}>
              {TASK_PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === "low" ? "Rendah" : priority === "medium" ? "Menengah" : "Tinggi"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-teks-gelap">
            Status
            <select className={selectClass} value={form.status} onChange={updateField("status")}>
              {TASK_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {taskStatusBadge[status].label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-teks-gelap sm:col-span-2">
            Penjelasan tugas
            <textarea
              className={textareaClass}
              rows={3}
              value={form.description}
              onChange={updateField("description")}
              placeholder="Catatan koordinasi lintas instansi"
            />
          </label>
        </div>
        <label className="space-y-1 text-sm font-medium text-teks-gelap">
          Email petugas (pisahkan dengan koma)
          <textarea
            className={textareaClass}
            rows={2}
            value={form.assignedTo}
            onChange={updateField("assignedTo")}
            placeholder="contoh1@polri.go.id, contoh2@pertanian.go.id"
            required
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {editingId ? "Simpan perubahan" : "Tambah tugas"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Batalkan
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {tasksQuery.isLoading ? (
          <p className="text-sm text-slate-netral">Memuat daftar tugas...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-slate-netral">Belum ada tugas yang terdaftar.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="rounded-3xl border border-abu-kartu bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-teks-gelap">{task.title}</p>
                  <p className="text-xs text-slate-netral">{task.region}</p>
                </div>
                <Badge variant={taskStatusBadge[task.status].variant}>{taskStatusBadge[task.status].label}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-netral">{task.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-netral">
                <span>Jatuh tempo: {formatDate(task.dueDate)}</span>
                <span>Terakhir diupdate: {formatDateTime(task.updatedAt)}</span>
                <span>Penanggung jawab: {task.assignedTo.join(", ")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(task)}>
                  Ubah
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(task.id)}
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
