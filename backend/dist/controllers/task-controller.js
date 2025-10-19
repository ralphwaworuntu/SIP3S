import Joi from "joi";
import { TaskService } from "@/services/task-service";
const service = new TaskService();
export const listTasksController = async (_req, res) => {
    const tasks = await service.list();
    res.json(tasks);
};
const createSchema = Joi.object({
    id: Joi.string().optional(),
    region: Joi.string().required(),
    dueDate: Joi.string().isoDate().required(),
    priority: Joi.string().valid("low", "medium", "high").required(),
    status: Joi.string().valid("baru", "proses", "selesai").required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    assignedTo: Joi.array().items(Joi.string().email()).min(1).required(),
});
export const createTaskController = async (req, res) => {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const task = await service.create({
        id: value.id,
        region: value.region,
        dueDate: value.dueDate,
        priority: value.priority,
        status: value.status,
        title: value.title,
        description: value.description,
        assignedTo: value.assignedTo,
        updatedAt: new Date().toISOString(),
    });
    res.status(201).json(task);
};
const updateStatusSchema = Joi.object({
    status: Joi.string().valid("baru", "proses", "selesai").required(),
});
export const updateTaskStatusController = async (req, res) => {
    const { error, value } = updateStatusSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const task = await service.updateStatus(req.params.id, value.status);
    if (!task) {
        res.status(404).json({ message: "Tugas tidak ditemukan" });
        return;
    }
    res.json(task);
};
