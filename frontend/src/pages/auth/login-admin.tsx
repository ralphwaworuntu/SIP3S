import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";

import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/utils/constants";

const LoginAdmin = () => (
  <main className="mx-auto flex min-h-[80vh] max-w-5xl flex-col gap-6 px-4 py-10">
    <Link to={ROUTES.beranda} className="flex items-center gap-2 text-sm text-biru-pemerintah">
      <ArrowLeft className="h-4 w-4" weight="bold" /> Kembali ke beranda
    </Link>
    <LoginForm
      tipe="admin"
      title="Login Admin SIP3S"
      description="Masuk sebagai Super Admin atau Admin Spesialis untuk mengelola pengawasan distribusi."
      defaultEmail="superadmin@polda.ntt.gov.id"
    />
  </main>
);

export default LoginAdmin;
