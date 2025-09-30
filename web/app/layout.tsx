import type { Metadata } from "next";
import { Afacad_Flux } from "next/font/google";

import "./globals.css";

const afacadFlux = Afacad_Flux({
  variable: "--font-afacad-flux",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GitHub Issue Analyzer",
  description:
    "AI-powered analysis of GitHub repository issues with intelligent categorization and priority assessment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${afacadFlux.className} antialiased`}>{children}</body>
    </html>
  );
}
