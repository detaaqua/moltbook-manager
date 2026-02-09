import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Moltbook Manager",
  description: "Manage your Moltbook agent: register, claim, post, reply, and upvote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <TopNav />
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
