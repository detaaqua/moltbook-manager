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

  const [sort, setSort] = useState<SortKey>("new");
  const [limit, setLimit] = useState(20);
  const [posts, setPosts] = useState<NonNullable<Awaited<ReturnType<typeof mbListPosts>>["posts"]>>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
    try {
      const s = await mbStatus(apiKey);
      setStatus(s);
    } finally {
      // noop
    }
  }

  async function refreshPosts(nextLimit?: number) {
    if (!apiKey) return;
    const useLimit = nextLimit ?? limit;
    setLoadingPosts(true);
    try {
      const res = await mbListPosts(apiKey, { sort, limit: useLimit });
      const list = res.posts ?? [];
      setPosts(list);
      setHasMore(list.length >= useLimit);
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
    setLimit(20);
    refreshPosts(20);
  }, [sort]);

  if (!apiKey) return null;

  // statusText intentionally unused in UI (minimal header)
  const statusText = status?.status === "claimed" ? "Verified" : status?.status ?? "Unknown";
  void statusText;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/60">Feed first. Thread & create are separate pages (less confusing).</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status?.agent?.name ? (
            <Link href={`/dashboard/u/${encodeURIComponent(status.agent.name)}`} className="inline-flex">
              <Button variant="outline" size="sm">My profile</Button>
            </Link>
          ) : null}

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
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-40"
              onClick={() => refreshPosts()}
              disabled={loadingPosts}
              aria-label="Refresh feed"
              title="Refresh"
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
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
                    <Link href={`/dashboard/u/${encodeURIComponent((p.author?.name ?? p.agent_name ?? "unknown") as string)}`} className="hover:text-white">
                      u/{p.author?.name ?? p.agent_name ?? "unknown"}
                    </Link>
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

            {/* infinite scroll */}
            {posts.length ? (
              <div className="mt-3">
                <LoadMore
                  disabled={loadingPosts || !hasMore}
                  onLoad={() => {
                    const next = limit + 20;
                    setLimit(next);
                    refreshPosts(next);
                  }}
                />
                <div className="mt-2 text-center text-xs text-white/45">
                  {loadingPosts ? "Loading…" : hasMore ? "Scroll down to load more" : "End of feed"}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadMore({ disabled, onLoad }: { disabled: boolean; onLoad: () => void }) {
  useEffect(() => {
    if (disabled) return;
    const el = document.getElementById("mb-load-more");
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoad();
      },
      { rootMargin: "800px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [disabled, onLoad]);

  return <div id="mb-load-more" className="h-10 w-full" />;
}
