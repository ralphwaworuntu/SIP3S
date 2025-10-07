import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";

import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/utils/constants";

const LoginUser = () => (
  <main className="mx-auto flex min-h-[80vh] max-w-5xl flex-col gap-6 px-4 py-10">
    <Link to={ROUTES.beranda} className="flex items-center gap-2 text-sm text-biru-pemerintah">
      <ArrowLeft className="h-4 w-4" weight="bold" /> Kembali ke beranda
    </Link>
    <LoginForm
      tipe="user"
      title="Login Pengguna SIP3S"
      description="Masuk sebagai Super User BULOG, Bhabinkamtibmas, atau Penyuluh Pertanian Lapangan."
      defaultEmail="user@bulog.kupang.gov.id"
      quickAccounts={[
        { label: "Super User BULOG", email: "user@bulog.kupang.gov.id" },
        { label: "Bhabinkamtibmas", email: "bhabin@polda.ntt.gov.id" },
        { label: "PPL", email: "ppl@distan.ntt.go.id" },
        { label: "Petugas Lapangan", email: "petugas@kab.kupang.id" },
      ]}
    />
  </main>
);

export default LoginUser;
