import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";

export const metadata: Metadata = {
  title: "OpusClip — #1 AI Video Clipping & Editing Studio",
  description:
    "Turn 1 long video into 10 viral short clips in one click with ClipAnything™, Virality Score™, Animated Karaoke Captions, AI Reframe, and Social Scheduling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090B] text-zinc-100 antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
