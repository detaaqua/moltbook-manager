"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { mbListPosts, mbStatus, mbUpvotePost } from "@/lib/moltbook";
import { getApiKey } from "@/lib/storage";

type SortKey = "new" | "top" | "rising" | "hot";

export default function DashboardPage() {
  const router = useRouter();
  const [apiKey, setKey] = useState<string | null>(null);

  const [status, setStatus] = useState<Awaited<ReturnType<typeof mbStatus>> | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [sort, setSort] = useState<SortKey>("new");
  const [posts, setPosts] = useState<NonNullable<Awaited<ReturnType<typeof mbListPosts>>["posts"]>>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    const k = getApiKey();
    if (!k) {
      router.push("/login");
      return;
    }
    setKey(k);
  }, [router]);

  async function refreshStatus() {
    if (!apiKey) return;
    setLoadingStatus(true);
    try {
      const s = await mbStatus(apiKey);
      setStatus(s);
    } finally {
      setLoadingStatus(false);
    }
  }

  async function refreshPosts() {
    if (!apiKey) return;
    setLoadingPosts(true);
    try {
      const res = await mbListPosts(apiKey, { sort, limit: 20 });
      setPosts(res.posts ?? []);
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    if (!apiKey) return;
    refreshStatus();
    refreshPosts();
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) return;
    refreshPosts();
  }, [sort]);

  if (!apiKey) return null;

  const statusText = status?.status === "claimed" ? "Verified" : status?.status ?? "Unknown";

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/60">Feed first. Thread & create are separate pages (less confusing).</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[rgb(var(--border))] bg-white/5 px-3 py-1 text-xs text-white/70">
            Status: {statusText}
          </span>
          <Button variant="outline" size="sm" onClick={refreshStatus} disabled={loadingStatus}>
            <FontAwesomeIcon icon={faRotateRight} />
            Refresh
          </Button>
          <Link href="/dashboard/create" className="inline-flex">
            <Button size="sm">
              <FontAwesomeIcon icon={faPenToSquare} /> Create
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Pick a sort, open a thread, upvote.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "new", label: "New" },
                { key: "top", label: "Top" },
                { key: "rising", label: "Rising" },
                { key: "hot", label: "Hot" },
              ] as const
            ).map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={sort === t.key ? "primary" : "outline"}
                onClick={() => setSort(t.key)}
              >
                {t.label}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={refreshPosts} disabled={loadingPosts}>
              <FontAwesomeIcon icon={faRotateRight} />
              {loadingPosts ? "Loading" : "Refresh"}
            </Button>
          </div>

          <div className="grid gap-2">
            {posts.map((p) => (
              <div key={p.id} className="grid grid-cols-[46px_1fr] gap-3 rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
                <div className="flex flex-col items-center justify-start gap-2 pt-1 text-white/70">
                  <button
                    className="text-xs hover:text-[rgb(var(--accent))]"
                    onClick={async () => {
                      await mbUpvotePost(apiKey, p.id);
                      refreshPosts();
                    }}
                    aria-label="Upvote"
                  >
                    ▲
                  </button>
                  <div className="text-sm font-semibold">{p.upvotes ?? 0}</div>
                  <div className="text-xs opacity-40">▼</div>
                </div>

                <div className="min-w-0">
                  <div className="mb-1 text-xs text-white/55">
                    <span className="text-[rgb(var(--accent))]">m/{p.submolt?.name || "general"}</span>
                    <span className="mx-1">•</span>
                    <span>u/{p.agent_name || "unknown"}</span>
                  </div>

                  <div className="text-pretty text-base font-semibold text-white">{p.title}</div>

                  {p.content ? (
                    <div className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-white/70">{p.content}</div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/post/${p.id}`} className="inline-flex">
                      <Button size="sm" variant="outline">Open thread</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await mbUpvotePost(apiKey, p.id);
                        refreshPosts();
                      }}
                    >
                      Upvote
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {!posts.length ? <div className="text-sm text-white/50">No posts loaded.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
