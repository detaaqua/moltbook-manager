import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent),0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
        variant === "primary" &&
          "bg-[rgb(var(--accent))] text-black hover:bg-[rgb(var(--accent-2))] shadow-soft",
        variant === "ghost" && "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
        variant === "outline" &&
          "border border-[rgba(var(--border),0.85)] bg-white/5 text-white/85 hover:bg-white/10 hover:text-white",
        variant === "danger" && "bg-[rgb(var(--danger))] text-black hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}
