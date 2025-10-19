import type { AxiosError } from "axios";

export const inputClass = "w-full rounded-2xl border border-abu-kartu px-3 py-2 text-sm";
export const textareaClass = "w-full rounded-2xl border border-abu-kartu px-3 py-2 text-sm";
export const selectClass = "w-full rounded-2xl border border-abu-kartu px-3 py-2 text-sm";

export type FeedbackKind = "success" | "error" | "info";

export interface FeedbackState {
  type: FeedbackKind;
  message: string;
}

export type Feedback = FeedbackState | null;

type AxiosErrorResponse = {
  message?: string;
};

export const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as AxiosError<AxiosErrorResponse>).response;
    const message = response?.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
};

export const parseNumberField = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toDateInputValue = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
};

export const toDateTimeInputValue = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
