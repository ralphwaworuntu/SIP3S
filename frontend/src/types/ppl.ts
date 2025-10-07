export type PplUploadCategory = "simluhtan" | "erdkk";

export type PplUploadStatus = "selesai" | "diproses" | "tersimpan-offline" | "gagal";

export interface PplAssignment {
  id: string;
  pplEmail: string;
  wilayahId: string;
  wilayahName: string;
  kecamatan: string;
  desa: string;
  bhabinEmail: string;
}

export interface PplUploadRecord {
  id: string;
  type: PplUploadCategory;
  filename: string;
  wilayahId: string;
  wilayahName: string;
  uploader: string;
  totalRecords?: number;
  sizeInKb?: number;
  status: PplUploadStatus;
  uploadedAt: string;
  message?: string;
}

export interface UploadPayload {
  file: File;
  type: PplUploadCategory;
  assignment: PplAssignment;
  uploader: string;
  notes?: string;
}
