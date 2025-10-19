import { v4 as uuid } from "uuid";

import { BhabinAccountService } from "@/services/bhabin-account-service";
import { TaskService } from "@/services/task-service";
import { SuperAdminRepository } from "@/repositories/super-admin-repository";
import type {
  BhabinAccount,
  BhabinAccountPayload,
  EscortRequest,
  EscortRequestPayload,
  EscortStatus,
  HarvestVerification,
  HarvestVerificationPayload,
  PlantConditionPayload,
  PlantConditionReport,
  RecipientVerification,
  RecipientVerificationPayload,
} from "@/types/bhabin";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

interface TaskPayload {
  title: string;
  description: string;
  region: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string[];
}

export class SuperAdminService {
  private readonly taskService = new TaskService();

  private readonly bhabinAccountService = new BhabinAccountService();

  private readonly repository = new SuperAdminRepository();

  async getOverview() {
    const [tasks, recipients, plantReports, harvests, escortRequests, accounts] = await Promise.all([
      this.taskService.list(),
      this.repository.listRecipients(),
      this.repository.listPlantReports(),
      this.repository.listHarvestVerifications(),
      this.repository.listEscortRequests(),
      this.bhabinAccountService.listAccounts(),
    ]);

    return {
      totals: {
        tasks: tasks.length,
        recipients: recipients.length,
        plantReports: plantReports.length,
        harvestVerifications: harvests.length,
        escortRequests: escortRequests.length,
        bhabinAccounts: accounts.length,
      },
      pending: {
        tasks: tasks.filter((task) => task.status !== "selesai").length,
        recipients: recipients.filter((item) => item.status === "pending").length,
        escortRequests: escortRequests.filter((item) => item.status === "baru" || item.status === "dijadwalkan").length,
      },
    };
  }

  async listTasks(): Promise<Task[]> {
    return this.taskService.list();
  }

  async createTask(payload: TaskPayload): Promise<Task> {
    const record: Task = {
      id: uuid(),
      title: payload.title,
      description: payload.description,
      region: payload.region,
      dueDate: payload.dueDate,
      priority: payload.priority,
      status: payload.status,
      assignedTo: payload.assignedTo,
      updatedAt: new Date().toISOString(),
    };
    return this.taskService.create(record);
  }

  async updateTask(id: string, payload: Partial<TaskPayload>): Promise<Task | null> {
    const currentTask = (await this.taskService.list()).find((task) => task.id === id);
    if (!currentTask) {
      return null;
    }
    const next: Task = {
      ...currentTask,
      title: payload.title ?? currentTask.title,
      description: payload.description ?? currentTask.description,
      region: payload.region ?? currentTask.region,
      dueDate: payload.dueDate ?? currentTask.dueDate,
      priority: payload.priority ?? currentTask.priority,
      status: payload.status ?? currentTask.status,
      assignedTo: payload.assignedTo ?? currentTask.assignedTo,
    };
    return this.taskService.update(next);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return this.taskService.updateStatus(id, status);
  }

  async removeTask(id: string): Promise<void> {
    await this.taskService.remove(id);
  }

  async listRecipients(): Promise<RecipientVerification[]> {
    return this.repository.listRecipients();
  }

  async updateRecipient(id: string, payload: RecipientVerificationPayload): Promise<RecipientVerification> {
    return this.repository.updateRecipient(id, payload);
  }

  async listPlantReports(): Promise<PlantConditionReport[]> {
    return this.repository.listPlantReports();
  }

  async createPlantReport(payload: PlantConditionPayload): Promise<PlantConditionReport> {
    return this.repository.createPlantReport(payload);
  }

  async updatePlantReport(id: string, payload: Partial<PlantConditionPayload>): Promise<PlantConditionReport> {
    return this.repository.updatePlantReport(id, payload);
  }

  async removePlantReport(id: string): Promise<void> {
    await this.repository.removePlantReport(id);
  }

  async listHarvestVerifications(): Promise<HarvestVerification[]> {
    return this.repository.listHarvestVerifications();
  }

  async createHarvestVerification(payload: HarvestVerificationPayload): Promise<HarvestVerification> {
    return this.repository.createHarvestVerification(payload);
  }

  async updateHarvestVerification(
    id: string,
    payload: Partial<HarvestVerificationPayload>
  ): Promise<HarvestVerification> {
    return this.repository.updateHarvestVerification(id, payload);
  }

  async removeHarvestVerification(id: string): Promise<void> {
    await this.repository.removeHarvestVerification(id);
  }

  async listEscortRequests(): Promise<EscortRequest[]> {
    return this.repository.listEscortRequests();
  }

  async createEscortRequest(payload: EscortRequestPayload): Promise<EscortRequest> {
    return this.repository.createEscortRequest(payload);
  }

  async updateEscortRequest(
    id: string,
    payload: Partial<EscortRequestPayload> & { status?: EscortStatus }
  ): Promise<EscortRequest> {
    return this.repository.updateEscortRequest(id, payload);
  }

  async removeEscortRequest(id: string): Promise<void> {
    await this.repository.removeEscortRequest(id);
  }

  async listBhabinAccounts(): Promise<BhabinAccount[]> {
    return this.bhabinAccountService.listAccounts();
  }

  async createBhabinAccount(payload: BhabinAccountPayload): Promise<BhabinAccount> {
    return this.bhabinAccountService.createAccount(payload);
  }

  async updateBhabinAccount(id: string, payload: BhabinAccountPayload): Promise<BhabinAccount> {
    return this.bhabinAccountService.updateAccount(id, payload);
  }

  async deleteBhabinAccount(id: string): Promise<void> {
    await this.bhabinAccountService.deleteAccount(id);
  }
}

