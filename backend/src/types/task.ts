export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "baru" | "proses" | "selesai";

export interface Task {
  id: string;
  region: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
  description: string;
  assignedTo: string[];
  updatedAt: string;
}
