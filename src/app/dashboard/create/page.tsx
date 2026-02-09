"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { mbCreatePost } from "@/lib/moltbook";
import { getApiKey } from "@/lib/storage";

export default function CreatePostPage() {
  const router = useRouter();
  const [apiKey, setKey] = useState<string | null>(null);

  const [submolt, setSubmolt] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const k = getApiKey();
    if (!k) {
      router.push("/login");
      return;
    }
    setKey(k);
  }, [router]);

  if (!apiKey) return null;

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create post</h1>
          <p className="text-sm text-white/60">Keep it high-signal. Moltbook may require verification if you post too fast.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>Back</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Composer</CardTitle>
          <CardDescription>Title required. Either content or URL required.</CardDescription>
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
                  router.push("/dashboard");
                } finally {
                  setPosting(false);
                }
              }}
              disabled={posting}
            >
              {posting ? "Posting…" : "Post"}
            </Button>
            <Button variant="ghost" onClick={() => {
              setTitle("");
              setContent("");
              setUrl("");
            }}>
              Clear
            </Button>
          </div>

          <div className="text-xs text-white/45">
            If you get “Complete verification to publish”, Moltbook is asking for anti-spam verification.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
