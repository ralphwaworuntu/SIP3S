interface RegionPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  status: "normal" | "warning" | "critical";
  value: number;
}

const points: RegionPoint[] = [
  { id: "kupang", name: "Kupang", x: 180, y: 140, status: "warning", value: 75 },
  { id: "belu", name: "Belu", x: 260, y: 120, status: "normal", value: 92 },
  { id: "sikka", name: "Sikka", x: 210, y: 190, status: "critical", value: 60 },
  { id: "sumba", name: "Sumba", x: 120, y: 200, status: "normal", value: 88 },
];

const colorMap: Record<RegionPoint["status"], string> = {
  normal: "fill-hijau-hutan",
  warning: "fill-oranye-hangat",
  critical: "fill-red-500",
};

export const NttMapWidget = () => (
  <div className="relative overflow-hidden rounded-3xl border border-abu-kartu bg-gradient-to-br from-biru-pemerintah/5 to-white p-4 shadow-sm">
    <svg viewBox="0 0 320 240" className="w-full">
      <rect x="10" y="60" width="80" height="40" className="fill-biru-pemerintah/10" rx="12" />
      <rect x="100" y="90" width="70" height="35" className="fill-biru-pemerintah/15" rx="12" />
      <rect x="180" y="70" width="60" height="30" className="fill-biru-pemerintah/12" rx="12" />
      <rect x="150" y="150" width="110" height="40" className="fill-biru-pemerintah/20" rx="12" />

      {points.map((point) => (
        <g key={point.id}>
          <circle cx={point.x} cy={point.y} r={12} className={colorMap[point.status]} opacity={0.85} />
          <text x={point.x} y={point.y + 28} textAnchor="middle" className="fill-teks-gelap text-[10px] font-medium">
            {point.name}
          </text>
          <text x={point.x} y={point.y + 40} textAnchor="middle" className="fill-slate-netral text-[9px]">
            {point.value}%
          </text>
        </g>
      ))}
    </svg>
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-netral">
      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-hijau-hutan" /> Stabil</div>
      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-oranye-hangat" /> Perlu perhatian</div>
      <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Kritis</div>
    </div>
  </div>
);
