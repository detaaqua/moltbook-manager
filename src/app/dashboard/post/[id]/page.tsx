"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { mbCreateComment, mbGetPost, mbListComments, mbUpvotePost } from "@/lib/moltbook";
import { getApiKey } from "@/lib/storage";

export default function PostThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [apiKey, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [post, setPost] = useState<Awaited<ReturnType<typeof mbGetPost>>["post"] | null>(null);
  const [comments, setComments] = useState<NonNullable<Awaited<ReturnType<typeof mbListComments>>["comments"]>>([]);

  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const id = params?.id;

  async function loadAll(k: string) {
    if (!id) return;
    setLoading(true);
    try {
      const p = await mbGetPost(k, id);
      setPost(p.post ?? null);
      const c = await mbListComments(k, id, { sort: "new", limit: 80 });
      setComments(c.comments ?? []);
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
  }, [router, id]);

  if (!apiKey) return null;

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thread</h1>
          <p className="text-sm text-white/60">Post + comments. Reply with pacing.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}> <FontAwesomeIcon icon={faArrowLeft} /> Back</Button>
          <Button variant="outline" onClick={() => loadAll(apiKey)} disabled={loading}>
            <FontAwesomeIcon icon={faRotateRight} /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post</CardTitle>
          <CardDescription>Vote & read context.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : !post ? (
            <div className="text-sm text-white/60">Post not found.</div>
          ) : (
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
              <div className="mb-1 text-xs text-white/55">
                <span className="text-[rgb(var(--accent))]">m/{post.submolt?.name || "general"}</span>
                <span className="mx-1">•</span>
                <span>u/{post.agent_name || "unknown"}</span>
              </div>
              <div className="text-pretty text-xl font-semibold text-white">{post.title}</div>
              {post.content ? (
                <div className="mt-3 whitespace-pre-wrap text-sm text-white/70">{post.content}</div>
              ) : null}
              {post.url ? <div className="mt-2 text-sm text-[rgb(var(--accent-2))]">{post.url}</div> : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await mbUpvotePost(apiKey, post.id);
                    await loadAll(apiKey);
                  }}
                >
                  Upvote
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
          <CardDescription>Write a comment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Your comment…" />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                if (!replyText.trim() || !id) return;
                setReplying(true);
                try {
                  await mbCreateComment(apiKey, id, { content: replyText.trim() });
                  setReplyText("");
                  await loadAll(apiKey);
                } finally {
                  setReplying(false);
                }
              }}
              disabled={replying}
            >
              {replying ? "Sending…" : "Reply"}
            </Button>
          </div>
          <div className="text-xs text-white/45">
            If verification is required, Moltbook may accept the comment but not publish it.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {comments.map((c) => (
              <div key={c.id} className="rounded-2xl border border-[rgb(var(--border))] bg-white/5 p-4">
                <div className="text-xs text-white/55">u/{c.agent_name || "unknown"}</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">{c.content}</div>
              </div>
            ))}
            {!comments.length ? <div className="text-sm text-white/60">No comments yet.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
