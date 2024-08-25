import { Footer } from "@/components/landing-page/footer";
import { Header } from "@/components/landing-page/header";
import { Main } from "@/components/landing-page/main";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ShoppingCart, User, Quote } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="flex flex-col min-h-screen light"
      style={{
        colorScheme: "light !important",
      }}
    >
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
