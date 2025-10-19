import { v4 as uuid } from "uuid";

import type {
  BhabinAssignment,
  EscortRequest,
  EscortRequestPayload,
  HarvestVerification,
  HarvestVerificationPayload,
  PlantConditionPayload,
  PlantConditionReport,
  RecipientVerification,
  VerifyRecipientPayload,
} from "@/types/bhabin";
import apiClient from "@/services/http";
import {
  mockBhabinRecipients,
  mockEscortRequests,
  mockHarvestVerifications,
  mockPlantProgress,
  mockPplAssignments,
} from "@/utils/mock-data";

const STORAGE_KEY = {
  recipients: "sip3s.bhabin.recipients",
  plant: "sip3s.bhabin.plant",
  harvest: "sip3s.bhabin.harvest",
  escort: "sip3s.bhabin.escort",
} as const;

const readLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch (error) {
    console.warn("Gagal membaca cache Bhabin", error);
    return fallback;
  }
};

const persistLocal = <T>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Gagal menyimpan cache Bhabin", error);
  }
};

class BhabinService {
  async listAssignments(email: string | undefined): Promise<BhabinAssignment[]> {
    if (!email) return [];
    try {
      const { data } = await apiClient.get<BhabinAssignment[]>("/bhabin/assignments", { params: { email } });
      return data;
    } catch (_error) {
      return mockPplAssignments
        .filter((assignment) => assignment.bhabinEmail === email)
        .map((assignment) => ({
          id: assignment.id,
          bhabinEmail: assignment.bhabinEmail,
          wilayahId: assignment.wilayahId,
          wilayahName: assignment.wilayahName,
          kecamatan: assignment.kecamatan,
          desa: assignment.desa,
          pplEmail: assignment.pplEmail,
        }));
    }
  }

  async listRecipients(): Promise<RecipientVerification[]> {
    try {
      const { data } = await apiClient.get<RecipientVerification[]>("/bhabin/recipients");
      return data;
    } catch (_error) {
      return readLocal(STORAGE_KEY.recipients, mockBhabinRecipients);
    }
  }

  async verifyRecipient(payload: VerifyRecipientPayload): Promise<RecipientVerification> {
    try {
      const { data } = await apiClient.post<RecipientVerification>("/bhabin/recipients/verify", payload);
      return data;
    } catch (_error) {
      const list = readLocal(STORAGE_KEY.recipients, mockBhabinRecipients);
      const next = list.map((item) =>
        item.id === payload.id
          ? {
              ...item,
              status: "verified" as const,
              verifiedAt: new Date().toISOString(),
              notes: payload.notes,
              lokasi: payload.lokasi,
              fotoEvidence: payload.fotoEvidence,
              productType: payload.productType,
              seedType: payload.seedType,
              seedQuantityKg: payload.seedQuantityKg,
              pupukNpkKg: payload.pupukNpkKg,
              pupukUreaKg: payload.pupukUreaKg,
            }
          : item
      );
      persistLocal(STORAGE_KEY.recipients, next);
      return (
        next.find((item) => item.id === payload.id) ?? {
          ...mockBhabinRecipients[0],
          status: "verified" as const,
          verifiedAt: new Date().toISOString(),
          notes: payload.notes,
          lokasi: payload.lokasi,
          fotoEvidence: payload.fotoEvidence,
          productType: payload.productType,
          seedType: payload.seedType,
          seedQuantityKg: payload.seedQuantityKg,
          pupukNpkKg: payload.pupukNpkKg,
          pupukUreaKg: payload.pupukUreaKg,
        }
      );
    }
  }

  async listPlantProgress(): Promise<PlantConditionReport[]> {
    try {
      const { data } = await apiClient.get<PlantConditionReport[]>("/bhabin/plant-progress");
      return data;
    } catch (_error) {
      return readLocal(STORAGE_KEY.plant, mockPlantProgress);
    }
  }

  async submitPlantProgress(payload: PlantConditionPayload & { reporter: string }): Promise<PlantConditionReport> {
    try {
      const { data } = await apiClient.post<PlantConditionReport>("/bhabin/plant-progress", payload);
      return data;
    } catch (_error) {
      const nextRecord: PlantConditionReport = {
        id: uuid(),
        wilayah: payload.wilayah,
        petani: payload.petani,
        komoditas: payload.komoditas,
        fase: payload.fase,
        kondisi: payload.kondisi,
        catatan: payload.catatan,
        updatedAt: new Date().toISOString(),
        lokasi: payload.lokasi,
        fotoEvidence: payload.fotoEvidence,
        pupukDigunakanKg: payload.pupukDigunakanKg,
        luasLahanBersihM2: payload.luasLahanBersihM2,
        bibitDitanamKg: payload.bibitDitanamKg,
      };
      const list = [nextRecord, ...readLocal(STORAGE_KEY.plant, mockPlantProgress)];
      persistLocal(STORAGE_KEY.plant, list);
      return nextRecord;
    }
  }

  async listHarvestVerifications(): Promise<HarvestVerification[]> {
    try {
      const { data } = await apiClient.get<HarvestVerification[]>("/bhabin/harvests");
      return data;
    } catch (_error) {
      return readLocal(STORAGE_KEY.harvest, mockHarvestVerifications);
    }
  }

  async submitHarvestVerification(payload: HarvestVerificationPayload & { verifier: string }): Promise<HarvestVerification> {
    try {
      const { data } = await apiClient.post<HarvestVerification>("/bhabin/harvests", payload);
      return data;
    } catch (_error) {
      const record: HarvestVerification = {
        id: uuid(),
        petani: payload.petani,
        komoditas: payload.komoditas,
        luasPanenHa: payload.luasPanenHa,
        produksiTon: payload.produksiTon,
        lokasi: payload.lokasi,
        diverifikasiAt: new Date().toISOString(),
        keterangan: payload.keterangan,
        koordinat: payload.koordinat,
        fotoEvidence: payload.fotoEvidence,
      };
      const list = [record, ...readLocal(STORAGE_KEY.harvest, mockHarvestVerifications)];
      persistLocal(STORAGE_KEY.harvest, list);
      return record;
    }
  }

  async listEscortRequests(): Promise<EscortRequest[]> {
    try {
      const { data } = await apiClient.get<EscortRequest[]>("/bhabin/escorts");
      return data;
    } catch (_error) {
      return readLocal(STORAGE_KEY.escort, mockEscortRequests);
    }
  }

  async submitEscortRequest(payload: EscortRequestPayload): Promise<EscortRequest> {
    try {
      const { data } = await apiClient.post<EscortRequest>("/bhabin/escorts", payload);
      const cached = readLocal(STORAGE_KEY.escort, mockEscortRequests);
      const nextCache = [data, ...cached.filter((item) => item.id !== data.id)];
      persistLocal(STORAGE_KEY.escort, nextCache);
      return data;
    } catch (_error) {
      const record: EscortRequest = {
        id: uuid(),
        wilayah: payload.wilayah,
        jadwal: payload.jadwal,
        titikKumpul: payload.titikKumpul,
        estimasiPeserta: payload.estimasiPeserta,
        kebutuhanPersonel: payload.kebutuhanPersonel,
        status: "baru",
        catatan: payload.catatan,
        diajukanOleh: payload.diajukanOleh,
        diajukanAt: new Date().toISOString(),
      };
      const list = [record, ...readLocal(STORAGE_KEY.escort, mockEscortRequests)];
      persistLocal(STORAGE_KEY.escort, list);
      return record;
    }
  }

  async updateEscortStatus(id: string, status: EscortRequest["status"]): Promise<EscortRequest | null> {
    try {
      const { data } = await apiClient.patch<EscortRequest>(`/bhabin/escorts/${id}`, { status });
      const list = readLocal(STORAGE_KEY.escort, mockEscortRequests);
      const next = list.some((item) => item.id === data.id)
        ? list.map((item) => (item.id === data.id ? data : item))
        : [data, ...list];
      persistLocal(STORAGE_KEY.escort, next);
      return data;
    } catch (_error) {
      const list = readLocal(STORAGE_KEY.escort, mockEscortRequests);
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }
      const updated: EscortRequest = { ...list[index], status };
      const next = list.map((item) => (item.id === id ? updated : item));
      persistLocal(STORAGE_KEY.escort, next);
      return updated;
    }
  }
}

export const bhabinService = new BhabinService();

