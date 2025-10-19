import type {
  BhabinAccount,
  BhabinAccountPayload,
  EscortRequest,
  EscortRequestPayload,
  HarvestVerification,
  HarvestVerificationPayload,
  PlantConditionPayload,
  PlantConditionReport,
  RecipientVerification,
  RecipientVerificationPayload,
} from "@/types/bhabin";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

export interface SuperAdminOverview {
  totals: {
    tasks: number;
    recipients: number;
    plantReports: number;
    harvestVerifications: number;
    escortRequests: number;
    bhabinAccounts: number;
  };
  pending: {
    tasks: number;
    recipients: number;
    escortRequests: number;
  };
}

export interface SuperAdminTaskPayload {
  title: string;
  description: string;
  region: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string[];
}

export type SuperAdminTaskUpdatePayload = Partial<SuperAdminTaskPayload>;

export type SuperAdminTask = Task;

export interface SuperAdminRecipientUpdatePayload extends RecipientVerificationPayload {}

export interface SuperAdminPlantPayload extends PlantConditionPayload {}
export type SuperAdminPlantUpdatePayload = Partial<PlantConditionPayload>;

export interface SuperAdminHarvestPayload extends HarvestVerificationPayload {}
export type SuperAdminHarvestUpdatePayload = Partial<HarvestVerificationPayload>;

export interface SuperAdminEscortPayload extends EscortRequestPayload {}
export type SuperAdminEscortUpdatePayload = Partial<EscortRequestPayload> & { status?: EscortRequest["status"] };

export interface SuperAdminAccountPayload extends BhabinAccountPayload {}

export type SuperAdminAccount = BhabinAccount;
export type SuperAdminRecipient = RecipientVerification;
export type SuperAdminPlantReport = PlantConditionReport;
export type SuperAdminHarvest = HarvestVerification;
export type SuperAdminEscortRequest = EscortRequest;
