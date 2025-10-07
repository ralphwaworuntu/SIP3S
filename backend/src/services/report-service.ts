import type { RowDataPacket } from "mysql2";
import { v4 as uuid } from "uuid";

import { getPool, pingDatabase } from "@/config/database";
import { logger } from "@/utils/logger";
import { mockReports } from "@/repositories/mock-storage";
import type { LaporanLapangan } from "@/types/report";

interface ReportRow extends RowDataPacket {
  id: string;
  komoditas: string;
  kuota_tersalurkan: number;
  latitude: number;
  longitude: number;
  alamat: string;
  foto_url: string;
  catatan: string;
  created_at: string;
  author_id: string;
  status: string;
}

export class ReportService {
  async list(): Promise<LaporanLapangan[]> {
    const useDatabase = await pingDatabase();
    if (useDatabase) {
      try {
        const pool = getPool();
        const [rows] = await pool.query<ReportRow[]>("SELECT * FROM reports ORDER BY created_at DESC LIMIT 200");
        return rows.map((row) => ({
          id: row.id,
          komoditas: row.komoditas,
          kuotaTersalurkan: row.kuota_tersalurkan,
          lokasi: {
            latitude: row.latitude,
            longitude: row.longitude,
            alamat: row.alamat,
          },
          fotoUrl: row.foto_url,
          catatan: row.catatan,
          createdAt: row.created_at,
          authorId: row.author_id,
          status: row.status as LaporanLapangan["status"],
        }));
      } catch (error) {
        logger.error({ err: error }, "Gagal mengambil laporan dari database");
      }
    }
    return mockReports;
  }

  async create(payload: Omit<LaporanLapangan, "id" | "createdAt">): Promise<LaporanLapangan> {
    const data: LaporanLapangan = {
      ...payload,
      id: uuid(),
      createdAt: new Date().toISOString(),
    };

    const useDatabase = await pingDatabase();
    if (useDatabase) {
      try {
        const pool = getPool();
        await pool.query(
          "INSERT INTO reports (id, komoditas, kuota_tersalurkan, latitude, longitude, alamat, foto_url, catatan, created_at, author_id, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
          [
            data.id,
            data.komoditas,
            data.kuotaTersalurkan,
            data.lokasi.latitude,
            data.lokasi.longitude,
            data.lokasi.alamat,
            data.fotoUrl ?? "",
            data.catatan,
            data.createdAt,
            data.authorId,
            data.status,
          ]
        );
      } catch (error) {
        logger.error({ err: error }, "Gagal menyimpan laporan ke database");
      }
    } else {
      mockReports.unshift(data);
    }

    return data;
  }
}
