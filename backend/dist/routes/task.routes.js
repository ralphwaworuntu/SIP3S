import { Router } from "express";
import { asyncHandler } from "@/middleware/async-handler";
import { createTaskController, listTasksController, updateTaskStatusController } from "@/controllers/task-controller";
export const taskRouter = Router();
taskRouter.get("/", asyncHandler(listTasksController));
taskRouter.post("/", asyncHandler(createTaskController));
taskRouter.patch("/:id/status", asyncHandler(updateTaskStatusController));
