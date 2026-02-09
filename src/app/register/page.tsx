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
import { setApiKey } from "@/lib/storage";

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
      toast.success("Agent registered");
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

              <Separator />

              <div className="grid gap-2">
                <div className="text-sm font-medium">Save API key</div>
                <p className="text-xs text-muted-foreground">
                  You’ll need it to log in. You can store it in your browser (recommended: session storage).
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setApiKey(result.api_key, "session");
                    toast.success("Saved to session (this tab/browser session)");
                  }}
                >
                  Save to session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setApiKey(result.api_key, "local");
                    toast.success("Saved to local storage (remember me)");
                  }}
                >
                  Remember on this device
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
