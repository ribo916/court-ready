import type { Metadata } from "next";
import type { Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Court Ready",
  title: "Court Ready",
  description:
    "A calm daily dashboard for energy, strength, recovery, and pickleball readiness.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Court Ready",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f5ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
