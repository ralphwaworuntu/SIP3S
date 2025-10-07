export type BhabinStatus = "active" | "inactive";

export interface BhabinAccount {
  id: string;
  nama: string;
  email: string;
  agency?: string;
  wilayah?: string;
  phone?: string;
  status: BhabinStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BhabinAccountRecord extends BhabinAccount {
  password: string;
}

export interface BhabinAccountPayload {
  nama: string;
  email: string;
  agency?: string;
  wilayah?: string;
  phone?: string;
  password?: string;
  status?: BhabinStatus;
}
