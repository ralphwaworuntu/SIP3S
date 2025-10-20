import Joi from "joi";
import type { Request, Response } from "express";

import { SuperAdminService } from "@/services/super-admin-service";
import type { RecipientVerificationPayload } from "@/types/bhabin";
import type { TaskPriority, TaskStatus } from "@/types/task";

const service = new SuperAdminService();

const taskPayloadSchema = Joi.object({
  title: Joi.string().min(4).max(200).required(),
  description: Joi.string().max(2000).allow(""),
  region: Joi.string().max(160).required(),
  dueDate: Joi.string().isoDate().required(),
  priority: Joi.string().valid("low", "medium", "high").required(),
  status: Joi.string().valid("baru", "proses", "selesai").required(),
  assignedTo: Joi.array().items(Joi.string().email()).min(1).required(),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().min(4).max(200),
  description: Joi.string().max(2000).allow(""),
  region: Joi.string().max(160),
  dueDate: Joi.string().isoDate(),
  priority: Joi.string().valid("low", "medium", "high"),
  status: Joi.string().valid("baru", "proses", "selesai"),
  assignedTo: Joi.array().items(Joi.string().email()).min(1),
}).min(1);

const taskStatusSchema = Joi.object({
  status: Joi.string().valid("baru", "proses", "selesai").required(),
});

const recipientUpdateSchema = Joi.object({
  status: Joi.string().valid("pending", "verified", "rejected"),
  notes: Joi.string().max(280).allow(null, ""),
  lokasi: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    alamat: Joi.string().required(),
  }).optional(),
  fotoEvidence: Joi.string().allow("", null),
  productType: Joi.string().valid("benih", "pupuk").optional(),
  seedType: Joi.string().allow("", null),
  seedQuantityKg: Joi.number().min(0).optional(),
  pupukNpkKg: Joi.number().min(0).optional(),
  pupukUreaKg: Joi.number().min(0).optional(),
}).min(1);

const plantPayloadSchema = Joi.object({
  wilayah: Joi.string().required(),
  petani: Joi.string().required(),
  komoditas: Joi.string().required(),
  fase: Joi.string().required(),
  kondisi: Joi.string().valid("baik", "waspada", "kritikal").required(),
  catatan: Joi.string().max(1000).required(),
  lokasi: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    alamat: Joi.string().required(),
  }).required(),
  fotoEvidence: Joi.string().allow("", null).required(),
  pupukDigunakanKg: Joi.number().min(0).optional(),
  luasLahanBersihM2: Joi.number().min(0).optional(),
  bibitDitanamKg: Joi.number().min(0).optional(),
  productType: Joi.string().valid("benih", "pupuk").optional(),
  seedType: Joi.string().allow("", null),
  seedQuantityKg: Joi.number().min(0).optional(),
  pupukNpkKg: Joi.number().min(0).optional(),
  pupukUreaKg: Joi.number().min(0).optional(),
});

const plantUpdateSchema = plantPayloadSchema.fork(
  ["wilayah", "petani", "komoditas", "fase", "kondisi", "catatan", "lokasi", "fotoEvidence"],
  (schema) => schema.optional()
);

const harvestPayloadSchema = Joi.object({
  petani: Joi.string().required(),
  komoditas: Joi.string().required(),
  luasPanenHa: Joi.number().min(0).required(),
  produksiTon: Joi.number().min(0).required(),
  lokasi: Joi.string().required(),
  keterangan: Joi.string().max(1000).allow("", null),
  koordinat: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    alamat: Joi.string().required(),
  }).required(),
  fotoEvidence: Joi.string().allow("", null).required(),
  productType: Joi.string().valid("benih", "pupuk").optional(),
  seedType: Joi.string().allow("", null),
  seedQuantityKg: Joi.number().min(0).optional(),
  pupukNpkKg: Joi.number().min(0).optional(),
  pupukUreaKg: Joi.number().min(0).optional(),
});

const harvestUpdateSchema = harvestPayloadSchema.fork(
  ["petani", "komoditas", "luasPanenHa", "produksiTon", "lokasi", "koordinat", "fotoEvidence"],
  (schema) => schema.optional()
);

const escortPayloadSchema = Joi.object({
  wilayah: Joi.string().required(),
  jadwal: Joi.string().isoDate().required(),
  titikKumpul: Joi.string().required(),
  estimasiPeserta: Joi.number().min(1).required(),
  kebutuhanPersonel: Joi.number().min(1).required(),
  catatan: Joi.string().allow("", null),
  diajukanOleh: Joi.string().email().required(),
});

const escortUpdateSchema = Joi.object({
  wilayah: Joi.string().optional(),
  jadwal: Joi.string().isoDate().optional(),
  titikKumpul: Joi.string().optional(),
  estimasiPeserta: Joi.number().min(1).optional(),
  kebutuhanPersonel: Joi.number().min(1).optional(),
  catatan: Joi.string().allow("", null),
  diajukanOleh: Joi.string().email().optional(),
  status: Joi.string().valid("baru", "dijadwalkan", "selesai", "approved").optional(),
}).min(1);

const accountPayloadSchema = Joi.object({
  nama: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().required(),
  agency: Joi.string().max(120).allow("", null),
  wilayah: Joi.string().max(160).allow("", null),
  phone: Joi.string().max(32).allow("", null),
  password: Joi.string().min(6).max(64).allow("", null),
  status: Joi.string().valid("active", "inactive").optional(),
});

const accountUpdateSchema = accountPayloadSchema.fork(["nama", "email"], (schema) => schema.optional()).min(1);

const handleError = (res: Response, error: unknown, fallback: string) => {
  const status = typeof (error as { status?: number })?.status === "number" ? (error as { status: number }).status : 500;
  const message = error instanceof Error ? error.message : fallback;
  res.status(status).json({ message });
};

export const getSuperAdminOverviewController = async (_req: Request, res: Response) => {
  const overview = await service.getOverview();
  res.json(overview);
};

export const listSuperAdminTasksController = async (_req: Request, res: Response) => {
  const tasks = await service.listTasks();
  res.json(tasks);
};

export const createSuperAdminTaskController = async (req: Request, res: Response) => {
  const { error, value } = taskPayloadSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  const record = await service.createTask(value as {priority: TaskPriority; status: TaskStatus; assignedTo: string[]; title: string; description: string; region: string; dueDate: string;});
  res.status(201).json(record);
};

export const updateSuperAdminTaskController = async (req: Request, res: Response) => {
  const { error, value } = taskUpdateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  const updated = await service.updateTask(req.params.id, value as Partial<{priority: TaskPriority; status: TaskStatus; assignedTo: string[]; title: string; description: string; region: string; dueDate: string;}>);
  if (!updated) {
    res.status(404).json({ message: "Tugas tidak ditemukan" });
    return;
  }
  res.json(updated);
};

export const updateSuperAdminTaskStatusController = async (req: Request, res: Response) => {
  const { error, value } = taskStatusSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  const updated = await service.updateTaskStatus(req.params.id, value.status as TaskStatus);
  if (!updated) {
    res.status(404).json({ message: "Tugas tidak ditemukan" });
    return;
  }
  res.json(updated);
};

export const deleteSuperAdminTaskController = async (req: Request, res: Response) => {
  await service.removeTask(req.params.id);
  res.status(204).send();
};

export const listSuperAdminRecipientsController = async (_req: Request, res: Response) => {
  const recipients = await service.listRecipients();
  res.json(recipients);
};

export const updateSuperAdminRecipientController = async (req: Request, res: Response) => {
  const { error, value } = recipientUpdateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const updated = await service.updateRecipient(req.params.id, value as RecipientVerificationPayload);
    res.json(updated);
  } catch (err) {
    handleError(res, err, "Gagal memperbarui data verifikasi penyaluran");
  }
};

export const listSuperAdminPlantReportsController = async (_req: Request, res: Response) => {
  const reports = await service.listPlantReports();
  res.json(reports);
};

export const createSuperAdminPlantReportController = async (req: Request, res: Response) => {
  const { error, value } = plantPayloadSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const record = await service.createPlantReport(value);
    res.status(201).json(record);
  } catch (err) {
    handleError(res, err, "Gagal membuat laporan perkembangan tanaman");
  }
};

export const updateSuperAdminPlantReportController = async (req: Request, res: Response) => {
  const { error, value } = plantUpdateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const updated = await service.updatePlantReport(req.params.id, value);
    res.json(updated);
  } catch (err) {
    handleError(res, err, "Gagal memperbarui laporan perkembangan tanaman");
  }
};

export const deleteSuperAdminPlantReportController = async (req: Request, res: Response) => {
  try {
    await service.removePlantReport(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err, "Gagal menghapus laporan perkembangan tanaman");
  }
};

export const listSuperAdminHarvestController = async (_req: Request, res: Response) => {
  const harvests = await service.listHarvestVerifications();
  res.json(harvests);
};

export const createSuperAdminHarvestController = async (req: Request, res: Response) => {
  const { error, value } = harvestPayloadSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const record = await service.createHarvestVerification(value);
    res.status(201).json(record);
  } catch (err) {
    handleError(res, err, "Gagal membuat verifikasi hasil panen");
  }
};

export const updateSuperAdminHarvestController = async (req: Request, res: Response) => {
  const { error, value } = harvestUpdateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const updated = await service.updateHarvestVerification(req.params.id, value);
    res.json(updated);
  } catch (err) {
    handleError(res, err, "Gagal memperbarui verifikasi hasil panen");
  }
};

export const deleteSuperAdminHarvestController = async (req: Request, res: Response) => {
  try {
    await service.removeHarvestVerification(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err, "Gagal menghapus verifikasi hasil panen");
  }
};

export const listSuperAdminEscortController = async (_req: Request, res: Response) => {
  const escorts = await service.listEscortRequests();
  res.json(escorts);
};

export const createSuperAdminEscortController = async (req: Request, res: Response) => {
  const { error, value } = escortPayloadSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const record = await service.createEscortRequest(value);
    res.status(201).json(record);
  } catch (err) {
    handleError(res, err, "Gagal membuat permintaan pengawalan");
  }
};

export const updateSuperAdminEscortController = async (req: Request, res: Response) => {
  const { error, value } = escortUpdateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const updated = await service.updateEscortRequest(req.params.id, value);
    res.json(updated);
  } catch (err) {
    handleError(res, err, "Gagal memperbarui permintaan pengawalan");
  }
};

export const deleteSuperAdminEscortController = async (req: Request, res: Response) => {
  try {
    await service.removeEscortRequest(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err, "Gagal menghapus permintaan pengawalan");
  }
};

export const listSuperAdminAccountsController = async (_req: Request, res: Response) => {
  const accounts = await service.listBhabinAccounts();
  res.json(accounts);
};

export const createSuperAdminAccountController = async (req: Request, res: Response) => {
  const { error, value } = accountPayloadSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const account = await service.createBhabinAccount(value);
    res.status(201).json(account);
  } catch (err) {
    handleError(res, err, "Gagal menambah akun Bhabinkamtibmas");
  }
};

export const updateSuperAdminAccountController = async (req: Request, res: Response) => {
  const { error, value } = accountUpdateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const account = await service.updateBhabinAccount(req.params.id, value);
    res.json(account);
  } catch (err) {
    handleError(res, err, "Gagal memperbarui akun Bhabinkamtibmas");
  }
};

export const deleteSuperAdminAccountController = async (req: Request, res: Response) => {
  try {
    await service.deleteBhabinAccount(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err, "Gagal menghapus akun Bhabinkamtibmas");
  }
};
