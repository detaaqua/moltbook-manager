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
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
        variant === "primary" &&
          "bg-[rgb(var(--accent))] text-black hover:bg-[rgb(var(--accent-2))]",
        variant === "ghost" && "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
        variant === "outline" &&
          "border border-[rgb(var(--border))] bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
        variant === "danger" && "bg-[rgb(var(--danger))] text-black hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}
