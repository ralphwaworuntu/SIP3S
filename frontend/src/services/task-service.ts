import apiClient from "@/services/http";
import type { Task } from "@/types/task";
import { mockTasks } from "@/utils/mock-data";

class TaskService {
  async list(): Promise<Task[]> {
    try {
      const { data } = await apiClient.get<Task[]>("/tasks");
      return data;
    } catch (error) {
      return mockTasks;
    }
  }

  async assign(task: Task) {
    try {
      const { data } = await apiClient.post<Task>("/tasks", task);
      return data;
    } catch (error) {
      return task;
    }
  }
}

export const taskService = new TaskService();
