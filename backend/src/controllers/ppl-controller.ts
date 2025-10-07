import Joi from "joi";
import type { Request, Response } from "express";

import { PplUploadService } from "@/services/ppl-upload-service";

const service = new PplUploadService();

const emailSchema = Joi.string().email().required();

const uploadsQuerySchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid("simluhtan", "erdkk").optional(),
});

const uploadSchema = Joi.object({
  type: Joi.string().valid("simluhtan", "erdkk").required(),
  wilayahId: Joi.string().required(),
  wilayahName: Joi.string().required(),
  notes: Joi.string().allow("", null).optional(),
});

export const listAssignmentsController = async (req: Request, res: Response) => {
  const { error, value } = emailSchema.validate(req.query.email);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const assignments = await service.listAssignments(value as string);
  res.json(assignments);
};

export const listUploadsController = async (req: Request, res: Response) => {
  const { error, value } = uploadsQuerySchema.validate({
    email: req.query.email,
    type: req.query.type,
  });
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const uploads = await service.listUploads(value.email, value.type);
  res.json(uploads);
};

export const uploadDataController = async (req: Request, res: Response) => {
  const { error, value } = uploadSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "Berkas tidak ditemukan" });
    return;
  }

  const uploader = typeof req.body.pplEmail === "string" ? req.body.pplEmail : req.body.uploader;
  if (!uploader || typeof uploader !== "string") {
    res.status(400).json({ message: "Identitas pengunggah tidak valid" });
    return;
  }

  try {
    const record = await service.handleUpload({
      file: req.file,
      category: value.type,
      uploader,
      assignment: {
        wilayahId: value.wilayahId,
        wilayahName: value.wilayahName,
      },
      notes: value.notes ?? undefined,
    });
    res.status(201).json(record);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memproses unggahan";
    res.status(500).json({ message });
  }
};