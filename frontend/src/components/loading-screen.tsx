import { SpinnerGap } from "@phosphor-icons/react";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Sedang memuat" }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-netral">
    <SpinnerGap className="h-10 w-10 animate-spin text-biru-pemerintah" weight="bold" />
    <p className="text-sm font-medium">{message}...</p>
  </div>
);
