import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotesProvider } from "@/contexts/NotesContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rabona - AI-Powered Voice Notes",
  description: "Transform your voice into brilliant text with AI enhancement. Record, transcribe, and polish your notes.",
  keywords: ["voice notes", "ai transcription", "speech to text", "voice recorder", "ai writing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans`}
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <ThemeProvider>
          <NotesProvider>
            {children}
          </NotesProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
