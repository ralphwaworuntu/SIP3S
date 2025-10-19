import { promises as fs } from "fs";
import { join } from "path";
import { v4 as uuid } from "uuid";
import type { Express } from "express";

import { PplRepository } from "@/repositories/ppl-repository";
import type { CreateUploadParams, PplAssignment, PplUploadCategory, PplUploadRecord } from "@/types/ppl";

const DEFAULT_UPLOAD_DIR = process.env.UPLOAD_DIR ?? "uploads";
const PPL_DIR = join(DEFAULT_UPLOAD_DIR, "ppl");

const sanitizeFilename = (filename: string) =>
  filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const countCsvRows = async (buffer: Buffer): Promise<number | undefined> => {
  const text = buffer.toString("utf-8");
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
  if (rows.length <= 1) return 0;
  return rows.length - 1;
};

export class PplUploadService {
  constructor(private readonly repository = new PplRepository()) {}

  async listAssignments(email: string): Promise<PplAssignment[]> {
    return this.repository.listAssignmentsByEmail(email);
  }

  async listUploads(email: string, type?: PplUploadCategory): Promise<PplUploadRecord[]> {
    return this.repository.listUploadsByEmail(email, type);
  }

  async handleUpload(params: {
    file: Express.Multer.File;
    category: PplUploadCategory;
    uploader: string;
    assignment: { wilayahId: string; wilayahName: string };
    notes?: string;
  }): Promise<PplUploadRecord> {
    const { file, category, uploader, assignment, notes } = params;
    const now = new Date().toISOString();
    const id = uuid();

    const dir = join(PPL_DIR, category);
    await fs.mkdir(dir, { recursive: true });

    const sanitizedName = sanitizeFilename(file.originalname) || `${category}-${Date.now()}`;
    const finalName = `${now.replace(/[:.]/g, "-")}-${sanitizedName}`;
    const targetPath = join(dir, finalName);
    await fs.writeFile(targetPath, file.buffer);

    const totalRecords = file.mimetype.includes("csv") ? await countCsvRows(file.buffer) : undefined;

    const payload: CreateUploadParams = {
      id,
      category,
      filename: file.originalname,
      filepath: targetPath,
      mimetype: file.mimetype,
      sizeInKb: Math.round(file.size / 1024),
      totalRecords,
      status: "diproses",
      uploader,
      wilayahId: assignment.wilayahId,
      wilayahName: assignment.wilayahName,
      notes,
      uploadedAt: now,
      message: totalRecords === undefined ? "Menunggu validasi manual." : undefined,
    };

    return this.repository.createUpload(payload);
  }
}
