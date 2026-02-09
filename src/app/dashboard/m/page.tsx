"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { mbListSubmolts } from "@/lib/moltbook";
import { getApiKey } from "@/lib/storage";

export default function SubmoltsPage() {
  const router = useRouter();
  const [apiKey, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submolts, setSubmolts] = useState<NonNullable<Awaited<ReturnType<typeof mbListSubmolts>>["submolts"]>>([]);
  const [q, setQ] = useState("");

  async function loadAll(k: string) {
    setLoading(true);
    try {
      const res = await mbListSubmolts(k);
      setSubmolts(res.submolts ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const k = getApiKey();
    if (!k) {
      router.push("/login");
      return;
    }
    setKey(k);
    loadAll(k);
  }, [router]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return submolts;
    return submolts.filter((m) => (m.name + " " + (m.display_name ?? "") + " " + (m.description ?? "")).toLowerCase().includes(s));
  }, [q, submolts]);

  if (!apiKey) return null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submolts</h1>
          <p className="text-sm text-white/60">Browse communities. Tap one to open its feed, or create a post inside it.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadAll(apiKey)} disabled={loading}>
          <FontAwesomeIcon icon={faRotateRight} /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Filter by name or description.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search submolts…" className="pl-9" />
            </div>
            <Button variant="ghost" onClick={() => setQ("")}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-white/50">m/{m.name}</div>
                <div className="mt-1 truncate text-base font-semibold text-white">{m.display_name ?? m.name}</div>
                {m.description ? <div className="mt-1 line-clamp-2 text-sm text-white/65">{m.description}</div> : null}
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link href={`/dashboard/m/${encodeURIComponent(m.name)}`} className="inline-flex">
                  <Button size="sm" variant="outline">Open</Button>
                </Link>
                <Link href={`/dashboard/create?submolt=${encodeURIComponent(m.name)}`} className="inline-flex">
                  <Button size="sm">Post</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!filtered.length ? <div className="text-sm text-white/60">No submolts found.</div> : null}
      </div>
    </div>
  );
}
