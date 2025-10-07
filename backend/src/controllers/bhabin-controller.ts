import Joi from "joi";
import type { Request, Response } from "express";

import { BhabinAccountService } from "@/services/bhabin-account-service";

const service = new BhabinAccountService();

const createSchema = Joi.object({
  nama: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().required(),
  agency: Joi.string().max(120).allow("", null),
  wilayah: Joi.string().max(160).allow("", null),
  phone: Joi.string().max(32).allow("", null),
  password: Joi.string().min(6).max(64).allow("", null),
  status: Joi.string().valid("active", "inactive").default("active"),
});

const updateSchema = Joi.object({
  nama: Joi.string().min(3).max(120).optional(),
  email: Joi.string().email().optional(),
  agency: Joi.string().max(120).allow("", null),
  wilayah: Joi.string().max(160).allow("", null),
  phone: Joi.string().max(32).allow("", null),
  password: Joi.string().min(6).max(64).allow("", null),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);

const handleError = (res: Response, error: unknown, fallback: string) => {
  const status = typeof (error as { status?: number })?.status === "number" ? (error as { status: number }).status : 500;
  const message = error instanceof Error ? error.message : fallback;
  res.status(status).json({ message });
};

export const listBhabinAccountsController = async (_req: Request, res: Response) => {
  const accounts = await service.listAccounts();
  res.json(accounts);
};

export const createBhabinAccountController = async (req: Request, res: Response) => {
  const { error, value } = createSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  try {
    const account = await service.createAccount({
      ...value,
      agency: value.agency ?? undefined,
      wilayah: value.wilayah ?? undefined,
      phone: value.phone ?? undefined,
      password: value.password ?? undefined,
    });
    res.status(201).json(account);
  } catch (err) {
    handleError(res, err, "Gagal membuat akun Bhabin");
  }
};

export const updateBhabinAccountController = async (req: Request, res: Response) => {
  const { error, value } = updateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  try {
    const account = await service.updateAccount(req.params.id, {
      ...value,
      agency: value.agency ?? undefined,
      wilayah: value.wilayah ?? undefined,
      phone: value.phone ?? undefined,
      password: value.password ?? undefined,
    });
    res.json(account);
  } catch (err) {
    handleError(res, err, "Gagal memperbarui akun Bhabin");
  }
};

export const deleteBhabinAccountController = async (req: Request, res: Response) => {
  try {
    await service.deleteAccount(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err, "Gagal menghapus akun Bhabin");
  }
};
