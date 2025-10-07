import { v4 as uuid } from "uuid";

import apiClient from "@/services/http";
import type { BhabinAccount, BhabinAccountPayload } from "@/types/bhabin";
import { mockBhabinAccounts } from "@/utils/mock-data";

const STORAGE_KEY = "sip3s.admin.bhabin.accounts";

const clone = (accounts: BhabinAccount[]): BhabinAccount[] => accounts.map((item) => ({ ...item }));

const readLocal = (): BhabinAccount[] => {
  if (typeof window === "undefined") return clone(mockBhabinAccounts);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBhabinAccounts));
      return clone(mockBhabinAccounts);
    }
    const parsed = JSON.parse(raw) as BhabinAccount[] | null;
    if (!parsed || !Array.isArray(parsed)) {
      return clone(mockBhabinAccounts);
    }
    return clone(parsed);
  } catch (error) {
    console.warn("Gagal membaca cache akun Bhabin", error);
    return clone(mockBhabinAccounts);
  }
};

const persistLocal = (accounts: BhabinAccount[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.warn("Gagal menyimpan cache akun Bhabin", error);
  }
};

class AdminBhabinService {
  async list(): Promise<BhabinAccount[]> {
    try {
      const { data } = await apiClient.get<BhabinAccount[]>("/bhabin/accounts");
      persistLocal(data);
      return data;
    } catch (_error) {
      return readLocal();
    }
  }

  async create(payload: BhabinAccountPayload): Promise<BhabinAccount> {
    try {
      const { data } = await apiClient.post<BhabinAccount>("/bhabin/accounts", payload);
      const existing = readLocal().filter((account) => account.id !== data.id);
      persistLocal([data, ...existing]);
      return data;
    } catch (_error) {
      const now = new Date().toISOString();
      const record: BhabinAccount = {
        id: uuid(),
        nama: payload.nama,
        email: payload.email.trim().toLowerCase(),
        agency: payload.agency,
        wilayah: payload.wilayah,
        phone: payload.phone,
        status: payload.status ?? "active",
        createdAt: now,
        updatedAt: now,
      };
      const list = readLocal();
      persistLocal([record, ...list.filter((item) => item.email !== record.email)]);
      return record;
    }
  }

  async update(id: string, payload: BhabinAccountPayload): Promise<BhabinAccount> {
    try {
      const { data } = await apiClient.put<BhabinAccount>(`/bhabin/accounts/${id}`, payload);
      const list = readLocal();
      const next = list.map((account) => (account.id === data.id ? data : account));
      persistLocal(next);
      return data;
    } catch (_error) {
      const list = readLocal();
      const index = list.findIndex((account) => account.id === id);
      if (index === -1) {
        throw new Error("Akun tidak ditemukan secara offline");
      }
      const current = list[index];
      const updated: BhabinAccount = {
        ...current,
        nama: payload.nama ?? current.nama,
        email: payload.email ? payload.email.trim().toLowerCase() : current.email,
        agency: payload.agency ?? current.agency,
        wilayah: payload.wilayah ?? current.wilayah,
        phone: payload.phone ?? current.phone,
        status: payload.status ?? current.status,
        updatedAt: new Date().toISOString(),
      };
      const next = list.map((account) => (account.id === id ? updated : account));
      persistLocal(next);
      return updated;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/bhabin/accounts/${id}`);
      const list = readLocal().filter((account) => account.id !== id);
      persistLocal(list);
    } catch (_error) {
      const list = readLocal();
      const filtered = list.filter((account) => account.id !== id);
      persistLocal(filtered);
    }
  }
}

export const adminBhabinService = new AdminBhabinService();

