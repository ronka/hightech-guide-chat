import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/auth/sign-in/magic-link", method: "POST" },
    { path: "/api/chat", method: "POST" },
    { path: "/api/analyze-cv", method: "POST" },
  ],
});
