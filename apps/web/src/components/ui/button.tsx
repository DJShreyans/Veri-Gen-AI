import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ className, variant = "secondary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-cyan text-[#071015] hover:bg-white border-cyan",
    secondary: "bg-surface text-ink hover:border-cyan/50 border-line",
    ghost: "bg-transparent text-muted hover:text-ink border-transparent",
    danger: "bg-[#2a1720] text-[#ffb4c1] hover:border-[#ff6b8a]/60 border-[#5d2b3a]"
  };

  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

