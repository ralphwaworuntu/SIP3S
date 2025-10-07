import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import { INDEXED_DB } from "@/utils/constants";

interface Sip3sSchema extends DBSchema {
  pendingReports: {
    key: string;
    value: {
      id: string;
      payload: unknown;
      createdAt: number;
    };
    indexes: { createdAt: number };
  };
  tasks: {
    key: string;
    value: {
      id: string;
      region: string;
      dueDate: string;
      priority: "low" | "medium" | "high";
      status: "baru" | "proses" | "selesai";
      title: string;
      description: string;
      assignedTo: string[];
      updatedAt: string;
    };
  };
  session: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<Sip3sSchema>> | null = null;

export const getDb = (): Promise<IDBPDatabase<Sip3sSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<Sip3sSchema>(INDEXED_DB.name, INDEXED_DB.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("pendingReports")) {
          const store = db.createObjectStore("pendingReports", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("tasks")) {
          db.createObjectStore("tasks", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("session")) {
          db.createObjectStore("session", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
};

export type { Sip3sSchema };
