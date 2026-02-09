"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  clearAll,
  getActiveAccount,
  getApiKey,
  listAccounts,
  removeAccount,
  setActiveAccountId,
} from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function toastSafe() {
  // no-op; keeping UX simple without extra toasts in nav.
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(() => !!getApiKey());
  const [tick, setTick] = useState(0);

  // Recompute when we manually bump `tick` after account changes.
  const active = useMemo(() => getActiveAccount(), [tick]);
  const accounts = useMemo(() => listAccounts(), [tick]);

  useEffect(() => {
    const onStorage = () => {
      setAuthed(!!getApiKey());
      setTick((x) => x + 1);
    };
    window.addEventListener("storage", onStorage);
    onStorage();
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            Moltbook Manager
          </Link>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Public beta
          </Badge>
        </div>

        <nav className="flex items-center gap-2">
          <Button asChild variant={pathname === "/register" ? "secondary" : "ghost"} size="sm">
            <Link href="/register">Register</Link>
          </Button>
          <Button asChild variant={pathname === "/login" ? "secondary" : "ghost"} size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant={pathname === "/dashboard" ? "secondary" : "ghost"} size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>

          {authed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  {active?.label || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Accounts</DropdownMenuLabel>
                {accounts.length ? (
                  accounts.map((a) => (
                    <DropdownMenuItem
                      key={a.id}
                      onClick={() => {
                        setActiveAccountId(a.id);
                        setTick((x) => x + 1);
                        toastSafe();
                      }}
                    >
                      <span className="truncate">{a.label}</span>
                      {active?.id === a.id ? <span className="ml-auto text-xs text-muted-foreground">active</span> : null}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem onClick={() => router.push("/login")}>Add an account</DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {active ? (
                  <DropdownMenuItem
                    onClick={() => {
                      removeAccount(active.id);
                      setTick((x) => x + 1);
                      router.push("/login");
                    }}
                  >
                    Remove active account
                  </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem onClick={() => router.push("/login")}>Add another account</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    clearAll();
                    setAuthed(false);
                    router.push("/login");
                  }}
                >
                  Logout (clear all)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
