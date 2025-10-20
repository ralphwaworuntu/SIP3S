import { v4 as uuid } from "uuid";
import { getPool, pingDatabase } from "@/config/database";
import { logger } from "@/utils/logger";
import { mockTasks } from "@/repositories/mock-storage";
export class TaskService {
    async list() {
        const useDatabase = await pingDatabase();
        if (useDatabase) {
            try {
                const pool = getPool();
                const [rows] = await pool.query("SELECT * FROM tasks ORDER BY updated_at DESC LIMIT 100");
                return rows.map((row) => ({
                    id: row.id,
                    region: row.region,
                    dueDate: row.due_date,
                    priority: row.priority,
                    status: row.status,
                    title: row.title,
                    description: row.description,
                    assignedTo: row.assigned_to.split(","),
                    updatedAt: row.updated_at,
                }));
            }
            catch (error) {
                logger.error({ err: error }, "Gagal mengambil tugas dari database");
            }
        }
        return mockTasks;
    }
    async create(task) {
        const useDatabase = await pingDatabase();
        const data = { ...task, id: task.id || uuid(), updatedAt: new Date().toISOString() };
        if (useDatabase) {
            try {
                const pool = getPool();
                await pool.query("INSERT INTO tasks (id, region, due_date, priority, status, title, description, assigned_to, updated_at) VALUES (?,?,?,?,?,?,?,?,?)", [
                    data.id,
                    data.region,
                    data.dueDate,
                    data.priority,
                    data.status,
                    data.title,
                    data.description,
                    data.assignedTo.join(","),
                    data.updatedAt,
                ]);
            }
            catch (error) {
                logger.error({ err: error }, "Gagal menyimpan tugas ke database");
            }
        }
        else {
            const existingIndex = mockTasks.findIndex((item) => item.id === data.id);
            if (existingIndex !== -1) {
                mockTasks.splice(existingIndex, 1, data);
            }
            else {
                mockTasks.unshift(data);
            }
        }
        return data;
    }
    async updateStatus(id, status) {
        const useDatabase = await pingDatabase();
        const updatedAt = new Date().toISOString();
        if (useDatabase) {
            try {
                const pool = getPool();
                await pool.query("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?", [status, updatedAt, id]);
                const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [id]);
                const row = rows.at(0);
                if (row) {
                    return {
                        id: row.id,
                        region: row.region,
                        dueDate: row.due_date,
                        priority: row.priority,
                        status: row.status,
                        title: row.title,
                        description: row.description,
                        assignedTo: row.assigned_to.split(","),
                        updatedAt: row.updated_at,
                    };
                }
            }
            catch (error) {
                logger.error({ err: error }, "Gagal memperbarui status tugas");
            }
        }
        const target = mockTasks.find((item) => item.id === id);
        if (target) {
            target.status = status;
            target.updatedAt = updatedAt;
            return target;
        }
        return null;
    }
    async update(task) {
        const useDatabase = await pingDatabase();
        const updatedAt = new Date().toISOString();
        const data = {
            ...task,
            updatedAt,
        };
        if (useDatabase) {
            try {
                const pool = getPool();
                await pool.query("UPDATE tasks SET region = ?, due_date = ?, priority = ?, status = ?, title = ?, description = ?, assigned_to = ?, updated_at = ? WHERE id = ?", [
                    data.region,
                    data.dueDate,
                    data.priority,
                    data.status,
                    data.title,
                    data.description,
                    data.assignedTo.join(","),
                    data.updatedAt,
                    data.id,
                ]);
                return data;
            }
            catch (error) {
                logger.error({ err: error }, "Gagal memperbarui tugas");
            }
        }
        const index = mockTasks.findIndex((item) => item.id === data.id);
        if (index !== -1) {
            mockTasks[index] = data;
            return data;
        }
        return null;
    }
    async remove(id) {
        const useDatabase = await pingDatabase();
        if (useDatabase) {
            try {
                const pool = getPool();
                await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
            }
            catch (error) {
                logger.error({ err: error }, "Gagal menghapus tugas");
            }
        }
        const index = mockTasks.findIndex((task) => task.id === id);
        if (index !== -1) {
            mockTasks.splice(index, 1);
        }
    }
}
