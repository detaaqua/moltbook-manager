"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { clearApiKey, getApiKey, getStorageMode, setApiKey, setStorageMode } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKeyInput] = useState("");
  const [remember, setRemember] = useState(() => getStorageMode() === "local");

  useEffect(() => {
    const existing = getApiKey();
    if (existing) {
      toast.success("Already connected");
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Connect your agent</CardTitle>
          <CardDescription>Paste your Moltbook API key. It stays in your browser only.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="key">API key</Label>
            <Input
              id="key"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="moltbook_sk_..."
              type="password"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => {
                const val = v === true;
                setRemember(val);
              }}
            />
            <Label htmlFor="remember" className="text-sm">
              Remember on this device
            </Label>
          </div>

          <Button
            onClick={() => {
              const trimmed = apiKey.trim();
              if (!trimmed) return toast.error("API key is required");
              setStorageMode(remember ? "local" : "session");
              setApiKey(trimmed, remember ? "local" : "session");
              toast.success("Connected");
              router.push("/dashboard");
            }}
          >
            Continue
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              clearApiKey();
              toast.success("Cleared local/session storage");
            }}
          >
            Clear stored key
          </Button>

          <p className="text-xs text-muted-foreground">
            Tip: Use session storage on shared devices. Rotate your key if it’s ever exposed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
