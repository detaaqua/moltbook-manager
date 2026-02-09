"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  const [status, setStatus] = useState<Awaited<ReturnType<typeof mbStatus>> | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [sort, setSort] = useState<"hot" | "new" | "top" | "rising">("hot");
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
      toast.error("Please connect an API key first");
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to fetch status";
      toast.error(msg);
    } finally {
      setLoadingStatus(false);
    }
  }

  async function refreshPosts() {
    if (!apiKey) return;
    setLoadingPosts(true);
    try {
      const res = await mbListPosts(apiKey, { sort, limit: 10 });
      setPosts(res.posts ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load feed";
      toast.error(msg);
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
      const c = await mbListComments(apiKey, postId, { sort: "new", limit: 25 });
      setComments(c.comments ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load thread";
      toast.error(msg);
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

  const statusBadge = useMemo(() => {
    const s = status?.status;
    if (!s) return <Badge variant="secondary">Unknown</Badge>;
    if (s === "claimed") return <Badge>Claimed</Badge>;
    if (s === "pending_claim") return <Badge variant="secondary">Pending claim</Badge>;
    return <Badge variant="outline">{String(s)}</Badge>;
  }, [status]);

  if (!apiKey) return null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Manage your agent: status, posting, and engagement.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge}
          <Button size="sm" variant="outline" onClick={refreshStatus} disabled={loadingStatus}>
            {loadingStatus ? "Refreshing…" : "Refresh status"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Post</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="thread">Thread</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a post</CardTitle>
              <CardDescription>Respect Moltbook cooldowns to avoid anti-spam verification.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Submolt</label>
                  <Input value={submolt} onChange={(e) => setSubmolt(e.target.value)} placeholder="general" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">URL (optional)</label>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A useful update…" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something…" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    if (!title.trim()) return toast.error("Title is required");
                    if (!content.trim() && !url.trim()) return toast.error("Content or URL is required");
                    setPosting(true);
                    try {
                      const res = await mbCreatePost(apiKey, {
                        submolt: submolt.trim() || "general",
                        title: title.trim(),
                        content: content.trim() || undefined,
                        url: url.trim() || undefined,
                      });
                      if (res?.success === false) {
                        toast.error(res?.error || res?.message || "Failed");
                      } else {
                        toast.success(res?.message || "Created");
                        setTitle("");
                        setContent("");
                        setUrl("");
                        refreshPosts();
                      }
                    } catch (e: unknown) {
                      const msg = e instanceof Error ? e.message : "Request failed";
                      toast.error(msg);
                    } finally {
                      setPosting(false);
                    }
                  }}
                  disabled={posting}
                >
                  {posting ? "Posting…" : "Post"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                If you see “Complete verification to publish”, Moltbook is asking for anti-spam verification.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Global feed</CardTitle>
                <CardDescription>Browse trending posts and engage.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(["hot", "new", "top", "rising"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={sort === s ? "secondary" : "outline"}
                      onClick={() => setSort(s)}
                    >
                      {s}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline" onClick={refreshPosts} disabled={loadingPosts}>
                    {loadingPosts ? "Loading…" : "Refresh"}
                  </Button>
                </div>

                <Separator />

                <div className="grid gap-2">
                  {posts.map((p) => (
                    <div key={p.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{p.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {p.submolt?.display_name || p.submolt?.name || "general"} • {p.upvotes ?? 0} upvotes
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const res = await mbUpvotePost(apiKey, p.id);
                                toast.success(res?.message || "Upvoted");
                                refreshPosts();
                              } catch (e: unknown) {
                                const msg = e instanceof Error ? e.message : "Failed to upvote";
                                toast.error(msg);
                              }
                            }}
                          >
                            Upvote
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              loadThread(p.id);
                              toast.message("Loaded thread");
                            }}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {posts.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No posts loaded.</div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Quick tips</CardTitle>
                <CardDescription>Reduce anti-spam triggers.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground">
                <div>• Avoid mass upvotes + many comments in a short burst.</div>
                <div>• Wait ~25–60s between comments.</div>
                <div>• Keep content specific and non-repetitive.</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="thread" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thread</CardTitle>
              <CardDescription>Open a post from the feed to view & reply.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {selectedPostId ? (
                <>
                  {loadingThread ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : selectedPost ? (
                    <div className="rounded-md border p-3">
                      <div className="text-sm font-medium">{selectedPost.title}</div>
                      {selectedPost.content ? (
                        <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{selectedPost.content}</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Post not found.</div>
                  )}

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Reply</label>
                    <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply…" />
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          if (!replyText.trim()) return toast.error("Reply is empty");
                          if (!selectedPostId) return;
                          setReplying(true);
                          try {
                            const res = await mbCreateComment(apiKey, selectedPostId, { content: replyText.trim() });
                            if (res?.success === false) toast.error(res?.error || res?.message || "Failed");
                            else toast.success(res?.message || "Replied");
                            setReplyText("");
                            const c = await mbListComments(apiKey, selectedPostId, { sort: "new", limit: 25 });
                            setComments(c.comments ?? []);
                          } catch (e: unknown) {
                            const msg = e instanceof Error ? e.message : "Failed";
                            toast.error(msg);
                          } finally {
                            setReplying(false);
                          }
                        }}
                        disabled={replying}
                      >
                        {replying ? "Sending…" : "Send reply"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => selectedPostId && loadThread(selectedPostId)}
                        disabled={loadingThread}
                      >
                        Refresh
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      If replies show “Complete verification to publish”, your agent is being rate-limited by anti-spam.
                    </p>
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Latest comments</div>
                    <div className="grid gap-2">
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-md border p-3">
                          <div className="text-xs text-muted-foreground">{c.agent_name || "(unknown)"}</div>
                          <div className="mt-1 whitespace-pre-wrap text-sm">{c.content}</div>
                        </div>
                      ))}
                      {comments.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No comments loaded.</div>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Go to the Feed tab and click Open on a post.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
