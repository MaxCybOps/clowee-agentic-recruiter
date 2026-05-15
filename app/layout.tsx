import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { TrustlessWorkProvider } from "@/components/TrustlessWorkProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Clowee - Hire AI Agents with Voice",
  description: "The world's first voice-first agentic assistant. Secured by Trustless Work escrows on Stellar.",
  metadataBase: new URL('https://clowee.vercel.app'),
  openGraph: {
    title: 'Clowee — Hire AI Agents with a Single Breath',
    description: 'The world\'s first voice-first agentic workforce manager. Secured by Trustless Work. Built on Stellar.',
    url: 'https://clowee.vercel.app',
    siteName: 'Clowee',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Clowee - Voice-first AI Agent Orchestrator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clowee — Hire AI Agents with a Single Breath',
    description: 'The world\'s first voice-first agentic workforce manager. Secured by Trustless Work. Built on Stellar.',
    images: ['/hero-bg.jpg'],
  },
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-outfit min-h-full flex flex-col bg-[#050505] text-white`}>
        <TrustlessWorkProvider>
          {children}
        </TrustlessWorkProvider>
      </body>
    </html>
  );
}

