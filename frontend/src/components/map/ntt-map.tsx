import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { CircleMarkerOptions, LatLngBoundsLiteral, LatLngTuple } from "leaflet";
import L from "leaflet";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockNttMonitoring, mockReports } from "@/utils/mock-data";

type RegionMonitoring = (typeof mockNttMonitoring)[number];
type ReportItem = (typeof mockReports)[number];

const monitoringData: RegionMonitoring[] = [...mockNttMonitoring];
const reportData: ReportItem[] = [...mockReports];

type BoundsLiteral = LatLngBoundsLiteral;

const FALLBACK_BOUNDS: BoundsLiteral = [
  [-11.5, 118.0],
  [-7.0, 127.0],
];

const statusStyles: Record<
  RegionMonitoring["status"],
  { fill: string; border: string; highlight: string; label: string; badge: "success" | "warning" | "neutral" }
> = {
  normal: {
    fill: "#15803d",
    border: "#bbf7d0",
    highlight: "#166534",
    label: "Stabil",
    badge: "success",
  },
  warning: {
    fill: "#f97316",
    border: "#fed7aa",
    highlight: "#c2410c",
    label: "Perlu perhatian",
    badge: "warning",
  },
  critical: {
    fill: "#ef4444",
    border: "#fecaca",
    highlight: "#b91c1c",
    label: "Kritis",
    badge: "warning",
  },
};

const AVAILABLE_REPORT_STATUSES = ["terkirim", "pending", "gagal"] as const;
type ReportStatus = (typeof AVAILABLE_REPORT_STATUSES)[number];

const reportStatusStyles: Record<ReportStatus, { color: string; label: string; badge: "success" | "warning" | "neutral" }> = {
  terkirim: {
    color: "#16a34a",
    label: "Tersinkron",
    badge: "success",
  },
  pending: {
    color: "#f59e0b",
    label: "Menunggu",
    badge: "warning",
  },
  gagal: {
    color: "#ef4444",
    label: "Gagal kirim",
    badge: "warning",
  },
};

const regionLegend = (Object.keys(statusStyles) as Array<RegionMonitoring["status"]>).map((status) => ({
  status,
  label: statusStyles[status].label,
  color: statusStyles[status].fill,
}));

const reportLegend = Object.entries(reportStatusStyles).map(([key, meta]) => ({
  key,
  label: meta.label,
  color: meta.color,
}));

const normalizeReportStatus = (status: ReportItem["status"]): ReportStatus => {
  if (typeof status === "string" && AVAILABLE_REPORT_STATUSES.includes(status as ReportStatus)) {
    return status as ReportStatus;
  }
  return "pending";
};

const computeBounds = (): BoundsLiteral => {
  if (monitoringData.length === 0) return FALLBACK_BOUNDS;
  const latitudes = monitoringData.map((region) => region.latitude);
  const longitudes = monitoringData.map((region) => region.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const padding = 0.6;

  return [
    [minLat - padding, minLng - padding],
    [maxLat + padding, maxLng + padding],
  ];
};

const computeCenter = (bounds: BoundsLiteral): LatLngTuple => {
  const southWest = bounds[0];
  const northEast = bounds[1];
  return [(southWest[0] + northEast[0]) / 2, (southWest[1] + northEast[1]) / 2];
};

const ConstrainView: React.FC<{ bounds: BoundsLiteral }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    const leafletBounds = L.latLngBounds(bounds);
    map.setMaxBounds(leafletBounds);
    map.fitBounds(leafletBounds, { padding: [24, 24] });
  }, [map, bounds]);

  return null;
};

export const NttMapWidget: React.FC = () => {
  const [activeRegionId, setActiveRegionId] = useState<string>(monitoringData[0]?.id ?? "");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const iconRetinaUrl = new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString();
    const iconUrl = new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString();
    const shadowUrl = new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString();

    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }, [isClient]);

  const bounds = useMemo<BoundsLiteral>(() => computeBounds(), []);
  const center = useMemo<LatLngTuple>(
    () => (monitoringData.length === 0 ? [-9.5, 123.8] : computeCenter(bounds)),
    [bounds]
  );

  const activeRegion = useMemo<RegionMonitoring | undefined>(
    () => monitoringData.find((region) => region.id === activeRegionId) ?? monitoringData[0],
    [activeRegionId]
  );

  const numberFormatter = useMemo(() => new Intl.NumberFormat("id-ID"), []);
  const dateTimeFormatter = useMemo(
    () =>
      typeof window !== "undefined"
        ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" })
        : null,
    []
  );

  const associatedReports = useMemo(() => {
    if (!activeRegion) return [];
    const regionName = activeRegion.name.toLowerCase();
    const regionShort = activeRegion.shortLabel.toLowerCase();
    return reportData.filter((report) => {
      if (!report.lokasi) return false;
      const address = report.lokasi.alamat.toLowerCase();
      return address.includes(regionName) || address.includes(regionShort);
    });
  }, [activeRegion]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-abu-kartu bg-white p-4 shadow-sm">
        {isClient ? (
          <MapContainer
            center={center}
            zoom={7}
            minZoom={6}
            maxZoom={12}
            scrollWheelZoom
            className="h-[420px] w-full rounded-2xl"
          >
            <ConstrainView bounds={bounds} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {monitoringData.map((region) => {
              const styles = statusStyles[region.status];
              const isActive = region.id === activeRegionId;
              const markerRadius = Math.max(8, Math.min(16, region.progress / 5));
              const pathOptions: CircleMarkerOptions = {
                color: isActive ? styles.highlight : styles.border,
                fillColor: styles.fill,
                fillOpacity: isActive ? 0.85 : 0.6,
                weight: isActive ? 4 : 2,
              };

              return (
                <CircleMarker
                  key={region.id}
                  center={[region.latitude, region.longitude]}
                  radius={markerRadius}
                  pathOptions={pathOptions}
                  eventHandlers={{
                    click: () => setActiveRegionId(region.id),
                    mouseover: () => setActiveRegionId(region.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -markerRadius]} opacity={0.9}>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-teks-gelap">{region.name}</p>
                      <p className="text-slate-netral">Serapan {region.progress}%</p>
                      <p className="text-slate-netral">Buffer {region.bufferTon} ton</p>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-teks-gelap">{region.name}</p>
                      <p>Status: {styles.label}</p>
                      <p>Serapan distribusi: {region.progress}%</p>
                      <p>Ketepatan jadwal: {region.coverage}%</p>
                      <p>Buffer stok: {numberFormatter.format(region.bufferTon)} ton</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {reportData.map((report) => {
              if (!report.lokasi) return null;
              const status = normalizeReportStatus(report.status);
              const style = reportStatusStyles[status];
              return (
                <CircleMarker
                  key={report.id}
                  center={[report.lokasi.latitude, report.lokasi.longitude]}
                  radius={6}
                  pathOptions={{
                    color: style.color,
                    fillColor: style.color,
                    fillOpacity: 0.85,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-teks-gelap">{report.komoditas}</p>
                      <p className="text-slate-netral">{report.lokasi.alamat}</p>
                      <p>Status: {style.label}</p>
                      <p>Penyaluran: {report.kuotaTersalurkan}%</p>
                      <p className="text-slate-netral">Catatan: {report.catatan}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="flex h-[420px] items-center justify-center rounded-2xl bg-abu-kartu/40 text-sm text-slate-netral">
            Menyiapkan peta interaktif...
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-netral">
          {regionLegend.map((legend) => (
            <div key={legend.status} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: legend.color }}
              />
              <span>{legend.label}</span>
            </div>
          ))}
          <span className="hidden h-3 w-px bg-abu-kartu/80 sm:block" />
          {reportLegend.map((legend) => (
            <div key={legend.key} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: legend.color }}
              />
              <span>{legend.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-abu-kartu bg-white/90 p-4 shadow-sm backdrop-blur">
        {activeRegion ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-netral">Wilayah terpilih</p>
              <h3 className="mt-1 text-xl font-semibold text-biru-pemerintah">{activeRegion.name}</h3>
              <Badge variant={statusStyles[activeRegion.status].badge} className="mt-2">
                {statusStyles[activeRegion.status].label}
              </Badge>
              <p className="mt-3 text-sm leading-relaxed text-slate-netral">{activeRegion.notes}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-netral">
                  <span>Serapan distribusi</span>
                  <span className="text-teks-gelap">{activeRegion.progress}%</span>
                </div>
                <Progress value={activeRegion.progress} className="mt-2 h-2" />
              </div>
              <div className="flex items-center justify-between text-slate-netral">
                <span>Ketepatan jadwal</span>
                <span className="font-semibold text-teks-gelap">{activeRegion.coverage}%</span>
              </div>
              <div className="flex items-center justify-between text-slate-netral">
                <span>Buffer stok</span>
                <span className="font-semibold text-teks-gelap">
                  {numberFormatter.format(activeRegion.bufferTon)} ton
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-netral">
                <span>Laporan aktif</span>
                <span className="font-semibold text-teks-gelap">{activeRegion.alerts}</span>
              </div>
              <p className="text-xs text-slate-netral">
                Diperbarui{" "}
                {dateTimeFormatter
                  ? dateTimeFormatter.format(new Date(activeRegion.updatedAt))
                  : activeRegion.updatedAt}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-netral">
                Laporan terbaru wilayah ini
              </p>
              {associatedReports.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {associatedReports.slice(0, 3).map((report) => {
                    const status = normalizeReportStatus(report.status);
                    return (
                      <li key={report.id} className="flex flex-col gap-1 rounded-2xl border border-abu-kartu/70 bg-abu-kartu/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-teks-gelap">{report.komoditas}</span>
                          <Badge variant={reportStatusStyles[status].badge}>{reportStatusStyles[status].label}</Badge>
                        </div>
                        <p className="text-slate-netral">{report.lokasi.alamat}</p>
                        <p className="text-slate-netral">Penyaluran {report.kuotaTersalurkan}%</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-slate-netral">Belum ada laporan terkait wilayah ini.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-netral">
            Data pengawasan belum tersedia.
          </div>
        )}
      </div>
    </div>
  );
};
