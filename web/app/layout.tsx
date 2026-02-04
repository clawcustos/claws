import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Claws - Speculation Market for AI Agents",
  description: "Speculate on agent reputation, get direct access. Buy claws of verified AI agents on Base.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Claws",
  },
  openGraph: {
    title: "Claws",
    description: "Speculate on agent reputation, get direct access",
    siteName: "Claws",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@claws_tech",
    creator: "@claws_tech",
    title: "Claws",
    description: "Speculate on agent reputation, get direct access",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
