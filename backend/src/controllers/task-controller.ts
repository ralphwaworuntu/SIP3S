import Joi from "joi";
import type { Request, Response } from "express";

import { TaskService } from "@/services/task-service";
import type { TaskPriority, TaskStatus } from "@/types/task";

const service = new TaskService();

export const listTasksController = async (_req: Request, res: Response) => {
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

export const createTaskController = async (req: Request, res: Response) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const task = await service.create({
    id: value.id,
    region: value.region,
    dueDate: value.dueDate,
    priority: value.priority as TaskPriority,
    status: value.status as TaskStatus,
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

export const updateTaskStatusController = async (req: Request, res: Response) => {
  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const task = await service.updateStatus(req.params.id, value.status as TaskStatus);
  if (!task) {
    res.status(404).json({ message: "Tugas tidak ditemukan" });
    return;
  }
  res.json(task);
};
