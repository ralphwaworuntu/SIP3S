import apiClient from "@/services/http";
import type { Task, TaskStatus } from "@/types/task";
import { mockTasks } from "@/utils/mock-data";

const STORAGE_KEY = "sip3s.tasks";

const cloneTasks = (tasks: Task[]): Task[] => tasks.map((task) => ({ ...task, assignedTo: [...task.assignedTo] }));

const readLocalTasks = (): Task[] => {
  if (typeof window === "undefined") {
    return cloneTasks(mockTasks);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
      return cloneTasks(mockTasks);
    }
    const parsed = JSON.parse(raw) as Task[] | null;
    if (!parsed || !Array.isArray(parsed)) {
      return cloneTasks(mockTasks);
    }
    return cloneTasks(parsed);
  } catch (error) {
    console.warn("Gagal membaca cache tugas", error);
    return cloneTasks(mockTasks);
  }
};

const persistLocalTasks = (tasks: Task[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn("Gagal menyimpan cache tugas", error);
  }
};

class TaskService {
  async list(): Promise<Task[]> {
    try {
      const { data } = await apiClient.get<Task[]>("/tasks");
      persistLocalTasks(data);
      return data;
    } catch (error) {
      return readLocalTasks();
    }
  }

  async assign(task: Task): Promise<Task> {
    try {
      const { data } = await apiClient.post<Task>("/tasks", task);
      const current = readLocalTasks();
      const next = [data, ...current.filter((item) => item.id !== data.id)];
      persistLocalTasks(next);
      return data;
    } catch (error) {
      const fallback = { ...task, updatedAt: new Date().toISOString() };
      const current = readLocalTasks();
      const next = [fallback, ...current.filter((item) => item.id !== fallback.id)];
      persistLocalTasks(next);
      return fallback;
    }
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    try {
      const { data } = await apiClient.patch<Task>(`/tasks/${id}/status`, { status });
      const current = readLocalTasks();
      const next = current.map((item) => (item.id === data.id ? data : item));
      persistLocalTasks(next);
      return data;
    } catch (error) {
      const current = readLocalTasks();
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }
      const updated: Task = { ...current[index], status, updatedAt: new Date().toISOString() };
      const next = current.map((item) => (item.id === id ? updated : item));
      persistLocalTasks(next);
      return updated;
    }
  }
}

export const taskService = new TaskService();
