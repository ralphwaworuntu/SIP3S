import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SignOut } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useOnlineStatus } from "@/context/online-status-context";
import { bhabinService } from "@/services/bhabin-service";
import type { BhabinAssignment } from "@/types/bhabin";

const navItems = [
  { label: "Tugas Lapangan", to: ".", end: true },
  { label: "Verifikasi Penyaluran", to: "verifikasi" },
  { label: "Perkembangan Tanaman", to: "tanaman" },
  { label: "Verifikasi Hasil Panen", to: "panen" },
  { label: "Permintaan Pengawalan", to: "pengawalan" },
] as const;

const BhabinLayout = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOnlineStatus();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const assignmentsQuery = useQuery({
    queryKey: ["bhabin-assignments", user?.email],
    queryFn: () => bhabinService.listAssignments(user?.email),
    enabled: Boolean(user?.email),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!selectedAssignmentId && assignmentsQuery.data && assignmentsQuery.data.length > 0) {
      setSelectedAssignmentId(assignmentsQuery.data[0].id);
    }
  }, [assignmentsQuery.data, selectedAssignmentId]);

  const selectedAssignment: BhabinAssignment | undefined = useMemo(() => {
    return assignmentsQuery.data?.find((assignment) => assignment.id === selectedAssignmentId) ?? undefined;
  }, [assignmentsQuery.data, selectedAssignmentId]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8">
      <header className="rounded-3xl border border-abu-kartu bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-netral">Bhabinkamtibmas</p>
            <h1 className="text-2xl font-semibold text-teks-gelap">{user?.nama ?? "Bhabin"}</h1>
            <p className="text-xs text-slate-netral">
              Mulai dari membaca tugas, verifikasi penyaluran, sampai pengawalan panen di wilayah binaan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? "success" : "warning"}>{isOnline ? "Online" : "Offline"}</Badge>
            <Button variant="outline" onClick={logout}>
              <SignOut className="mr-2 h-4 w-4" weight="bold" /> Keluar
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-netral">
          <label className="flex flex-col gap-1">
            Wilayah kerja aktif
            <select
              value={selectedAssignmentId ?? ""}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              className="w-full rounded-2xl border border-abu-kartu px-3 py-2 text-sm"
              disabled={assignmentsQuery.data?.length === 0}
            >
              {assignmentsQuery.data?.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.wilayahName} • Kecamatan {assignment.kecamatan}
                </option>
              ))}
            </select>
          </label>
          {assignmentsQuery.isLoading && <span className="text-xs text-slate-netral">Memuat wilayah tugas...</span>}
          {assignmentsQuery.data?.length === 0 && !assignmentsQuery.isLoading && (
            <span className="text-xs text-oranye-hangat">
              Belum ada wilayah terdaftar. Hubungi Admin Spesialis untuk mendapatkan assignment.
            </span>
          )}
          {selectedAssignment && (
            <p className="text-xs text-slate-netral">
              Aktif di {selectedAssignment.wilayahName}, Desa {selectedAssignment.desa}, Kecamatan {selectedAssignment.kecamatan}.
            </p>
          )}
        </div>

        <nav className="mt-6 flex flex-wrap gap-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? "rounded-2xl border border-biru-pemerintah bg-biru-pemerintah/10 px-4 py-2 font-medium text-biru-pemerintah"
                  : "rounded-2xl border border-transparent px-4 py-2 text-slate-netral transition hover:border-biru-pemerintah/40 hover:text-biru-pemerintah"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet context={{ selectedAssignment }} />
    </main>
  );
};

export default BhabinLayout;
