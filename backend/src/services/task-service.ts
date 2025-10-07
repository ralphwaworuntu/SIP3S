import type { RowDataPacket } from "mysql2";
import { v4 as uuid } from "uuid";

import { getPool, pingDatabase } from "@/config/database";
import { logger } from "@/utils/logger";
import { mockTasks } from "@/repositories/mock-storage";
import type { Task } from "@/types/task";

interface TaskRow extends RowDataPacket {
  id: string;
  region: string;
  due_date: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  assigned_to: string;
  updated_at: string;
}

export class TaskService {
  async list(): Promise<Task[]> {
    const useDatabase = await pingDatabase();
    if (useDatabase) {
      try {
        const pool = getPool();
        const [rows] = await pool.query<TaskRow[]>("SELECT * FROM tasks ORDER BY updated_at DESC LIMIT 100");
        return rows.map((row) => ({
          id: row.id,
          region: row.region,
          dueDate: row.due_date,
          priority: row.priority as Task["priority"],
          status: row.status as Task["status"],
          title: row.title,
          description: row.description,
          assignedTo: row.assigned_to.split(","),
          updatedAt: row.updated_at,
        }));
      } catch (error) {
        logger.error({ err: error }, "Gagal mengambil tugas dari database");
      }
    }
    return mockTasks;
  }

  async create(task: Task): Promise<Task> {
    const useDatabase = await pingDatabase();
    const data = { ...task, id: task.id || uuid(), updatedAt: new Date().toISOString() };
    if (useDatabase) {
      try {
        const pool = getPool();
        await pool.query(
          "INSERT INTO tasks (id, region, due_date, priority, status, title, description, assigned_to, updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
          [
            data.id,
            data.region,
            data.dueDate,
            data.priority,
            data.status,
            data.title,
            data.description,
            data.assignedTo.join(","),
            data.updatedAt,
          ]
        );
      } catch (error) {
        logger.error({ err: error }, "Gagal menyimpan tugas ke database");
      }
    } else {
      mockTasks.unshift(data);
    }
    return data;
  }
}
