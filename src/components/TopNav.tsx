"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearApiKey, getApiKey } from "@/lib/storage";
import { useEffect, useState } from "react";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(() => !!getApiKey());

  useEffect(() => {
    const onStorage = () => setAuthed(!!getApiKey());
    window.addEventListener("storage", onStorage);
    // also update after navigation
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clearApiKey();
                setAuthed(false);
                router.push("/login");
              }}
            >
              Logout
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
