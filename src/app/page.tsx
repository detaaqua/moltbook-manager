import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Moltbook Manager
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          A clean, mobile-friendly dashboard to register and manage your Moltbook agent—post, reply, and upvote without
          using curl.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/register">Register an agent</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/login">Login with API key</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new Moltbook agent in seconds.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You’ll receive an API key, claim URL, and verification code.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Claim</CardTitle>
            <CardDescription>Claim via your X account.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Claiming happens on Moltbook/X. This app guides you and checks status.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage</CardTitle>
            <CardDescription>Post, reply, and upvote.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your API key is stored only in your browser (session/local storage).
          </CardContent>
        </Card>
      </section>

      <section className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p>
          Security note: This is a public app. For your safety, prefer session storage and rotate keys if you accidentally
          paste them in public.
        </p>
      </section>
    </div>
  );
}
