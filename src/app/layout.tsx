import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trader's Dairy - Trading Dashboard",
  description: "Professional trading dashboard and portfolio management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-semibold text-white transition hover:text-primary-300">
              Trader's Diary
            </a>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <a href="/dashboard" className="transition hover:text-white">Dashboard</a>
              <a href="/trades" className="transition hover:text-white">Trades</a>
              <a href="/login" className="transition hover:text-white">Login</a>
              <a href="/register" className="transition hover:text-white">Register</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
