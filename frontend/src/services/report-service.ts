import { v4 as uuid } from "uuid";

import apiClient from "@/services/http";
import { BACKGROUND_SYNC_TAGS } from "@/utils/constants";
import { offlineCache } from "@/utils/offline-cache";

export interface LaporanLapangan {
  id?: string;
  komoditas: string;
  kuotaTersalurkan: number;
  lokasi: {
    latitude: number;
    longitude: number;
    alamat: string;
  };
  fotoUrl?: string;
  catatan: string;
  createdAt?: string;
  authorId: string;
  status?: "pending" | "terkirim" | "gagal";
}

class ReportService {
  async kirimLaporan(laporan: Omit<LaporanLapangan, "id" | "status" | "createdAt">) {
    const payload = {
      ...laporan,
      createdAt: new Date().toISOString(),
      status: "terkirim" as const,
    };
    try {
      const { data } = await apiClient.post("/reports", payload);
      return data;
    } catch (error) {
      const offlineId = uuid();
      const offlinePayload = {
        ...payload,
        id: offlineId,
        status: "pending" as const,
      };
      await offlineCache.persistPendingReport({
        id: offlineId,
        payload: offlinePayload,
      });
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(BACKGROUND_SYNC_TAGS.laporan);
      }
      return offlinePayload;
    }
  }
}

export const reportService = new ReportService();
