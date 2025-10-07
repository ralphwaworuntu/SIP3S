import { promises as fs } from "fs";
import { dirname, join } from "path";
import { v4 as uuid } from "uuid";

import { mockBhabinAccounts, mockUserPasswords, mockUsers, PASSWORD_PLACEHOLDER } from "@/repositories/mock-storage";
import type { BhabinAccount, BhabinAccountPayload, BhabinAccountRecord } from "@/types/bhabin";

const STORAGE_FILE = join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads", "bhabin-accounts.json");

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const cloneRecords = (records: BhabinAccountRecord[]): BhabinAccountRecord[] =>
  records.map((record) => ({ ...record }));

export class BhabinRepository {
  private async ensureDir() {
    await fs.mkdir(dirname(STORAGE_FILE), { recursive: true });
  }

  private async readRecords(): Promise<BhabinAccountRecord[]> {
    try {
      const raw = await fs.readFile(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as BhabinAccountRecord[];
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          email: normalizeEmail(item.email),
          status: item.status ?? "active",
          password: item.password ?? PASSWORD_PLACEHOLDER,
        }));
      }
    } catch (_error) {
      // fallback to mock when file missing or corrupted
    }
    return cloneRecords(mockBhabinAccounts);
  }

  private async writeRecords(records: BhabinAccountRecord[]) {
    await this.ensureDir();
    const payload = JSON.stringify(records, null, 2);
    await fs.writeFile(STORAGE_FILE, payload, "utf-8");
    this.syncMock(records);
  }

  private syncMock(records: BhabinAccountRecord[]) {
    mockBhabinAccounts.length = 0;
    mockBhabinAccounts.push(...cloneRecords(records));

    const existingBhabinEmails = Object.keys(mockUsers).filter(
      (email) => mockUsers[email]?.role === "bhabinkamtibmas"
    );
    for (const email of existingBhabinEmails) {
      if (!records.some((record) => record.email === email)) {
        delete mockUsers[email];
        delete mockUserPasswords[email];
      }
    }

    for (const record of records) {
      mockUsers[record.email] = {
        id: record.id,
        nama: record.nama,
        email: record.email,
        role: "bhabinkamtibmas",
        agency: record.agency,
      };
      mockUserPasswords[record.email] = record.password ?? PASSWORD_PLACEHOLDER;
    }
  }

  private stripSecret(record: BhabinAccountRecord): BhabinAccount {
    const { password: _password, ...publicFields } = record;
    void _password;
    return publicFields;
  }

  async list(): Promise<BhabinAccount[]> {
    const records = await this.readRecords();
    return records.map((record) => this.stripSecret(record));
  }

  async create(payload: BhabinAccountPayload): Promise<BhabinAccount> {
    const records = await this.readRecords();
    const email = normalizeEmail(payload.email);
    if (records.some((record) => record.email === email)) {
      throw Object.assign(new Error("Email sudah terdaftar"), { status: 409 });
    }

    const now = new Date().toISOString();
    const record: BhabinAccountRecord = {
      id: uuid(),
      nama: payload.nama.trim(),
      email,
      agency: payload.agency?.trim() || undefined,
      wilayah: payload.wilayah?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      status: payload.status ?? "active",
      password: payload.password?.trim() || PASSWORD_PLACEHOLDER,
      createdAt: now,
      updatedAt: now,
    };

    records.push(record);
    await this.writeRecords(records);
    return this.stripSecret(record);
  }

  async update(id: string, payload: BhabinAccountPayload): Promise<BhabinAccount> {
    const records = await this.readRecords();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { status: 404 });
    }

    const current = records[index];
    const nextEmail = payload.email ? normalizeEmail(payload.email) : current.email;
    if (nextEmail !== current.email && records.some((record) => record.email === nextEmail)) {
      throw Object.assign(new Error("Email sudah terdaftar"), { status: 409 });
    }

    const updated: BhabinAccountRecord = {
      ...current,
      nama: payload.nama ? payload.nama.trim() : current.nama,
      email: nextEmail,
      agency: payload.agency !== undefined ? payload.agency.trim() || undefined : current.agency,
      wilayah: payload.wilayah !== undefined ? payload.wilayah.trim() || undefined : current.wilayah,
      phone: payload.phone !== undefined ? payload.phone.trim() || undefined : current.phone,
      status: payload.status ?? current.status,
      password: payload.password?.trim() || current.password,
      updatedAt: new Date().toISOString(),
    };

    records[index] = updated;
    await this.writeRecords(records);
    return this.stripSecret(updated);
  }

  async remove(id: string): Promise<void> {
    const records = await this.readRecords();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { status: 404 });
    }

    const [removed] = records.splice(index, 1);
    await this.writeRecords(records);
    if (removed) {
      delete mockUsers[removed.email];
      delete mockUserPasswords[removed.email];
    }
  }
}







