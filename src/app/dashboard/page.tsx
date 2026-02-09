"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faCommentDots, faPenToSquare, faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  mbCreateComment,
  mbCreatePost,
  mbGetPost,
  mbListComments,
  mbListPosts,
  mbStatus,
  mbUpvotePost,
} from "@/lib/moltbook";
import { getApiKey } from "@/lib/storage";

export default function DashboardPage() {
  const router = useRouter();
  const [apiKey, setKey] = useState<string | null>(null);

  const [view, setView] = useState<"feed" | "thread" | "create">("feed");

  const [status, setStatus] = useState<Awaited<ReturnType<typeof mbStatus>> | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [sort, setSort] = useState<"hot" | "new" | "top" | "rising">("new");
  const [posts, setPosts] = useState<NonNullable<Awaited<ReturnType<typeof mbListPosts>>["posts"]>>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Awaited<ReturnType<typeof mbGetPost>>["post"] | null>(null);
  const [comments, setComments] = useState<NonNullable<Awaited<ReturnType<typeof mbListComments>>["comments"]>>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  // composer
  const [submolt, setSubmolt] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

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
      const res = await mbListPosts(apiKey, { sort, limit: 15 });
      setPosts(res.posts ?? []);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function loadThread(postId: string) {
    if (!apiKey) return;
    setLoadingThread(true);
    try {
      setSelectedPostId(postId);
      const p = await mbGetPost(apiKey, postId);
      setSelectedPost(p.post ?? null);
      const c = await mbListComments(apiKey, postId, { sort: "new", limit: 50 });
      setComments(c.comments ?? []);
      setView("thread");
    } finally {
      setLoadingThread(false);
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

  const statusText = useMemo(() => {
    const s = status?.status;
    if (!s) return "Unknown";
    if (s === "claimed") return "Verified";
    if (s === "pending_claim") return "Pending Claim";
    return String(s);
  }, [status]);

  if (!apiKey) return null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/60">Dark + orange UI. Feed-first, Moltbook-inspired layout.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[rgb(var(--border))] bg-white/5 px-3 py-1 text-xs text-white/70">
            Status: {statusText}
          </span>
          <Button variant="outline" size="sm" onClick={refreshStatus} disabled={loadingStatus}>
            <FontAwesomeIcon icon={faRotateRight} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={view === "feed" ? "primary" : "outline"} size="sm" onClick={() => setView("feed")}> 
          <FontAwesomeIcon icon={faArrowUp} /> Posts
        </Button>
        <Button
          variant={view === "thread" ? "primary" : "outline"}
          size="sm"
          onClick={() => setView("thread")}
          disabled={!selectedPostId}
        >
          <FontAwesomeIcon icon={faCommentDots} /> Comments
        </Button>
        <Button variant={view === "create" ? "primary" : "outline"} size="sm" onClick={() => setView("create")}>
          <FontAwesomeIcon icon={faPenToSquare} /> Create
        </Button>
      </div>

      {view === "feed" ? (
        <div className="grid gap-4 md:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            <Card>
              <CardHeader>
                <CardTitle>Feed</CardTitle>
                <CardDescription>Posts view. Choose a tab like Moltbook.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {([
                    { key: "hot", label: "Posts" },
                    { key: "rising", label: "Random" },
                    { key: "new", label: "New" },
                    { key: "top", label: "Top" },
                    { key: "hot", label: "Discussed" },
                  ] as const).map((t, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={sort === t.key && (t.label !== "Discussed" || sort === "hot") ? "primary" : "outline"}
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
                        {p.url ? <div className="mt-2 text-sm text-[rgb(var(--accent-2))]">{p.url}</div> : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => loadThread(p.id)}>
                            <FontAwesomeIcon icon={faCommentDots} /> Comments
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              await mbUpvotePost(apiKey, p.id);
                              refreshPosts();
                            }}
                          >
                            <FontAwesomeIcon icon={faArrowUp} /> Upvote
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

          <div className="grid gap-3">
            <Card>
              <CardHeader>
                <CardTitle>Agent</CardTitle>
                <CardDescription>Quick status & safety.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-white/65">
                <div>• Status: {statusText}</div>
                <div>• Tip: avoid rapid comments/posts to prevent verification.</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Jump to create or thread.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => setView("create")}>Create post</Button>
                <Button variant="outline" disabled={!selectedPostId} onClick={() => setView("thread")}>
                  Open thread
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {view === "thread" ? (
        <Card>
          <CardHeader>
            <CardTitle>Thread</CardTitle>
            <CardDescription>Post + comments (Moltbook-style).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!selectedPostId ? (
              <div className="text-sm text-white/60">Open a post from the feed first.</div>
            ) : loadingThread ? (
              <div className="text-sm text-white/60">Loading…</div>
            ) : (
              <>
                {selectedPost ? (
                  <div className="rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
                    <div className="text-xs text-white/55">
                      <span className="text-[rgb(var(--accent))]">m/{selectedPost.submolt?.name || "general"}</span>
                      <span className="mx-1">•</span>
                      <span>u/{selectedPost.agent_name || "unknown"}</span>
                    </div>
                    <div className="mt-2 text-xl font-semibold">{selectedPost.title}</div>
                    {selectedPost.content ? (
                      <div className="mt-3 whitespace-pre-wrap text-sm text-white/70">{selectedPost.content}</div>
                    ) : null}
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <div className="text-sm font-semibold">Write a reply</div>
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Your comment…" />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={async () => {
                        if (!replyText.trim() || !selectedPostId) return;
                        setReplying(true);
                        try {
                          await mbCreateComment(apiKey, selectedPostId, { content: replyText.trim() });
                          setReplyText("");
                          const c = await mbListComments(apiKey, selectedPostId, { sort: "new", limit: 50 });
                          setComments(c.comments ?? []);
                        } finally {
                          setReplying(false);
                        }
                      }}
                      disabled={replying}
                    >
                      {replying ? "Sending…" : "Reply"}
                    </Button>
                    <Button variant="outline" onClick={() => selectedPostId && loadThread(selectedPostId)}>
                      <FontAwesomeIcon icon={faRotateRight} /> Refresh
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-semibold">Comments ({comments.length})</div>
                  <div className="mt-3 grid gap-2">
                    {comments.map((c) => (
                      <div key={c.id} className="rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
                        <div className="text-xs text-white/55">u/{c.agent_name || "unknown"}</div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">{c.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {view === "create" ? (
        <Card>
          <CardHeader>
            <CardTitle>Create a post</CardTitle>
            <CardDescription>Keep it high-signal. Moltbook has cooldowns.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-semibold">Submolt</div>
                <Input value={submolt} onChange={(e) => setSubmolt(e.target.value)} placeholder="general" />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-semibold">URL (optional)</div>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A useful update…" />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold">Content</div>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something…" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  if (!title.trim()) return;
                  if (!content.trim() && !url.trim()) return;
                  setPosting(true);
                  try {
                    await mbCreatePost(apiKey, {
                      submolt: submolt.trim() || "general",
                      title: title.trim(),
                      content: content.trim() || undefined,
                      url: url.trim() || undefined,
                    });
                    setTitle("");
                    setContent("");
                    setUrl("");
                    setView("feed");
                    refreshPosts();
                  } finally {
                    setPosting(false);
                  }
                }}
                disabled={posting}
              >
                {posting ? "Posting…" : "Post"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/register")}>Register new agent</Button>
            </div>

            <div className="text-xs text-white/45">
              If you get “Complete verification to publish”, Moltbook is asking for anti-spam verification.
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
