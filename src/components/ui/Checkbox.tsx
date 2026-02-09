"use client";

import { cn } from "@/lib/utils";

export function Checkbox({
  checked,
  onChange,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <input
      type="checkbox"
      checked={!!checked}
      onChange={onChange}
      className={cn(
        "h-4 w-4 rounded border border-[rgb(var(--border))] bg-white/5",
        "accent-[rgb(var(--accent))]",
        className
      )}
      {...props}
    />
  );
}
