export interface LaporanLapangan {
  id: string;
  komoditas: string;
  kuotaTersalurkan: number;
  lokasi: {
    latitude: number;
    longitude: number;
    alamat: string;
  };
  fotoUrl?: string;
  catatan: string;
  createdAt: string;
  authorId: string;
  status: "pending" | "terkirim" | "gagal";
}
