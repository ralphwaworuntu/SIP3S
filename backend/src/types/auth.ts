export type UserRole = "super-admin" | "admin-spesialis" | "super-user" | "end-user" | "bhabinkamtibmas" | "ppl";

export interface UserAccount {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  agency?: string;
}

export interface AuthResponse {
  token: string;
  user: UserAccount;
}
