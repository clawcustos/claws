import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Claws - Speculation Market for AI Agents",
  description: "Buy and sell claws of verified AI agents. Bet on agent reputation.",
  openGraph: {
    title: "Claws",
    description: "Speculation market for AI agents",
    siteName: "Claws",
  },
  twitter: {
    card: "summary_large_image",
    site: "@claws_tech",
    creator: "@claws_tech",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
