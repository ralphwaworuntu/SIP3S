export type VerificationStatus = "pending" | "verified" | "rejected";

export interface GeoPoint {
  latitude: number;
  longitude: number;
  alamat: string;
}

export interface BhabinAssignment {
  id: string;
  bhabinEmail: string;
  wilayahId: string;
  wilayahName: string;
  kecamatan: string;
  desa: string;
  pplEmail?: string;
}

export interface RecipientVerification {
  id: string;
  nik: string;
  nama: string;
  kelompok: string;
  komoditas: string;
  wilayah: string;
  jadwalDistribusi: string;
  status: VerificationStatus;
  verifiedAt?: string;
  notes?: string;
  lokasi?: GeoPoint;
  fotoEvidence?: string;
  productType?: "benih" | "pupuk";
  seedType?: string;
  seedQuantityKg?: number;
  pupukNpkKg?: number;
  pupukUreaKg?: number;
}

export interface PlantConditionReport {
  id: string;
  wilayah: string;
  petani: string;
  komoditas: string;
  fase: string;
  kondisi: "baik" | "waspada" | "kritikal";
  catatan: string;
  dokumentasiUrl?: string;
  updatedAt: string;
  lokasi?: GeoPoint;
  fotoEvidence?: string;
  pupukDigunakanKg?: number;
  luasLahanBersihM2?: number;
  bibitDitanamKg?: number;
}

export interface HarvestVerification {
  id: string;
  petani: string;
  komoditas: string;
  luasPanenHa: number;
  produksiTon: number;
  lokasi: string;
  diverifikasiAt: string;
  keterangan?: string;
  koordinat?: GeoPoint;
  fotoEvidence?: string;
  productType?: "benih" | "pupuk";
  seedType?: string;
  seedQuantityKg?: number;
  pupukNpkKg?: number;
  pupukUreaKg?: number;
}

export interface EscortRequest {
  id: string;
  wilayah: string;
  jadwal: string;
  titikKumpul: string;
  estimasiPeserta: number;
  kebutuhanPersonel: number;
  status: "baru" | "dijadwalkan" | "selesai";
  catatan?: string;
  diajukanOleh: string;
  diajukanAt: string;
}

export interface VerifyRecipientPayload {
  id: string;
  notes?: string;
  lokasi: GeoPoint;
  fotoEvidence: string;
  productType: "benih" | "pupuk";
  seedType?: string;
  seedQuantityKg?: number;
  pupukNpkKg?: number;
  pupukUreaKg?: number;
}

export interface PlantConditionPayload {
  wilayah: string;
  petani: string;
  komoditas: string;
  fase: string;
  kondisi: "baik" | "waspada" | "kritikal";
  catatan: string;
  lokasi: GeoPoint;
  fotoEvidence: string;
  pupukDigunakanKg?: number;
  luasLahanBersihM2?: number;
  bibitDitanamKg?: number;
  productType?: "benih" | "pupuk";
  seedType?: string;
  seedQuantityKg?: number;
  pupukNpkKg?: number;
  pupukUreaKg?: number;
}

export interface HarvestVerificationPayload {
  petani: string;
  komoditas: string;
  luasPanenHa: number;
  produksiTon: number;
  lokasi: string;
  keterangan?: string;
  koordinat: GeoPoint;
  fotoEvidence: string;
  productType?: "benih" | "pupuk";
  seedType?: string;
  seedQuantityKg?: number;
  pupukNpkKg?: number;
  pupukUreaKg?: number;
}

export interface EscortRequestPayload {
  wilayah: string;
  jadwal: string;
  titikKumpul: string;
  estimasiPeserta: number;
  kebutuhanPersonel: number;
  catatan?: string;
  diajukanOleh: string;
}


export type BhabinAccountStatus = "active" | "inactive";

export interface BhabinAccount {
  id: string;
  nama: string;
  email: string;
  agency?: string;
  wilayah?: string;
  phone?: string;
  status: BhabinAccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BhabinAccountPayload {
  nama: string;
  email: string;
  agency?: string;
  wilayah?: string;
  phone?: string;
  password?: string;
  status?: BhabinAccountStatus;
}
