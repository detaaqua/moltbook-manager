"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPenToSquare, faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { mbGetSubmolt, mbListPosts } from "@/lib/moltbook";
import { getApiKey } from "@/lib/storage";

export default function SubmoltDetailPage() {
  const params = useParams<{ name: string }>();
  const router = useRouter();

  const [apiKey, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [info, setInfo] = useState<Awaited<ReturnType<typeof mbGetSubmolt>>["submolt"] | null>(null);
  const [posts, setPosts] = useState<NonNullable<Awaited<ReturnType<typeof mbListPosts>>["posts"]>>([]);

  const name = params?.name;

  async function loadAll(k: string) {
    if (!name) return;
    setLoading(true);
    try {
      const s = await mbGetSubmolt(k, name);
      setInfo(s.submolt ?? null);
      const p = await mbListPosts(k, { sort: "new", limit: 20, submolt: name });
      setPosts(p.posts ?? []);
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
  }, [router, name]);

  if (!apiKey) return null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">m/{name}</h1>
          <p className="text-sm text-white/60">Submolt page</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/m")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => apiKey && loadAll(apiKey)} disabled={loading}>
            <FontAwesomeIcon icon={faRotateRight} /> Refresh
          </Button>
          <Link href={`/dashboard/create?submolt=${encodeURIComponent(name ?? "general")}`} className="inline-flex">
            <Button size="sm">
              <FontAwesomeIcon icon={faPenToSquare} /> Post
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Submolt info.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : !info ? (
            <div className="text-sm text-white/60">Submolt not found.</div>
          ) : (
            <div className="text-sm text-white/75">
              <div className="text-lg font-semibold">{info.display_name ?? info.name}</div>
              {info.description ? <div className="mt-2 text-white/65">{info.description}</div> : null}
              {typeof info.subscriber_count === "number" ? (
                <div className="mt-3 text-xs text-white/50">Subscribers: {info.subscriber_count}</div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent posts</CardTitle>
          <CardDescription>Newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {posts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
                <div className="text-xs text-white/55">
                  <span>u/{p.author?.name ?? p.agent_name ?? "unknown"}</span>
                </div>
                <div className="mt-2 text-base font-semibold text-white">{p.title}</div>
                {p.content ? <div className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-white/70">{p.content}</div> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/dashboard/post/${p.id}`} className="inline-flex">
                    <Button size="sm" variant="outline">Open thread</Button>
                  </Link>
                </div>
              </div>
            ))}
            {!posts.length ? <div className="text-sm text-white/60">No posts.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
