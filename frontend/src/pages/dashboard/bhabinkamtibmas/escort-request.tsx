import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { bhabinService } from "@/services/bhabin-service";
import type { EscortRequestPayload, EscortRequest } from "@/types/bhabin";

const escortSchema = z.object({
  wilayah: z.string().min(2, "Wajib diisi"),
  jadwal: z.string().min(1, "Pilih jadwal"),
  titikKumpul: z.string().min(3, "Wajib diisi"),
  estimasiPeserta: z.coerce.number().min(1, "Minimal 1 orang"),
  kebutuhanPersonel: z.coerce.number().min(1, "Minimal 1 personel"),
  catatan: z.string().optional(),
});

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

const statusBadge: Record<EscortRequest["status"], { label: string; variant: "success" | "warning" | "neutral" }> = {
  baru: { label: "Menunggu", variant: "warning" },
  dijadwalkan: { label: "Dijadwalkan", variant: "neutral" },
  approved: { label: "Disetujui", variant: "success" },
  selesai: { label: "Selesai", variant: "success" },
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

const EscortRequestPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const form = useForm<EscortRequestPayload>({
    resolver: zodResolver(escortSchema),
    defaultValues: {
      wilayah: "",
      jadwal: "",
      titikKumpul: "",
      estimasiPeserta: 20,
      kebutuhanPersonel: 4,
      catatan: "",
    },
  });

  const escortQuery = useQuery({
    queryKey: ["bhabin", "escort"],
    queryFn: () => bhabinService.listEscortRequests(),
  });

  const escortMutation = useMutation({
    mutationFn: (payload: EscortRequestPayload) =>
      bhabinService.submitEscortRequest({ ...payload, diajukanOleh: user?.email ?? "bhabin@polda.ntt.gov.id" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bhabin", "escort"] });
      setFeedback({ type: "success", message: "Permintaan pengawalan terkirim." });
      form.reset({ wilayah: "", jadwal: "", titikKumpul: "", estimasiPeserta: 20, kebutuhanPersonel: 4, catatan: "" });
    },
    onError: () => setFeedback({ type: "error", message: "Gagal mengirim permintaan. Coba ulangi." }),
  });

  const requests = escortQuery.data ?? [];

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Permintaan pengawalan panen</CardTitle>
          <CardDescription>Kirim jadwal kawalan ke Polres untuk dukungan personel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-netral">
          {feedback && (
            <Alert variant={feedback.type === "success" ? "success" : "error"}>
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle className="h-5 w-5" weight="bold" />
                ) : (
                  <WarningCircle className="h-5 w-5" weight="bold" />
                )}
                <span>{feedback.message}</span>
              </div>
            </Alert>
          )}

          <form className="space-y-3" onSubmit={form.handleSubmit((values) => escortMutation.mutate(values))}>
            <label className="flex flex-col gap-1">
              Wilayah binaan
              <input className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("wilayah")} placeholder="Kelurahan / Desa" />
              {form.formState.errors.wilayah && (
                <span className="text-xs text-oranye-hangat">{form.formState.errors.wilayah.message}</span>
              )}
            </label>
            <label className="flex flex-col gap-1">
              Jadwal panen
              <input type="datetime-local" className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("jadwal")} />
              {form.formState.errors.jadwal && (
                <span className="text-xs text-oranye-hangat">{form.formState.errors.jadwal.message}</span>
              )}
            </label>
            <label className="flex flex-col gap-1">
              Titik kumpul
              <input className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("titikKumpul")} placeholder="Balai desa / gudang" />
              {form.formState.errors.titikKumpul && (
                <span className="text-xs text-oranye-hangat">{form.formState.errors.titikKumpul.message}</span>
              )}
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                Estimasi peserta
                <input type="number" min={1} className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("estimasiPeserta", { valueAsNumber: true })} />
                {form.formState.errors.estimasiPeserta && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.estimasiPeserta.message}</span>
                )}
              </label>
              <label className="flex flex-col gap-1">
                Kebutuhan personel
                <input type="number" min={1} className="rounded-2xl border border-abu-kartu px-3 py-2" {...form.register("kebutuhanPersonel", { valueAsNumber: true })} />
                {form.formState.errors.kebutuhanPersonel && (
                  <span className="text-xs text-oranye-hangat">{form.formState.errors.kebutuhanPersonel.message}</span>
                )}
              </label>
            </div>
            <label className="flex flex-col gap-1">
              Catatan tambahan
              <textarea className="rounded-2xl border border-abu-kartu px-3 py-2" rows={3} {...form.register("catatan")} placeholder="Detail rute atau kebutuhan logistik" />
            </label>
            <Button type="submit" className="w-full" disabled={escortMutation.isPending}>
              {escortMutation.isPending ? "Mengirim..." : "Kirim permintaan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Riwayat permintaan</CardTitle>
          <CardDescription>Catatan pengawalan yang sudah diajukan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-netral">
          {requests.length === 0 ? (
            <p>Belum ada permintaan yang tercatat.</p>
          ) : (
            requests.map((item) => (
              <div key={item.id} className="rounded-2xl border border-abu-kartu p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-teks-gelap">{item.wilayah}</span>
                  <Badge variant={statusBadge[item.status].variant}>{statusBadge[item.status].label}</Badge>
                </div>
                <p>Jadwal: {formatDateTime(item.jadwal)}</p>
                <p>Titik kumpul: {item.titikKumpul}</p>
                <p>Peserta: {item.estimasiPeserta} orang</p>
                <p>Personel diminta: {item.kebutuhanPersonel}</p>
                <p>Diajukan: {formatDateTime(item.diajukanAt)}</p>
                <p>Oleh: {item.diajukanOleh}</p>
                {item.catatan && <p>Catatan: {item.catatan}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default EscortRequestPage;
