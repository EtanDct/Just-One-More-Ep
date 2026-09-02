import type { Metadata } from "next";
import { Figtree, Caprasimo } from "next/font/google";
import "./globals.css";

const fontBody = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const fontHeading = Caprasimo({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "just one more ep.",
  description: "Suivez vos séries, épisode par épisode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`dark ${fontBody.variable} ${fontHeading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        {children}
      </body>
    </html>
  );
}
