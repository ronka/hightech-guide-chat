import { act } from "react";
import { createRoot } from "react-dom/client";
import { GoogleTag } from "./google-tag";
import { FacebookPixel } from "./facebook-pixel";
import { flushAnalyticsEvents, track } from "@/services/analytics";
import { setTrackingConsent } from "@/services/analytics-consent";
jest.mock("@/services/analytics-config", () => ({
  ...jest.requireActual("@/services/analytics-config"),
  browserAnalyticsEnabled: () => true,
}));

jest.mock("posthog-js", () => ({
  __esModule: true,
  default: { capture: jest.fn(), init: jest.fn() },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
beforeEach(() =>
  setTrackingConsent({ analytics: "granted", marketing: "granted" }),
);

it("renders neither tags nor the noscript beacon without consent", async () => {
  setTrackingConsent({ analytics: "unknown", marketing: "unknown" });
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () =>
    root.render(
      <>
        <GoogleTag />
        <FacebookPixel />
      </>,
    ),
  );
  expect(container.innerHTML).toBe("");
  await act(async () => root.unmount());
});

it.each([
  ["Google", GoogleTag],
  ["Facebook", FacebookPixel],
] as const)(
  "flushes early %s events after the real Next inline script executes",
  async (provider, Component) => {
    // Do not mock next/script: its inline onReady runs BEFORE script insertion.
    window.gtag = undefined;
    window.fbq = undefined;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      track("view_content", { source: "early-page-effect" });
      await act(async () => root.render(<Component />));

      const commands =
        provider === "Google"
          ? Reflect.get(window, "dataLayer")
          : Reflect.get(window.fbq!, "queue");
      expect(
        Array.from(commands, (args: unknown) =>
          Array.from(args as ArrayLike<unknown>),
        ),
      ).toContainEqual(
        expect.arrayContaining([
          provider === "Google" ? "event" : "track",
          provider === "Google" ? "view_content" : "ViewContent",
          expect.objectContaining({ source: "early-page-effect" }),
        ]),
      );
    } finally {
      await act(async () => root.unmount());
      container.remove();
      window.gtag = jest.fn();
      window.fbq = jest.fn();
      flushAnalyticsEvents();
    }
  },
);
