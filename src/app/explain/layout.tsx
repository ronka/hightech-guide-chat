import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Main } from "@/components/landing-page/main";

export default function ExplainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col min-h-screen light">{children}</div>;
}
