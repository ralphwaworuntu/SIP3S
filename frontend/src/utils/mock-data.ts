import type { Task } from "@/types/task";
import type { LaporanLapangan } from "@/services/report-service";
import type { PplAssignment, PplUploadRecord } from "@/types/ppl";
import type {
  BhabinAccount,
  EscortRequest,
  HarvestVerification,
  PlantConditionReport,
  RecipientVerification,
} from "@/types/bhabin";

export const mockTasks: Task[] = [
  {
    id: "t-001",
    region: "Kupang Kota",
    dueDate: "2025-09-30",
    priority: "high",
    status: "baru",
    title: "Patroli Pengamanan Gudang Subsidi",
    description: "Sinkronkan checklist keamanan gudang Bulog bersama PPL dan pastikan CCTV aktif.",
    assignedTo: ["bhabin@polda.ntt.gov.id", "ppl@distan.ntt.go.id"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t-002",
    region: "Kabupaten Kupang",
    dueDate: "2025-10-02",
    priority: "medium",
    status: "proses",
    title: "Validasi RPK Desa",
    description: "Lakukan pengecekan lapangan terhadap kios pangan untuk memastikan tidak ada penyelewengan.",
    assignedTo: ["bhabin@polda.ntt.gov.id"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t-003",
    region: "Amarasi Barat",
    dueDate: "2025-10-05",
    priority: "medium",
    status: "baru",
    title: "Monitoring Penyaluran Benih Jagung",
    description: "Catat kendala distribusi benih dan koordinasikan dukungan teknis petani.",
    assignedTo: ["ppl@distan.ntt.go.id"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "t-004",
    region: "Kabupaten Kupang",
    dueDate: "2025-10-08",
    priority: "low",
    status: "baru",
    title: "Rekapitulasi Penyaluran Pupuk",
    description: "Masukkan laporan stok pupuk berdasarkan kunjungan bersama petugas lapangan.",
    assignedTo: ["petugas@kab.kupang.id"],
    updatedAt: new Date().toISOString(),
  },
];

export const mockReports: LaporanLapangan[] = [
  {
    id: "r-001",
    komoditas: "Pupuk Urea",
    kuotaTersalurkan: 85,
    lokasi: {
      latitude: -10.1778,
      longitude: 123.607,
      alamat: "Gudang Bulog Oebobo, Kota Kupang",
    },
    fotoUrl: "/placeholders/laporan-1.jpg",
    catatan: "Distribusi berjalan lancar, tidak ada kendala berarti.",
    createdAt: "2025-09-01T08:30:00+08:00",
    authorId: "petugas@kab.kupang.id",
    status: "terkirim",
  },
  {
    id: "r-002",
    komoditas: "Benih Jagung",
    kuotaTersalurkan: 60,
    lokasi: {
      latitude: -10.325,
      longitude: 123.588,
      alamat: "Kecamatan Amarasi Barat, Kabupaten Kupang",
    },
    fotoUrl: "/placeholders/laporan-2.jpg",
    catatan: "Kendala transportasi menyebabkan keterlambatan.",
    createdAt: "2025-09-05T09:12:00+08:00",
    authorId: "petugas@kab.kupang.id",
    status: "pending",
  },
];

export const mockAnalytics = {
  distribusi: {
    totalKuota: 1250,
    tersalurkan: 975,
    persentase: 78,
  },
  laporan: {
    bulanIni: 42,
    outstanding: 5,
  },
  pelanggaran: {
    potensial: 3,
    tertangani: 2,
  },
};

export const mockAgencies = [
  "Polda NTT",
  "Polres Kupang",
  "BULOG",
  "Dinas Pertanian NTT",
  "Dinas Ketahanan Pangan Kota Kupang",
  "PT Pertani",
  "PT Pupuk Indonesia",
  "Bank BRI",
  "Bank NTT",
];

export const mockPplAssignments: PplAssignment[] = [
  {
    id: "assign-ol-001",
    pplEmail: "ppl@distan.ntt.go.id",
    wilayahId: "WIL-OL-001",
    wilayahName: "Kelurahan Oelomin",
    kecamatan: "Nekamese",
    desa: "Oelomin",
    bhabinEmail: "bhabin@polda.ntt.gov.id",
  },
  {
    id: "assign-ol-002",
    pplEmail: "ppl@distan.ntt.go.id",
    wilayahId: "WIL-OL-002",
    wilayahName: "Kelurahan Tesbatan",
    kecamatan: "Nekamese",
    desa: "Tesbatan",
    bhabinEmail: "bhabin@polda.ntt.gov.id",
  },
  {
    id: "assign-ol-003",
    pplEmail: "ppl@distan.ntt.go.id",
    wilayahId: "WIL-OL-003",
    wilayahName: "Kelurahan Lelogama",
    kecamatan: "Amfoang Selatan",
    desa: "Lelogama",
    bhabinEmail: "bhabin@polda.ntt.gov.id",
  },
];

export const mockPplUploads: PplUploadRecord[] = [
  {
    id: "upload-001",
    type: "erdkk",
    filename: "erdkk_nekamese_jan2025.csv",
    wilayahId: "WIL-OL-001",
    wilayahName: "Kelurahan Oelomin",
    uploader: "ppl@distan.ntt.go.id",
    totalRecords: 21,
    sizeInKb: 42,
    status: "selesai",
    uploadedAt: "2025-01-10T09:15:00+08:00",
    message: "Sinkron otomatis dengan Bhabinkamtibmas.",
  },
  {
    id: "upload-002",
    type: "simluhtan",
    filename: "cpcl_tesbatan_des2024.csv",
    wilayahId: "WIL-OL-002",
    wilayahName: "Kelurahan Tesbatan",
    uploader: "ppl@distan.ntt.go.id",
    totalRecords: 34,
    sizeInKb: 56,
    status: "tersimpan-offline",
    uploadedAt: "2025-01-05T14:40:00+08:00",
    message: "Menunggu koneksi stabil untuk mengunggah ke server.",
  },
  {
    id: "upload-003",
    type: "erdkk",
    filename: "erdkk_lelogama_feb2025.xlsx",
    wilayahId: "WIL-OL-003",
    wilayahName: "Kelurahan Lelogama",
    uploader: "ppl@distan.ntt.go.id",
    totalRecords: 18,
    sizeInKb: 310,
    status: "diproses",
    uploadedAt: "2025-02-02T08:05:00+08:00",
    message: "Sedang divalidasi oleh Admin Spesialis.",
  },
];

export const mockBhabinAccounts: BhabinAccount[] = [
  {
    id: "bhabin-001",
    nama: "Bhabinkamtibmas Kupang",
    email: "bhabin@polda.ntt.gov.id",
    agency: "Polsek Kupang Kota",
    wilayah: "Kelurahan Oelomin",
    phone: "0812-0000-0000",
    status: "active",
    createdAt: "2025-01-01T08:00:00+08:00",
    updatedAt: "2025-01-01T08:00:00+08:00",
  },
];

export const mockBhabinRecipients: RecipientVerification[] = [
  {
    id: "rv-001",
    nik: "5301166304730002",
    nama: "Aksafina Kenlopo",
    kelompok: "Suka Maju",
    komoditas: "Jagung",
    wilayah: "Kelurahan Oelomin",
    jadwalDistribusi: "2025-01-08",
    status: "pending",
  },
  {
    id: "rv-002",
    nik: "5301162208770002",
    nama: "Alfons Yakob Absalom Takesan",
    kelompok: "Suka Maju",
    komoditas: "Jagung",
    wilayah: "Kelurahan Oelomin",
    jadwalDistribusi: "2025-01-08",
    status: "pending",
  },
  {
    id: "rv-003",
    nik: "5301161404830001",
    nama: "Aprison Aminadap Jabi",
    kelompok: "Suka Maju",
    komoditas: "Jagung",
    wilayah: "Kelurahan Tesbatan",
    jadwalDistribusi: "2025-01-09",
    status: "verified",
    verifiedAt: "2025-01-09T15:20:00+08:00",
    notes: "Sudah menerima 75kg Urea dan 90kg NPK.",
  },
];

export const mockPlantProgress: PlantConditionReport[] = [
  {
    id: "pc-001",
    wilayah: "Kelurahan Oelomin",
    petani: "Aksafina Kenlopo",
    komoditas: "Jagung",
    fase: "vegetatif",
    kondisi: "baik",
    catatan: "Pertumbuhan merata, serangan hama rendah.",
    updatedAt: "2025-01-12T09:00:00+08:00",
  },
  {
    id: "pc-002",
    wilayah: "Kelurahan Tesbatan",
    petani: "Daud Takesan",
    komoditas: "Jagung",
    fase: "generatif",
    kondisi: "waspada",
    catatan: "Ditemukan ulat grayak di beberapa petak, koordinasi dengan PPL untuk pengendalian.",
    updatedAt: "2025-01-13T08:45:00+08:00",
  },
];

export const mockHarvestVerifications: HarvestVerification[] = [
  {
    id: "hv-001",
    petani: "Yeheskiel Abnetego Kenlopo",
    komoditas: "Jagung",
    luasPanenHa: 1,
    produksiTon: 2.4,
    lokasi: "Kelurahan Oelomin",
    diverifikasiAt: "2025-03-05T10:00:00+08:00",
    keterangan: "Butuh bantuan pengeringan di RPK Anugerah.",
  },
];

export const mockEscortRequests: EscortRequest[] = [
  {
    id: "er-001",
    wilayah: "Kelurahan Oelomin",
    jadwal: "2025-03-06T07:30:00+08:00",
    titikKumpul: "Balai Desa Oelomin",
    estimasiPeserta: 48,
    kebutuhanPersonel: 6,
    status: "dijadwalkan",
    catatan: "Permintaan kawalan saat pengangkutan hasil panen ke Gudang Bulog Penfui.",
    diajukanOleh: "bhabin@polda.ntt.gov.id",
    diajukanAt: "2025-03-04T16:40:00+08:00",
  },
];
export const PASSWORD_PLACEHOLDER = 'password123';



