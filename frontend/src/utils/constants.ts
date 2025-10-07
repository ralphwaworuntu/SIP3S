export const ROUTES = {
  beranda: "/",
  loginAdmin: "/login/admin",
  loginUser: "/login/user",
  dashboards: "/dashboards",
  superAdmin: "/dashboards/super-admin",
  adminSpesialis: "/dashboards/admin-spesialis",
  superUser: "/dashboards/super-user",
  endUser: "/dashboards/end-user",
  bhabinkamtibmas: "/dashboards/bhabinkamtibmas",
  ppl: "/dashboards/ppl",
  offline: "/offline",
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const ROLES_DISPLAY: Record<string, string> = {
  "super-admin": "Super Admin",
  "admin-spesialis": "Admin Spesialis",
  "super-user": "Super User (BULOG)",
  "end-user": "Petugas Lapangan",
  "bhabinkamtibmas": "Bhabinkamtibmas",
  "ppl": "Penyuluh Pertanian Lapangan",
};

export const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
};

export const INDEXED_DB = {
  name: "sip3s",
  version: 1,
  stores: {
    pendingReports: "pendingReports",
    tasks: "tasks",
  },
} as const;

export const BACKGROUND_SYNC_TAGS = {
  laporan: "sync-laporan",
} as const;


