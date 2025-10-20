import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

import { API_BASE_URL } from "@/utils/constants";

const resolveFallbackBaseUrl = (): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:4000/api`;
};

const FALLBACK_BASE_URL = resolveFallbackBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!navigator.onLine) {
      return Promise.reject(new Error("Perangkat offline"));
    }

    const originalRequest = error.config as (AxiosRequestConfig & { __retryWithFallback?: boolean }) | undefined;
    const shouldRetryWithFallback =
      !error.response &&
      !!FALLBACK_BASE_URL &&
      originalRequest &&
      !originalRequest.__retryWithFallback &&
      apiClient.defaults.baseURL !== FALLBACK_BASE_URL;

    if (shouldRetryWithFallback) {
      originalRequest.__retryWithFallback = true;
      originalRequest.baseURL = FALLBACK_BASE_URL;

      try {
        const response = await apiClient.request(originalRequest);
        apiClient.defaults.baseURL = FALLBACK_BASE_URL;
        return response;
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
