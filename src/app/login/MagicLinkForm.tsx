"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

type State = "idle" | "loading" | "sent" | "error";

export function MagicLinkForm({ callbackUrl }: { callbackUrl?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: callbackUrl ?? "/courses",
    });

    if (error) {
      setErrorMsg(error.message ?? "אירעה שגיאה, נסה שנית");
      setState("error");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="text-center space-y-4 max-w-sm" dir="rtl">
        <h1 className="text-2xl font-bold">בדוק את המייל שלך</h1>
        <p className="text-muted-foreground">
          שלחנו לך קישור כניסה לכתובת <strong>{email}</strong>.
          לחץ על הקישור כדי להיכנס.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6" dir="rtl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">כניסה</h1>
        <p className="text-muted-foreground">הזן את כתובת המייל שלך לקבלת קישור כניסה</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={state === "loading"}
          dir="ltr"
          className="text-left"
        />

        {state === "error" && (
          <p className="text-sm text-destructive">{errorMsg}</p>
        )}

        <Button type="submit" className="w-full" disabled={state === "loading"}>
          {state === "loading" ? "שולח..." : "שלח קישור כניסה"}
        </Button>
      </form>
    </div>
  );
}
