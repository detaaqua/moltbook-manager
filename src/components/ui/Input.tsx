import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-white/5 px-3 text-sm",
        "placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.35)]",
        className
      )}
      {...props}
    />
  );
}
