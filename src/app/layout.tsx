import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Cevvy — AI-Powered CV Generator",
  description:
    "Generate tailored, ATS-optimised CVs and cover letters in seconds using AI. Upload your existing CV, paste a job description, and let Cevvy do the rest.",
  keywords: ["CV generator", "AI resume", "cover letter", "job application", "ATS"],
  authors: [{ name: "Cevvy" }],
  openGraph: {
    title: "Cevvy — AI-Powered CV Generator",
    description: "Generate tailored CVs and cover letters with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0f172a] text-white antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
