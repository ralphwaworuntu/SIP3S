export type UserRole =
  | "super-admin"
  | "admin-spesialis"
  | "super-user"
  | "end-user"
  | "bhabinkamtibmas"
  | "ppl";

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  token: string;
  agency?: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  tipe: "admin" | "user";
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
