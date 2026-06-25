import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAJA SEWA MOBIL - AI TARIF",
  description: "Aplikasi PWA untuk menghitung dan merekomendasi tarif pengiriman barang.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-900 pb-20`}>
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-sm relative overflow-x-hidden">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
