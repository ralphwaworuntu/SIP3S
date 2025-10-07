import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-biru-pemerintah/10 text-biru-pemerintah",
        success: "bg-hijau-hutan/10 text-hijau-hutan",
        warning: "bg-oranye-hangat/10 text-oranye-hangat",
        neutral: "bg-slate-netral/20 text-teks-gelap",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
