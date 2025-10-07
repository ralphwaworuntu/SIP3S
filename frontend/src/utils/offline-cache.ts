import type { AuthResponse } from "@/types/auth";
import { getDb } from "@/lib/indexed-db";

const SESSION_KEY = "auth";

export const offlineCache = {
  async persistPendingReport(data: { id: string; payload: unknown; createdAt?: number }) {
    const db = await getDb();
    await db.put("pendingReports", {
      id: data.id,
      payload: data.payload,
      createdAt: data.createdAt ?? Date.now(),
    });
  },
  async listPendingReports() {
    const db = await getDb();
    return db.getAllFromIndex("pendingReports", "createdAt");
  },
  async deletePendingReport(id: string) {
    const db = await getDb();
    await db.delete("pendingReports", id);
  },
  async persistSession(response: AuthResponse) {
    const db = await getDb();
    await db.put("session", { id: SESSION_KEY, value: response });
  },
  async readSession(): Promise<AuthResponse | null> {
    const db = await getDb();
    const item = await db.get("session", SESSION_KEY);
    if (!item || typeof item !== "object" || !("value" in item)) {
      return null;
    }
    return item.value as AuthResponse;
  },
  async clearSession() {
    const db = await getDb();
    await db.delete("session", SESSION_KEY);
  },
};
