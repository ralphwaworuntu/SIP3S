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
  filepath: string;
  mimetype: string;
  sizeInKb?: number;
  totalRecords?: number;
  status: PplUploadStatus;
  uploader: string;
  wilayahId: string;
  wilayahName: string;
  notes?: string;
  uploadedAt: string;
  message?: string;
}

export interface CreateUploadParams {
  id: string;
  category: PplUploadCategory;
  filename: string;
  filepath: string;
  mimetype: string;
  sizeInKb?: number;
  totalRecords?: number;
  status: PplUploadStatus;
  uploader: string;
  wilayahId: string;
  wilayahName: string;
  notes?: string;
  message?: string;
  uploadedAt: string;
}
