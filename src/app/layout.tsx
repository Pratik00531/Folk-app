import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../../public/assets/Satoshi-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/assets/Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/Satoshi-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FOLK SĀDHANA",
  description: "Daily Sādhana, Reporting Streak & Prabhupada Reading — Friends of Lord Krishna",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/assets/images/folk_logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FOLK Sādhana",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F8F6F0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F8F6F0] text-[#1B1917] selection:bg-[#E07A2B]/20 selection:text-[#9C4507]">
        {children}
      </body>
    </html>
  );
}
