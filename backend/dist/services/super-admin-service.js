import { v4 as uuid } from "uuid";
import { BhabinAccountService } from "@/services/bhabin-account-service";
import { TaskService } from "@/services/task-service";
import { SuperAdminRepository } from "@/repositories/super-admin-repository";
export class SuperAdminService {
    constructor() {
        this.taskService = new TaskService();
        this.bhabinAccountService = new BhabinAccountService();
        this.repository = new SuperAdminRepository();
    }
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
    async listTasks() {
        return this.taskService.list();
    }
    async createTask(payload) {
        const record = {
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
    async updateTask(id, payload) {
        const currentTask = (await this.taskService.list()).find((task) => task.id === id);
        if (!currentTask) {
            return null;
        }
        const next = {
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
    async updateTaskStatus(id, status) {
        return this.taskService.updateStatus(id, status);
    }
    async removeTask(id) {
        await this.taskService.remove(id);
    }
    async listRecipients() {
        return this.repository.listRecipients();
    }
    async updateRecipient(id, payload) {
        return this.repository.updateRecipient(id, payload);
    }
    async listPlantReports() {
        return this.repository.listPlantReports();
    }
    async createPlantReport(payload) {
        return this.repository.createPlantReport(payload);
    }
    async updatePlantReport(id, payload) {
        return this.repository.updatePlantReport(id, payload);
    }
    async removePlantReport(id) {
        await this.repository.removePlantReport(id);
    }
    async listHarvestVerifications() {
        return this.repository.listHarvestVerifications();
    }
    async createHarvestVerification(payload) {
        return this.repository.createHarvestVerification(payload);
    }
    async updateHarvestVerification(id, payload) {
        return this.repository.updateHarvestVerification(id, payload);
    }
    async removeHarvestVerification(id) {
        await this.repository.removeHarvestVerification(id);
    }
    async listEscortRequests() {
        return this.repository.listEscortRequests();
    }
    async createEscortRequest(payload) {
        return this.repository.createEscortRequest(payload);
    }
    async updateEscortRequest(id, payload) {
        return this.repository.updateEscortRequest(id, payload);
    }
    async removeEscortRequest(id) {
        await this.repository.removeEscortRequest(id);
    }
    async listBhabinAccounts() {
        return this.bhabinAccountService.listAccounts();
    }
    async createBhabinAccount(payload) {
        return this.bhabinAccountService.createAccount(payload);
    }
    async updateBhabinAccount(id, payload) {
        return this.bhabinAccountService.updateAccount(id, payload);
    }
    async deleteBhabinAccount(id) {
        await this.bhabinAccountService.deleteAccount(id);
    }
}
