import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-biru-pemerintah text-white hover:bg-biru-pemerintah/90 focus-visible:outline-biru-pemerintah",
        secondary: "bg-hijau-hutan text-white hover:bg-hijau-hutan/90 focus-visible:outline-hijau-hutan",
        outline: "border border-slate-netral text-teks-gelap bg-white hover:bg-abu-kartu focus-visible:outline-biru-pemerintah",
        ghost: "text-biru-pemerintah hover:bg-biru-pemerintah/10",
      },
      size: {
        default: "text-base",
        sm: "text-sm px-3 py-2",
        lg: "text-lg px-6 py-4",
        icon: "px-3 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

Button.displayName = "Button";

export { Button, buttonVariants };
