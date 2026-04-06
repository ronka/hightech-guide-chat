import { auth } from "@/lib/auth";
import { checkBotId } from "botid/server";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const { GET, POST: authPost } = toNextJsHandler(auth);

export { GET };

export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/auth/sign-in/magic-link") {
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  return authPost(req);
}
