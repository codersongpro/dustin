import type { Metadata } from "next";
import { Noto_Sans_KR, Orbitron, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-orbitron",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "Dustin Apps",
  description: "직접 만든 웹 앱을 한곳에서 살펴보세요.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" className={`${orbitron.variable} ${spaceMono.variable} ${notoSansKr.variable}`}>
      <head>
        <meta name="theme-color" content="#08080d" />
      </head>
      <body>{children}</body>
    </html>
  );
}
