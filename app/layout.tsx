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
  title: {
    default: "FinTrack Admin — Control Center",
    template: "%s | FinTrack Admin",
  },

  description:
    "FinTrack Admin Control Center — securely manage users, budgets, expenses, income, savings, subscriptions, and financial analytics.",

  keywords: [
    "FinTrack",
    "FinTrack Admin",
    "FinTrack Admin Panel",
    "Admin Dashboard",
    "Finance Admin Dashboard",
    "Finance Management",
    "Expense Management",
    "Financial Analytics",
  ],

  authors: [
    {
      name: "Satinder Singh Sall",
    },
  ],

  creator: "Satinder Singh Sall",

  metadataBase: new URL("https://fintrack-adminpanel.vercel.app"),

  openGraph: {
    title: "FinTrack Admin — Control Center",

    description:
      "Securely manage users, finances, and analytics through the FinTrack administration control center.",

    url: "https://fintrack-adminpanel.vercel.app",

    siteName: "FinTrack Admin",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FinTrack Admin Control Center",
      },
    ],

    locale: "en_US",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "FinTrack Admin — Control Center",

    description:
      "A modern administration control center for managing the FinTrack platform.",

    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
