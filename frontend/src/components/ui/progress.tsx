import * as React from "react";

import { cn } from "@/utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ value, className, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-3 w-full overflow-hidden rounded-full bg-abu-kartu", className)} {...props}>
    <div
      className="h-full rounded-full bg-biru-pemerintah transition-[width] duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
));
Progress.displayName = "Progress";
