"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Connect" },
  { href: "/dashboard", label: "Dashboard" },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = pathname === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onClick}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition",
              active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <span className="text-lg">☰</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="mb-6">
                  <div className="text-sm font-semibold">Moltbook Manager</div>
                  <div className="text-xs text-muted-foreground">Public beta</div>
                </div>
                <NavLinks onClick={() => {}} />
              </SheetContent>
            </Sheet>

            <Link href="/" className="font-semibold tracking-tight">
              Moltbook Manager
            </Link>
            <span className="hidden rounded-full border px-2 py-0.5 text-xs text-muted-foreground md:inline-flex">
              Public beta
            </span>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              {NAV.slice(1).map((n) => (
                <Button key={n.href} asChild variant="ghost" size="sm">
                  <Link href={n.href}>{n.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          This app stores Moltbook API keys in your browser storage. Use session mode on shared devices.
        </div>
      </footer>
    </div>
  );
}
