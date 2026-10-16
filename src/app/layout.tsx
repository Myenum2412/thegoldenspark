import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppwritePing from "@/components/appwrite-ping";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Golden Spark Pvt Ltd – Premium Fireworks in Salem",
  description:
    "Golden Spark Pvt Ltd — premium Sivakasi crackers for retail, bulk & wholesale at direct factory rates. Every Spark has a Story. Call +91 9087606352.",
  keywords: [
    "Golden Spark",
    "Sivakasi crackers",
    "fireworks",
    "wholesale crackers",
    "buy crackers online",
    "Sivakasi fireworks",
  ],
  openGraph: {
    title: "Golden Spark Pvt Ltd – Premium Fireworks in Salem",
    description:
      "Premium Sivakasi crackers for retail, bulk & wholesale. Every Spark has a Story.",
    type: "website",
    images: [{ url: "/logo.png", width: 375, height: 666 }],
  },
  twitter: {
    card: "summary",
    title: "Golden Spark Pvt Ltd – Premium Fireworks in Salem",
    description:
      "Premium Sivakasi crackers for retail, bulk & wholesale. Every Spark has a Story.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppwritePing />
        {children}
      </body>
    </html>
  );
}
