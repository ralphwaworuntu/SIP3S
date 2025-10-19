import { getPool, pingDatabase } from "@/config/database";
import { logger } from "@/utils/logger";
import { mockPplAssignments, mockPplUploads } from "@/repositories/mock-storage";
export class PplRepository {
    async listAssignmentsByEmail(email) {
        const useDatabase = await pingDatabase();
        if (useDatabase) {
            try {
                const pool = getPool();
                const [rows] = await pool.query("SELECT id, ppl_email, wilayah_id, wilayah_name, kecamatan, desa, bhabin_email FROM ppl_assignments WHERE ppl_email = ? AND (aktif IS NULL OR aktif <> 0)", [email]);
                return rows.map((row) => ({
                    id: row.id,
                    pplEmail: row.ppl_email,
                    wilayahId: row.wilayah_id,
                    wilayahName: row.wilayah_name,
                    kecamatan: row.kecamatan,
                    desa: row.desa,
                    bhabinEmail: row.bhabin_email,
                }));
            }
            catch (error) {
                logger.error({ err: error }, "Gagal mengambil assignment PPL dari database");
            }
        }
        return mockPplAssignments.filter((assignment) => assignment.pplEmail === email);
    }
    async listUploadsByEmail(email, type) {
        const useDatabase = await pingDatabase();
        if (useDatabase) {
            try {
                const pool = getPool();
                const params = [email];
                let sql = "SELECT id, category, filename, filepath, mimetype, size_kb, total_records, status, ppl_email, wilayah_id, wilayah_name, notes, message, uploaded_at FROM ppl_uploads WHERE ppl_email = ?";
                if (type) {
                    sql += " AND category = ?";
                    params.push(type);
                }
                sql += " ORDER BY uploaded_at DESC LIMIT 200";
                const [rows] = await pool.query(sql, params);
                return rows.map((row) => ({
                    id: row.id,
                    type: row.category,
                    filename: row.filename,
                    filepath: row.filepath,
                    mimetype: row.mimetype,
                    sizeInKb: row.size_kb ?? undefined,
                    totalRecords: row.total_records ?? undefined,
                    status: row.status,
                    uploader: row.ppl_email,
                    wilayahId: row.wilayah_id,
                    wilayahName: row.wilayah_name,
                    notes: row.notes ?? undefined,
                    uploadedAt: row.uploaded_at,
                    message: row.message ?? undefined,
                }));
            }
            catch (error) {
                logger.error({ err: error }, "Gagal mengambil riwayat upload PPL dari database");
            }
        }
        const data = mockPplUploads.filter((record) => record.uploader === email);
        return type ? data.filter((record) => record.type === type) : data;
    }
    async createUpload(data) {
        const record = {
            id: data.id,
            type: data.category,
            filename: data.filename,
            filepath: data.filepath,
            mimetype: data.mimetype,
            sizeInKb: data.sizeInKb,
            totalRecords: data.totalRecords,
            status: data.status,
            uploader: data.uploader,
            wilayahId: data.wilayahId,
            wilayahName: data.wilayahName,
            notes: data.notes,
            uploadedAt: data.uploadedAt,
            message: data.message,
        };
        const useDatabase = await pingDatabase();
        if (useDatabase) {
            try {
                const pool = getPool();
                await pool.query("INSERT INTO ppl_uploads (id, category, filename, filepath, mimetype, size_kb, total_records, status, ppl_email, wilayah_id, wilayah_name, notes, message, uploaded_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
                    data.id,
                    data.category,
                    data.filename,
                    data.filepath,
                    data.mimetype,
                    data.sizeInKb ?? null,
                    data.totalRecords ?? null,
                    data.status,
                    data.uploader,
                    data.wilayahId,
                    data.wilayahName,
                    data.notes ?? null,
                    data.message ?? null,
                    data.uploadedAt,
                ]);
            }
            catch (error) {
                logger.error({ err: error }, "Gagal menyimpan metadata upload PPL");
            }
        }
        else {
            mockPplUploads.unshift(record);
        }
        return record;
    }
}
