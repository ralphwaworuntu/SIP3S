import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, UsersThree, WifiHigh } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/utils/constants";
import { mockAnalytics, mockAgencies } from "@/utils/mock-data";

const LandingPage = () => (
  <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-16 pt-10">
    <section className="grid gap-10 rounded-3xl bg-abu-kartu/70 p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-biru-pemerintah">SIP3S</h1>
        <p className="text-lg text-slate-netral">
          Sistem informasi kolaboratif untuk memastikan distribusi produk pertanian bersubsidi di NTT tepat sasaran,
          transparan, dan dapat dipertanggungjawabkan.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to={ROUTES.loginAdmin}>
              Login Admin <ArrowRight className="ml-2 h-5 w-5" weight="bold" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to={ROUTES.loginUser}>
              Login Petugas Lapangan <ArrowRight className="ml-2 h-5 w-5" weight="bold" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Keamanan Data",
              description: "Enkripsi lapisan ganda & audit trail real-time",
            },
            {
              icon: UsersThree,
              title: "Kolaborasi",
              description: "Sinkron data antara Polda, pemerintah daerah, & BULOG",
            },
            {
              icon: WifiHigh,
              title: "Offline-First",
              description: "Tetap produktif tanpa koneksi internet",
            },
          ].map((item) => (
            <Card key={item.title} className="border-none bg-white/80">
              <CardHeader className="space-y-2">
                <item.icon className="h-8 w-8 text-biru-pemerintah" weight="bold" />
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-3xl border border-biru-pemerintah/30 bg-white p-6">
        <h2 className="text-2xl font-semibold text-teks-gelap">Data NTT Terkini</h2>
        <Tabs defaultValue="distribusi">
          <TabsList>
            <TabsTrigger value="distribusi">Distribusi</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
            <TabsTrigger value="pelanggaran">Pelanggaran</TabsTrigger>
          </TabsList>
          <TabsContent value="distribusi" className="space-y-4">
            <p className="text-sm text-slate-netral">Total Kuota: {mockAnalytics.distribusi.totalKuota} ton</p>
            <p className="text-3xl font-bold text-biru-pemerintah">{mockAnalytics.distribusi.tersalurkan} ton</p>
            <p className="text-sm text-slate-netral">Tersalurkan ({mockAnalytics.distribusi.persentase}%)</p>
          </TabsContent>
          <TabsContent value="laporan" className="space-y-4">
            <p className="text-sm text-slate-netral">Laporan bulan ini</p>
            <p className="text-3xl font-bold text-biru-pemerintah">{mockAnalytics.laporan.bulanIni}</p>
            <p className="text-sm text-slate-netral">{mockAnalytics.laporan.outstanding} menunggu tindak lanjut</p>
          </TabsContent>
          <TabsContent value="pelanggaran" className="space-y-4">
            <p className="text-sm text-slate-netral">Kasus berpotensi pelanggaran</p>
            <p className="text-3xl font-bold text-oranye-hangat">{mockAnalytics.pelanggaran.potensial}</p>
            <p className="text-sm text-slate-netral">{mockAnalytics.pelanggaran.tertangani} sudah tertangani</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-teks-gelap">Mitra Kolaborasi</h2>
      <div className="grid gap-4 rounded-3xl border border-abu-kartu bg-white p-6 md:grid-cols-3">
        {mockAgencies.map((agency) => (
          <div key={agency} className="flex h-16 items-center justify-center rounded-2xl bg-abu-kartu/50 px-4 text-sm font-medium text-slate-netral">
            {agency}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-netral">
        * Ganti placeholder di atas dengan logo resmi (9 mitra) termasuk berkas BACKDROP_-_PELATIHAN_PPL.png untuk branding utama.
      </p>
    </section>

    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Workflow Terintegrasi</CardTitle>
          <CardDescription>Empat dashboard sesuai struktur organisasi SIP3S</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-netral">
          <ul className="list-disc space-y-2 pl-5">
            <li>Super Admin: kendalikan monitoring provinsi, peta interaktif, audit trail.</li>
            <li>Admin Spesialis: kelola laporan, terbitkan tugas prioritas, filter cepat.</li>
            <li>Super User (BULOG): pantau stok komoditas & status sinkronisasi.</li>
            <li>Bhabinkamtibmas: jaga keamanan distribusi dan validasi temuan lapangan bersama PPL.</li>
            <li>Penyuluh Pertanian Lapangan (PPL): damping petani, sinkronkan progres distribusi dan kesiapan gudang.</li>
            <li>Petugas Lapangan: input laporan offline, unggah foto, otomatis GPS.</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Standar Pemerintahan</CardTitle>
          <CardDescription>Kualitas data dan keamanan setara aplikasi resmi instansi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-netral">
          <ul className="list-disc space-y-2 pl-5">
            <li>Autentikasi multi peran, kontrol akses ketat.</li>
            <li>Enkripsi di transit, pencatatan aktivitas lengkap.</li>
            <li>Audit data dan pelacakan penugasan.</li>
            <li>Responsif di mobile dengan tombol sentuh =48px.</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  </main>
);

export default LandingPage;

