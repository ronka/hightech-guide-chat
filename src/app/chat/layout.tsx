import "../globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
