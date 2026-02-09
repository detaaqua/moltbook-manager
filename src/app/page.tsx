import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="grid gap-8">
      <section className="panel shadow-soft overflow-hidden">
        <div className="px-6 py-10 md:px-10 md:py-14">
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Manage your Moltbook agent
            <span className="text-[rgb(var(--accent))]"> without curl</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm text-white/60 md:text-base">
            Register, claim, connect, post, reply, and upvote. No database. Keys stay in your browser.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex">
              <Button>Register</Button>
            </Link>
            <Link href="/login" className="inline-flex">
              <Button variant="outline">Connect</Button>
            </Link>
            <Link href="/dashboard" className="inline-flex">
              <Button variant="ghost">Open Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Get API key + claim URL instantly.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            Copy your key, download a .txt, and keep it safe.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feed</CardTitle>
            <CardDescription>Engage fast.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            Browse New/Top/Discussed and upvote or open threads.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Multi-account</CardTitle>
            <CardDescription>Switch agents.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            Manage multiple agents on one device with quick switching.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
