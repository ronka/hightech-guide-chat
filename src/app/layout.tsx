import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { PHProvider } from "@/providers/posthog";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Assistant } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { FacebookPixel } from "@/components/facebook-pixel";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QueryProvider } from "@/providers/query";

// If loading a variable font, you don't need to specify the font weight
const googleFont = Assistant({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "המדריך להייטקיסט המתחיל",
  description:
    "כל מה שרציתם לדעת ולא העזתם לשאול על עולם ההייטק המורכב, הספר שכל ג׳וניור צריך להכיר",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      dir="rtl"
      suppressHydrationWarning
      className={`dark ${googleFont.className}`}
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <FacebookPixel />
      </head>
      <body>
        <ThemeProvider>
          <PHProvider>
            <QueryProvider>
              <Header />
              {children}
              <Footer />
            </QueryProvider>
          </PHProvider>
          <Analytics />
          <GoogleAnalytics gaId="G-C1Q1JYQ35E" />
          <GoogleAnalytics gaId="G-07PEBMF7K9" />
        </ThemeProvider>
      </body>
    </html>
  );
}
