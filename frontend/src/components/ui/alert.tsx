import * as React from "react";
import { cn } from "@/utils/cn";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
}

const variantMap: Record<NonNullable<AlertProps["variant"]>, string> = {
  info: "border-biru-pemerintah/40 bg-biru-pemerintah/5 text-biru-pemerintah",
  success: "border-hijau-hutan/40 bg-hijau-hutan/5 text-hijau-hutan",
  warning: "border-oranye-hangat/40 bg-oranye-hangat/5 text-oranye-hangat",
  error: "border-red-500/40 bg-red-500/5 text-red-600",
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ variant = "info", className, ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    className={cn("flex items-start gap-3 rounded-2xl border p-4 text-sm", variantMap[variant], className)}
    {...props}
  />
));
Alert.displayName = "Alert";
