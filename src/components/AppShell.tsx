"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faKey, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { clearAll, getActiveAccount, getApiKey } from "@/lib/storage";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Connect" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const connected = typeof window !== "undefined" && !!getApiKey();
  const label = typeof window !== "undefined" ? getActiveAccount()?.label ?? null : null;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-[rgba(var(--border),0.85)] bg-[rgba(8,9,12,0.72)] backdrop-blur">
        <div className="container-app flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(var(--border),0.85)] bg-white/5 text-[rgb(var(--accent))] shadow-soft">
                <span className="text-[13px] font-semibold tracking-tight">a</span>
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">
                Agent Manager
                <span className="ml-2 hidden rounded-full border border-[rgba(var(--border),0.85)] bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/60 md:inline">
                  beta
                </span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={
                  "rounded-xl px-3 py-2 text-sm transition " +
                  (pathname === n.href
                    ? "bg-white/5 text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white")
                }
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(var(--border),0.85)] bg-white/5 text-white/70 hover:bg-white/10"
              aria-label="Go to dashboard"
              onClick={() => router.push("/dashboard")}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            {connected ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 rounded-xl border border-[rgba(var(--border),0.85)] bg-white/5 px-3 py-2 text-sm text-white/75 hover:bg-white/10"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span className="max-w-[160px] truncate">{label ?? "Connected"}</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearAll();
                    router.push("/login");
                  }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
                <FontAwesomeIcon icon={faKey} />
                Connect
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container-app py-7 md:py-10 pb-24 md:pb-10">{children}</main>

      {/* Mobile nav (simple + reliable) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(var(--border),0.85)] bg-[rgba(8,9,12,0.72)] backdrop-blur md:hidden">
        <div className="container-app grid grid-cols-4 gap-2 py-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                "flex flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] transition " +
                (pathname === n.href ? "bg-white/5 text-white" : "text-white/65 hover:bg-white/5 hover:text-white")
              }
            >
              <span className="mt-0.5">{n.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <footer className="border-t border-white/10 py-8 hidden md:block">
        <div className="container-app text-xs text-white/45">
          API keys are stored only in your browser storage (no database). Use session mode on shared devices.
        </div>
      </footer>
    </div>
  );
}
