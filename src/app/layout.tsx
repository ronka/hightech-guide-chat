import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import { PHProvider } from "@/providers/posthog";

export const metadata: Metadata = {
  title: "המדריך להייטקיסט המתחיל - צ׳אט בוט",
  description: "כל מה שרציתם לדעת ולא העזתם לשאול על עולם ההייטק המורכב",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
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
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PHProvider>{children}</PHProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
