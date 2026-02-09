"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck, faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { mbGetAgentProfile } from "@/lib/moltbook";
import { getApiKey } from "@/lib/storage";

export default function AgentProfilePage() {
  const params = useParams<{ name: string }>();
  const router = useRouter();

  const [apiKey, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof mbGetAgentProfile>> | null>(null);

  const name = params?.name;

  async function loadAll(k: string) {
    if (!name) return;
    setLoading(true);
    try {
      const res = await mbGetAgentProfile(k, name);
      setData(res);
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

  const agent = data?.agent;

  return (
    <div className="grid gap-6">
      <div className="panel shadow-soft overflow-hidden">
        <div className="relative h-28 sm:h-32 bg-gradient-to-r from-[rgba(var(--accent),0.35)] via-neutral-900 to-[rgba(var(--accent),0.12)]">
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%)" }}
          />
        </div>
        <div className="px-5 pb-5 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <div className="-mt-12 h-16 w-16 overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-neutral-950 shadow-soft">
                {/* prefer agent avatar_url, fallback to owner x avatar */}
                {agent?.avatar_url || agent?.owner?.x_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(agent.avatar_url ?? agent.owner?.x_avatar) as string}
                    alt={agent.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[rgb(var(--accent))]">
                    {String(name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-2xl font-semibold tracking-tight">u/{name}</h1>
                  {agent?.is_claimed ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--accent),0.25)] bg-[rgba(var(--accent),0.08)] px-2 py-1 text-xs text-[rgb(var(--accent))]">
                      <FontAwesomeIcon icon={faCircleCheck} />
                    </span>
                  ) : null}
                </div>
                <div className="text-sm text-white/60">Profile</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </Button>
              <Button variant="outline" size="sm" onClick={() => apiKey && loadAll(apiKey)} disabled={loading}>
                <FontAwesomeIcon icon={faRotateRight} /> Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent</CardTitle>
          <CardDescription>Public information from Moltbook.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : !agent ? (
            <div className="text-sm text-white/60">Profile not found.</div>
          ) : (
            <div className="grid gap-2 text-sm text-white/75">
              <div className="text-lg font-semibold text-white">{agent.name}</div>
              {agent.description ? <div className="text-white/65">{agent.description}</div> : null}
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl border border-[rgb(var(--border))] bg-white/5 p-3">
                  <div className="text-xs text-white/50">Karma</div>
                  <div className="text-base font-semibold">{agent.karma ?? 0}</div>
                </div>
                <div className="rounded-xl border border-[rgb(var(--border))] bg-white/5 p-3">
                  <div className="text-xs text-white/50">Followers</div>
                  <div className="text-base font-semibold">{agent.follower_count ?? 0}</div>
                </div>
                <div className="rounded-xl border border-[rgb(var(--border))] bg-white/5 p-3">
                  <div className="text-xs text-white/50">Following</div>
                  <div className="text-base font-semibold">{agent.following_count ?? 0}</div>
                </div>
                <div className="rounded-xl border border-[rgb(var(--border))] bg-white/5 p-3">
                  <div className="text-xs text-white/50">Claimed</div>
                  <div className="text-base font-semibold">{agent.is_claimed ? "Yes" : "No"}</div>
                </div>
              </div>

              {agent.owner?.x_handle ? (
                <div className="mt-3 rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
                  <div className="text-xs text-white/50">Owner (X)</div>
                  <div className="mt-1 font-semibold">
                    {agent.owner.x_name ? `${agent.owner.x_name} ` : ""}@{agent.owner.x_handle}
                  </div>
                  {agent.owner.x_bio ? <div className="mt-1 text-white/65">{agent.owner.x_bio}</div> : null}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent posts</CardTitle>
          <CardDescription>Open thread to read & reply.</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.recentPosts?.length ? (
            <div className="text-sm text-white/60">No recent posts.</div>
          ) : (
            <div className="grid gap-2">
              {data.recentPosts.slice(0, 10).map((p) => (
                <div key={p.id} className="rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
                  <div className="text-xs text-white/55">
                    <span className="text-[rgb(var(--accent))]">m/{p.submolt?.name ?? "general"}</span>
                    <span className="mx-1">•</span>
                    <span>{p.created_at ? new Date(p.created_at).toLocaleString() : ""}</span>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
