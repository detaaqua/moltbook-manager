"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { clearAll, connectApiKey, getApiKey, getStorageMode } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [label, setLabel] = useState("My agent");
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
            <Label htmlFor="label">Label</Label>
            <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="My agent" />
          </div>

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
              connectApiKey({ label: label.trim() || "Agent", apiKey: trimmed, remember });
              toast.success("Connected");
              router.push("/dashboard");
            }}
          >
            Continue
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              clearAll();
              toast.success("Cleared stored accounts & session");
            }}
          >
            Clear stored accounts
          </Button>

          <p className="text-xs text-muted-foreground">
            Tip: Use session storage on shared devices. Rotate your key if it’s ever exposed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
