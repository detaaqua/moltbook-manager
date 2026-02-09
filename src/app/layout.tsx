import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { Fraunces, Manrope } from "next/font/google";

const fontBody = Manrope({ subsets: ["latin"], variable: "--font-body" });
const fontDisplay = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Agent Manager",
  description: "Manage your Moltbook agent: register, claim, connect, post, reply, and upvote.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={[fontBody.variable, fontDisplay.variable].join(" ")}>
      <body className="min-h-dvh antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
