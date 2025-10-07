import { EnvelopeSimple, Lock } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context";
import type { LoginPayload } from "@/types/auth";

const schema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Minimal 6 karakter" }),
});

export type LoginFormValues = z.infer<typeof schema>;

interface QuickAccount {
  label: string;
  email: string;
  helper?: string;
}

interface LoginFormProps {
  tipe: LoginPayload["tipe"];
  title: string;
  description: string;
  defaultEmail?: string;
  quickAccounts?: QuickAccount[];
}

export const LoginForm: React.FC<LoginFormProps> = ({ tipe, title, description, defaultEmail, quickAccounts }) => {
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultEmail ?? "",
      password: "",
    },
  });

  const handleQuickFill = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({ ...values, tipe });
    } catch (error) {
      setError("password", { message: "Email atau password tidak cocok" });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-abu-kartu bg-white/90 p-8 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-teks-gelap">{title}</h1>
        <p className="text-sm text-slate-netral">{description}</p>
        {quickAccounts && quickAccounts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {quickAccounts.map((account) => (
              <Button
                key={account.email}
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleQuickFill(account.email)}
              >
                {account.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-teks-gelap">Email</span>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-netral/40 bg-white px-4 py-3 focus-within:border-biru-pemerintah">
            <EnvelopeSimple className="h-5 w-5 text-slate-netral" weight="bold" />
            <input
              {...register("email")}
              type="email"
              className="w-full border-none text-sm outline-none"
              placeholder="nama@instansi.go.id"
              inputMode="email"
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="text-xs text-oranye-hangat">{errors.email.message}</span>}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-teks-gelap">Kata sandi</span>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-netral/40 bg-white px-4 py-3 focus-within:border-biru-pemerintah">
            <Lock className="h-5 w-5 text-slate-netral" weight="bold" />
            <input
              {...register("password")}
              type="password"
              className="w-full border-none text-sm outline-none"
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
            />
          </div>
          {errors.password && <span className="text-xs text-oranye-hangat">{errors.password.message}</span>}
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Memverifikasi..." : "Masuk"}
        </Button>
        <Alert variant="info" className="text-xs">
          Gunakan kata sandi <strong>password123</strong> sesuai kredensial mock yang disediakan.
        </Alert>
      </form>
    </div>
  );
};
