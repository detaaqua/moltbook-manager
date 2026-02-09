import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-xl border border-[rgba(var(--border),0.85)] bg-white/5 px-3 py-3 text-sm text-white/90",
        "placeholder:text-white/35",
        "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.30)] focus:border-[rgba(var(--accent),0.55)]",
        className
      )}
      {...props}
    />
  );
}
