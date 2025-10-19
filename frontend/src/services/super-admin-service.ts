import http from "@/services/http";
import type {
  SuperAdminAccount,
  SuperAdminAccountPayload,
  SuperAdminEscortPayload,
  SuperAdminEscortRequest,
  SuperAdminEscortUpdatePayload,
  SuperAdminHarvest,
  SuperAdminHarvestPayload,
  SuperAdminHarvestUpdatePayload,
  SuperAdminOverview,
  SuperAdminPlantPayload,
  SuperAdminPlantReport,
  SuperAdminPlantUpdatePayload,
  SuperAdminRecipient,
  SuperAdminRecipientUpdatePayload,
  SuperAdminTask,
  SuperAdminTaskPayload,
  SuperAdminTaskUpdatePayload,
} from "@/types/super-admin";
import type { TaskStatus } from "@/types/task";

const BASE_URL = "/super-admin";

export const superAdminService = {
  async overview(): Promise<SuperAdminOverview> {
    const { data } = await http.get<SuperAdminOverview>(`${BASE_URL}/overview`);
    return data;
  },

  async listTasks(): Promise<SuperAdminTask[]> {
    const { data } = await http.get<SuperAdminTask[]>(`${BASE_URL}/tasks`);
    return data;
  },

  async createTask(payload: SuperAdminTaskPayload): Promise<SuperAdminTask> {
    const { data } = await http.post<SuperAdminTask>(`${BASE_URL}/tasks`, payload);
    return data;
  },

  async updateTask(id: string, payload: SuperAdminTaskUpdatePayload): Promise<SuperAdminTask> {
    const { data } = await http.put<SuperAdminTask>(`${BASE_URL}/tasks/${id}`, payload);
    return data;
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<SuperAdminTask> {
    const { data } = await http.patch<SuperAdminTask>(`${BASE_URL}/tasks/${id}/status`, { status });
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/tasks/${id}`);
  },

  async listRecipients(): Promise<SuperAdminRecipient[]> {
    const { data } = await http.get<SuperAdminRecipient[]>(`${BASE_URL}/recipients`);
    return data;
  },

  async updateRecipient(id: string, payload: SuperAdminRecipientUpdatePayload): Promise<SuperAdminRecipient> {
    const { data } = await http.patch<SuperAdminRecipient>(`${BASE_URL}/recipients/${id}`, payload);
    return data;
  },

  async listPlantReports(): Promise<SuperAdminPlantReport[]> {
    const { data } = await http.get<SuperAdminPlantReport[]>(`${BASE_URL}/plant-reports`);
    return data;
  },

  async createPlantReport(payload: SuperAdminPlantPayload): Promise<SuperAdminPlantReport> {
    const { data } = await http.post<SuperAdminPlantReport>(`${BASE_URL}/plant-reports`, payload);
    return data;
  },

  async updatePlantReport(id: string, payload: SuperAdminPlantUpdatePayload): Promise<SuperAdminPlantReport> {
    const { data } = await http.put<SuperAdminPlantReport>(`${BASE_URL}/plant-reports/${id}`, payload);
    return data;
  },

  async deletePlantReport(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/plant-reports/${id}`);
  },

  async listHarvestVerifications(): Promise<SuperAdminHarvest[]> {
    const { data } = await http.get<SuperAdminHarvest[]>(`${BASE_URL}/harvests`);
    return data;
  },

  async createHarvestVerification(payload: SuperAdminHarvestPayload): Promise<SuperAdminHarvest> {
    const { data } = await http.post<SuperAdminHarvest>(`${BASE_URL}/harvests`, payload);
    return data;
  },

  async updateHarvestVerification(id: string, payload: SuperAdminHarvestUpdatePayload): Promise<SuperAdminHarvest> {
    const { data } = await http.put<SuperAdminHarvest>(`${BASE_URL}/harvests/${id}`, payload);
    return data;
  },

  async deleteHarvestVerification(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/harvests/${id}`);
  },

  async listEscortRequests(): Promise<SuperAdminEscortRequest[]> {
    const { data } = await http.get<SuperAdminEscortRequest[]>(`${BASE_URL}/escort-requests`);
    return data;
  },

  async createEscortRequest(payload: SuperAdminEscortPayload): Promise<SuperAdminEscortRequest> {
    const { data } = await http.post<SuperAdminEscortRequest>(`${BASE_URL}/escort-requests`, payload);
    return data;
  },

  async updateEscortRequest(id: string, payload: SuperAdminEscortUpdatePayload): Promise<SuperAdminEscortRequest> {
    const { data } = await http.put<SuperAdminEscortRequest>(`${BASE_URL}/escort-requests/${id}`, payload);
    return data;
  },

  async deleteEscortRequest(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/escort-requests/${id}`);
  },

  async listAccounts(): Promise<SuperAdminAccount[]> {
    const { data } = await http.get<SuperAdminAccount[]>(`${BASE_URL}/accounts`);
    return data;
  },

  async createAccount(payload: SuperAdminAccountPayload): Promise<SuperAdminAccount> {
    const { data } = await http.post<SuperAdminAccount>(`${BASE_URL}/accounts`, payload);
    return data;
  },

  async updateAccount(id: string, payload: SuperAdminAccountPayload): Promise<SuperAdminAccount> {
    const { data } = await http.put<SuperAdminAccount>(`${BASE_URL}/accounts/${id}`, payload);
    return data;
  },

  async deleteAccount(id: string): Promise<void> {
    await http.delete(`${BASE_URL}/accounts/${id}`);
  },
};
