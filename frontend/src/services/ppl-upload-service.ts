import { v4 as uuid } from "uuid";

import apiClient from "@/services/http";
import type { PplAssignment, PplUploadCategory, PplUploadRecord, UploadPayload } from "@/types/ppl";
import { mockPplAssignments, mockPplUploads } from "@/utils/mock-data";

const STORAGE_KEY = "sip3s.pplUploads";

const readLocalUploads = (): PplUploadRecord[] => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return [...mockPplUploads];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPplUploads));
    return [...mockPplUploads];
  }
  try {
    const parsed = JSON.parse(raw) as PplUploadRecord[];
    return Array.isArray(parsed) ? parsed : [...mockPplUploads];
  } catch (error) {
    console.warn("Gagal membaca cache upload PPL", error);
    return [...mockPplUploads];
  }
};

const persistLocalUploads = (records: PplUploadRecord[]) => {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn("Gagal menyimpan cache upload PPL", error);
  }
};

const sortByDateDesc = (records: PplUploadRecord[]) =>
  [...records].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

class PplUploadService {
  async listAssignments(email: string | undefined): Promise<PplAssignment[]> {
    if (!email) return [];
    try {
      const { data } = await apiClient.get<PplAssignment[]>("/ppl/assignments", { params: { email } });
      return data;
    } catch (error) {
      return mockPplAssignments.filter((assignment) => assignment.pplEmail === email);
    }
  }

  async listUploads(email: string | undefined, type?: PplUploadCategory): Promise<PplUploadRecord[]> {
    if (!email) return [];
    try {
      const { data } = await apiClient.get<PplUploadRecord[]>("/ppl/uploads", {
        params: { email, type },
      });
      return data;
    } catch (error) {
      const records = readLocalUploads().filter((record) => record.uploader === email);
      return type ? records.filter((record) => record.type === type) : records;
    }
  }

  async upload(payload: UploadPayload): Promise<PplUploadRecord> {
    const { file, type, assignment, uploader, notes } = payload;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("wilayahId", assignment.wilayahId);
    formData.append("wilayahName", assignment.wilayahName);
    formData.append("pplEmail", uploader);
    if (notes) {
      formData.append("notes", notes);
    }

    try {
      const { data } = await apiClient.post<PplUploadRecord>("/ppl/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const existing = readLocalUploads();
      const filtered = existing.filter((record) => record.id !== data.id);
      persistLocalUploads(sortByDateDesc([data, ...filtered]));
      return data;
    } catch (error) {
      const totalRecords = await this.estimateRecords(file);
      const fallback: PplUploadRecord = {
        id: uuid(),
        type,
        filename: file.name,
        wilayahId: assignment.wilayahId,
        wilayahName: assignment.wilayahName,
        uploader,
        totalRecords,
        sizeInKb: Math.round(file.size / 1024),
        status: "tersimpan-offline",
        uploadedAt: new Date().toISOString(),
        message: "Data tersimpan lokal. Unggah ulang saat koneksi stabil.",
      };
      const existing = readLocalUploads();
      const filtered = existing.filter((record) => record.id !== fallback.id);
      persistLocalUploads(sortByDateDesc([fallback, ...filtered]));
      return fallback;
    }
  }

  private async estimateRecords(file: File): Promise<number | undefined> {
    const isCsv = file.type.includes("csv") || file.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      return undefined;
    }
    try {
      const text = await file.text();
      const rows = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
      if (rows.length <= 1) return 0;
      return rows.length - 1;
    } catch (error) {
      console.warn("Gagal menghitung jumlah baris CSV", error);
      return undefined;
    }
  }
}

export const pplUploadService = new PplUploadService();
