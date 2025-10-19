import { v4 as uuid } from "uuid";

import type { AuthResponse, LoginPayload, UserRole } from "@/types/auth";
import { ROUTES } from "@/utils/constants";
import { offlineCache } from "@/utils/offline-cache";
import apiClient from "@/services/http";

const ADMIN_CREDENTIALS: Record<string, { role: UserRole; nama: string; agency?: string }> = {
  "superadmin@polda.ntt.gov.id": {
    role: "super-admin",
    nama: "Super Admin Polda NTT",
    agency: "Polda NTT",
  },
  "admin@polres.kupang.gov.id": {
    role: "admin-spesialis",
    nama: "Admin Polres Kupang",
    agency: "Polres Kupang",
  },
};

const USER_CREDENTIALS: Record<string, { role: UserRole; nama: string; agency?: string }> = {
  "user@bulog.kupang.gov.id": {
    role: "super-user",
    nama: "BULOG Kupang",
    agency: "BULOG",
  },
  "bhabin@polda.ntt.gov.id": {
    role: "bhabinkamtibmas",
    nama: "Bhabinkamtibmas Kupang",
    agency: "Polsek Kupang Kota",
  },
  "ppl@distan.ntt.go.id": {
    role: "ppl",
    nama: "Penyuluh Pertanian Lapangan",
    agency: "Dinas Pertanian NTT",
  },
  "petugas@kab.kupang.id": {
    role: "end-user",
    nama: "Petugas Lapangan Kupang",
    agency: "Kabupaten Kupang",
  },
};

const PASSWORD = "password123";

class AuthService {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
      await offlineCache.persistSession(data);
      return data;
    } catch (error) {
      const source = payload.tipe === "admin" ? ADMIN_CREDENTIALS : USER_CREDENTIALS;
      const candidate = source[payload.email];
      if (!candidate || payload.password !== PASSWORD) {
        throw error;
      }
      const mocked: AuthResponse = {
        user: {
          id: uuid(),
          nama: candidate.nama,
          email: payload.email,
          role: candidate.role,
          agency: candidate.agency,
          token: `offline-${candidate.role}`,
        },
        token: `offline-${candidate.role}`,
      };
      await offlineCache.persistSession(mocked);
      return mocked;
    }
  }

  resolveDashboardRoute(role: UserRole): string {
    switch (role) {
      case "super-admin":
        return ROUTES.superAdmin;
      case "admin-spesialis":
        return ROUTES.adminSpesialis;
      case "super-user":
        return ROUTES.superUser;
      case "end-user":
        return ROUTES.endUser;
      case "bhabinkamtibmas":
        return ROUTES.bhabinkamtibmas;
      case "ppl":
        return ROUTES.ppl;
      default:
        return ROUTES.beranda;
    }
  }
}

export const authService = new AuthService();




