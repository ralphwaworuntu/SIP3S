import { promises as fs } from "fs";
import { dirname, join } from "path";
import { v4 as uuid } from "uuid";
import { mockEscortRequests, mockHarvestVerifications, mockPlantProgress, mockRecipientVerifications, } from "@/repositories/mock-storage";
const STORAGE_FILE = join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads", "super-admin-data.json");
const clone = (records) => records.map((item) => (typeof item === "object" ? { ...item } : item));
export class SuperAdminRepository {
    async ensureDir() {
        await fs.mkdir(dirname(STORAGE_FILE), { recursive: true });
    }
    async readState() {
        try {
            const raw = await fs.readFile(STORAGE_FILE, "utf-8");
            const parsed = JSON.parse(raw);
            return {
                recipients: Array.isArray(parsed.recipients) ? clone(parsed.recipients) : clone(mockRecipientVerifications),
                plantReports: Array.isArray(parsed.plantReports) ? clone(parsed.plantReports) : clone(mockPlantProgress),
                harvestVerifications: Array.isArray(parsed.harvestVerifications)
                    ? clone(parsed.harvestVerifications)
                    : clone(mockHarvestVerifications),
                escortRequests: Array.isArray(parsed.escortRequests) ? clone(parsed.escortRequests) : clone(mockEscortRequests),
            };
        }
        catch (_error) {
            return {
                recipients: clone(mockRecipientVerifications),
                plantReports: clone(mockPlantProgress),
                harvestVerifications: clone(mockHarvestVerifications),
                escortRequests: clone(mockEscortRequests),
            };
        }
    }
    async writeState(state) {
        await this.ensureDir();
        const payload = JSON.stringify(state, null, 2);
        await fs.writeFile(STORAGE_FILE, payload, "utf-8");
        mockRecipientVerifications.length = 0;
        mockRecipientVerifications.push(...clone(state.recipients));
        mockPlantProgress.length = 0;
        mockPlantProgress.push(...clone(state.plantReports));
        mockHarvestVerifications.length = 0;
        mockHarvestVerifications.push(...clone(state.harvestVerifications));
        mockEscortRequests.length = 0;
        mockEscortRequests.push(...clone(state.escortRequests));
    }
    async listRecipients() {
        const state = await this.readState();
        return state.recipients;
    }
    async updateRecipient(id, payload) {
        const state = await this.readState();
        const index = state.recipients.findIndex((recipient) => recipient.id === id);
        if (index === -1) {
            throw Object.assign(new Error("Data penerima tidak ditemukan"), { status: 404 });
        }
        const current = state.recipients[index];
        const updated = {
            ...current,
            status: payload.status ?? current.status,
            notes: payload.notes ?? current.notes,
            lokasi: payload.lokasi ?? current.lokasi,
            fotoEvidence: payload.fotoEvidence ?? current.fotoEvidence,
            productType: payload.productType ?? current.productType,
            seedType: payload.seedType ?? current.seedType,
            seedQuantityKg: payload.seedQuantityKg ?? current.seedQuantityKg,
            pupukNpkKg: payload.pupukNpkKg ?? current.pupukNpkKg,
            pupukUreaKg: payload.pupukUreaKg ?? current.pupukUreaKg,
            verifiedAt: payload.status && payload.status !== "pending" ? new Date().toISOString() : current.verifiedAt,
        };
        state.recipients[index] = updated;
        await this.writeState(state);
        return updated;
    }
    async listPlantReports() {
        const state = await this.readState();
        return state.plantReports;
    }
    async createPlantReport(payload) {
        const state = await this.readState();
        const now = new Date().toISOString();
        const record = {
            id: uuid(),
            wilayah: payload.wilayah,
            petani: payload.petani,
            komoditas: payload.komoditas,
            fase: payload.fase,
            kondisi: payload.kondisi,
            catatan: payload.catatan,
            updatedAt: now,
            lokasi: payload.lokasi,
            fotoEvidence: payload.fotoEvidence,
            pupukDigunakanKg: payload.pupukDigunakanKg,
            luasLahanBersihM2: payload.luasLahanBersihM2,
            bibitDitanamKg: payload.bibitDitanamKg,
        };
        state.plantReports.unshift(record);
        await this.writeState(state);
        return record;
    }
    async updatePlantReport(id, payload) {
        const state = await this.readState();
        const index = state.plantReports.findIndex((report) => report.id === id);
        if (index === -1) {
            throw Object.assign(new Error("Laporan tanaman tidak ditemukan"), { status: 404 });
        }
        const current = state.plantReports[index];
        const updated = {
            ...current,
            wilayah: payload.wilayah ?? current.wilayah,
            petani: payload.petani ?? current.petani,
            komoditas: payload.komoditas ?? current.komoditas,
            fase: payload.fase ?? current.fase,
            kondisi: payload.kondisi ?? current.kondisi,
            catatan: payload.catatan ?? current.catatan,
            updatedAt: new Date().toISOString(),
            lokasi: payload.lokasi ?? current.lokasi,
            fotoEvidence: payload.fotoEvidence ?? current.fotoEvidence,
            pupukDigunakanKg: payload.pupukDigunakanKg ?? current.pupukDigunakanKg,
            luasLahanBersihM2: payload.luasLahanBersihM2 ?? current.luasLahanBersihM2,
            bibitDitanamKg: payload.bibitDitanamKg ?? current.bibitDitanamKg,
        };
        state.plantReports[index] = updated;
        await this.writeState(state);
        return updated;
    }
    async removePlantReport(id) {
        const state = await this.readState();
        const index = state.plantReports.findIndex((report) => report.id === id);
        if (index === -1) {
            throw Object.assign(new Error("Laporan tanaman tidak ditemukan"), { status: 404 });
        }
        state.plantReports.splice(index, 1);
        await this.writeState(state);
    }
    async listHarvestVerifications() {
        const state = await this.readState();
        return state.harvestVerifications;
    }
    async createHarvestVerification(payload) {
        const state = await this.readState();
        const record = {
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
            productType: payload.productType,
            seedType: payload.seedType,
            seedQuantityKg: payload.seedQuantityKg,
            pupukNpkKg: payload.pupukNpkKg,
            pupukUreaKg: payload.pupukUreaKg,
        };
        state.harvestVerifications.unshift(record);
        await this.writeState(state);
        return record;
    }
    async updateHarvestVerification(id, payload) {
        const state = await this.readState();
        const index = state.harvestVerifications.findIndex((harvest) => harvest.id === id);
        if (index === -1) {
            throw Object.assign(new Error("Data verifikasi panen tidak ditemukan"), { status: 404 });
        }
        const current = state.harvestVerifications[index];
        const updated = {
            ...current,
            petani: payload.petani ?? current.petani,
            komoditas: payload.komoditas ?? current.komoditas,
            luasPanenHa: payload.luasPanenHa ?? current.luasPanenHa,
            produksiTon: payload.produksiTon ?? current.produksiTon,
            lokasi: payload.lokasi ?? current.lokasi,
            keterangan: payload.keterangan ?? current.keterangan,
            koordinat: payload.koordinat ?? current.koordinat,
            fotoEvidence: payload.fotoEvidence ?? current.fotoEvidence,
            productType: payload.productType ?? current.productType,
            seedType: payload.seedType ?? current.seedType,
            seedQuantityKg: payload.seedQuantityKg ?? current.seedQuantityKg,
            pupukNpkKg: payload.pupukNpkKg ?? current.pupukNpkKg,
            pupukUreaKg: payload.pupukUreaKg ?? current.pupukUreaKg,
        };
        state.harvestVerifications[index] = updated;
        await this.writeState(state);
        return updated;
    }
    async removeHarvestVerification(id) {
        const state = await this.readState();
        const index = state.harvestVerifications.findIndex((harvest) => harvest.id === id);
        if (index === -1) {
            throw Object.assign(new Error("Data verifikasi panen tidak ditemukan"), { status: 404 });
        }
        state.harvestVerifications.splice(index, 1);
        await this.writeState(state);
    }
    async listEscortRequests() {
        const state = await this.readState();
        return state.escortRequests;
    }
    async createEscortRequest(payload) {
        const state = await this.readState();
        const record = {
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
        state.escortRequests.unshift(record);
        await this.writeState(state);
        return record;
    }
    async updateEscortRequest(id, payload) {
        const state = await this.readState();
        const index = state.escortRequests.findIndex((request) => request.id === id);
        if (index === -1) {
            throw Object.assign(new Error("Permintaan pengawalan tidak ditemukan"), { status: 404 });
        }
        const current = state.escortRequests[index];
        const updated = {
            ...current,
            wilayah: payload.wilayah ?? current.wilayah,
            jadwal: payload.jadwal ?? current.jadwal,
            titikKumpul: payload.titikKumpul ?? current.titikKumpul,
            estimasiPeserta: payload.estimasiPeserta ?? current.estimasiPeserta,
            kebutuhanPersonel: payload.kebutuhanPersonel ?? current.kebutuhanPersonel,
            status: payload.status ?? current.status,
            catatan: payload.catatan ?? current.catatan,
            diajukanOleh: payload.diajukanOleh ?? current.diajukanOleh,
            diajukanAt: current.diajukanAt,
        };
        state.escortRequests[index] = updated;
        await this.writeState(state);
        return updated;
    }
    async removeEscortRequest(id) {
        const state = await this.readState();
        const index = state.escortRequests.findIndex((request) => request.id === id);
        if (index === -1) {
            throw Object.assign(new Error("Permintaan pengawalan tidak ditemukan"), { status: 404 });
        }
        state.escortRequests.splice(index, 1);
        await this.writeState(state);
    }
}
