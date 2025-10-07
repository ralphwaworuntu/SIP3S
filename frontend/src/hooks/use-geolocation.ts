import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sip3s.last-location";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  alamat: string;
  error?: string;
  timestamp?: number;
  isLoading: boolean;
}

const readStoredLocation = (): GeolocationState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { latitude: null, longitude: null, alamat: "", isLoading: true };
    }
    const parsed = JSON.parse(raw) as Partial<GeolocationState>;
    return {
      latitude: parsed.latitude ?? null,
      longitude: parsed.longitude ?? null,
      alamat: parsed.alamat ?? "",
      timestamp: parsed.timestamp,
      isLoading: true,
    };
  } catch (_error) {
    return { latitude: null, longitude: null, alamat: "", isLoading: true };
  }
};

const formatAlamat = (latitude: number, longitude: number) =>
  `Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)}`;

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(() => readStoredLocation());

  const saveLocation = useCallback((next: GeolocationState) => {
    const payload = {
      latitude: next.latitude,
      longitude: next.longitude,
      alamat: next.alamat,
      timestamp: next.timestamp,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Tidak dapat menyimpan lokasi", error);
    }
  }, []);

  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const next: GeolocationState = {
        latitude,
        longitude,
        alamat: formatAlamat(latitude, longitude),
        timestamp: position.timestamp,
        isLoading: false,
      };
      setState(next);
      saveLocation(next);
    },
    [saveLocation]
  );

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({ ...prev, error: error.message, isLoading: false }));
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Perangkat tidak mendukung GPS", isLoading: false }));
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 7000,
      maximumAge: 0,
    });
  }, [handleError, handleSuccess]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Perangkat tidak mendukung GPS", isLoading: false }));
      return;
    }
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });
    refresh();
    return () => navigator.geolocation.clearWatch(watchId);
  }, [handleError, handleSuccess, refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [refresh, state]
  );
};
