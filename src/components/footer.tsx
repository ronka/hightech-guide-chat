import Link from "next/link";
import { Linkedin, X } from "lucide-react";
import { track } from "@vercel/analytics";

const Footer = () => {
  return (
    <footer className="bg-muted p-4 text-sm text-muted-foreground">
      <div className="container mx-auto flex items-center justify-between">
        <p>&copy; המדריך להייטקיסט המתחיל</p>
        <nav className="flex items-center gap-4">
          <span
            onClick={() => {
              track("Contant", { source: "i want book" });
            }}
          >
            <Link
              href="https://www.linkedin.com/in/ron-kantor"
              target="_blank"
              className="hover:underline"
              prefetch={false}
            >
              רוצים צ׳אט-בוט לספר שלכם? צרו קשר
            </Link>
          </span>
          <span
            onClick={() => {
              track("Contant", { source: "Linkedin" });
            }}
          >
            <Link
              href="https://www.linkedin.com/in/ron-kantor"
              target="_blank"
              className="hover:opacity-50"
              prefetch={false}
            >
              <Linkedin />
            </Link>
          </span>
          <span
            onClick={() => {
              track("Contant", { source: "X" });
            }}
          >
            <Link
              href="https://x.com/ronkaa"
              target="_blank"
              className="hover:opacity-50"
              prefetch={false}
            >
              <X />
            </Link>
          </span>
        </nav>
      </div>
    </footer>
  );
};

export { Footer };
