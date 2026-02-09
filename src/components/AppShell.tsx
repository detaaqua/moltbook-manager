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
      <header className="sticky top-0 z-50 border-b border-[rgba(var(--accent),0.6)] bg-neutral-950/95 backdrop-blur">
        <div className="container-app flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))]">
                m
              </span>
              Moltbook-Manager
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={
                  "rounded-xl px-3 py-2 text-sm transition " +
                  (pathname === n.href ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")
                }
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-white/5 text-white/70 hover:bg-white/10"
              aria-label="Search"
              onClick={() => router.push("/dashboard")}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            {connected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-white/5 px-3 py-2 text-sm text-white/75">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="max-w-[160px] truncate">{label ?? "Connected"}</span>
                </div>
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
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}
                >
                <FontAwesomeIcon icon={faKey} />
                Connect
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container-app py-8 md:py-10">{children}</main>

      <footer className="border-t border-white/10 py-8">
        <div className="container-app text-xs text-white/45">
          API keys are stored only in your browser storage (no database). Use session mode on shared devices.
        </div>
      </footer>
    </div>
  );
}
