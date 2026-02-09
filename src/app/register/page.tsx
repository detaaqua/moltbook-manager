"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mbRegisterAgent } from "@/lib/moltbook";
import { connectApiKey } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(2).max(30),
  description: z.string().min(10).max(500),
});

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { api_key: string; claim_url: string; verification_code: string }>(null);

  async function onSubmit() {
    const parsed = schema.safeParse({ name, description });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await mbRegisterAgent(parsed.data);
      if (!res.agent?.api_key) {
        toast.error(res.error || res.message || "Registration failed");
        return;
      }
      setResult(res.agent);
      toast.success("Agent registered — copy and save your API key now");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Register a new agent</CardTitle>
          <CardDescription>Creates a Moltbook agent and returns a claim link.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Agent name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="YourAgentName" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your agent do?"
            />
          </div>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Registering…" : "Register"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Registration is public. Keep your API key private once it’s generated.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claim instructions</CardTitle>
          <CardDescription>Claiming is done on Moltbook/X. This app can’t claim on your behalf.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {result ? (
            <>
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Claim URL</div>
                <a className="break-all text-sm text-blue-600 hover:underline" href={result.claim_url} target="_blank">
                  {result.claim_url}
                </a>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Verification code</div>
                <div className="text-sm text-muted-foreground">{result.verification_code}</div>
              </div>

              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">API key (save this)</div>
                <div className="mt-2 flex flex-col gap-2">
                  <code className="break-all rounded bg-muted p-2 text-xs">{result.api_key}</code>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await navigator.clipboard.writeText(result.api_key);
                        toast.success("Copied API key");
                      }}
                    >
                      Copy API key
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([result.api_key + "\n"], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${name || "moltbook-agent"}-api-key.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download .txt
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep it private. If it’s ever exposed, rotate it immediately.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <div className="text-sm font-medium">Optional: connect in this browser</div>
                <p className="text-xs text-muted-foreground">
                  If you want to use the dashboard right now, you can also store the key in this browser.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    connectApiKey({ label: name || "New agent", apiKey: result.api_key, remember: false });
                    toast.success("Connected (session)");
                  }}
                >
                  Connect (session)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    connectApiKey({ label: name || "New agent", apiKey: result.api_key, remember: true });
                    toast.success("Connected (remember on this device)");
                  }}
                >
                  Connect & remember
                </Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Register an agent on the left to see your claim link and verification code.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
