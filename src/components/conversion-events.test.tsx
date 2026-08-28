import { act, StrictMode, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import posthog from "posthog-js";
import { ContactForm } from "./landing-page/contact-form";
import {
  RonkaCourseButton,
  RonkaDigitalBookButton,
  RonkaPhysicalBookButton,
  ConsultingButton,
  SteimatzkyButton,
} from "./landing-page/buttons";
import CoursePage from "@/app/cracking-the-job-interview/page";
import AIPage from "@/app/start-working-with-ai/page";
import { CHECKOUT_PRODUCTS } from "@/services/checkout-analytics";
import { setTrackingConsent } from "@/services/analytics-consent";
import { Footer } from "./footer";
import { ProductView } from "./product-view";
jest.mock("@/services/analytics-config", () => ({
  ...jest.requireActual("@/services/analytics-config"),
  browserAnalyticsEnabled: () => true,
}));

jest.mock("posthog-js", () => ({
  __esModule: true,
  default: { capture: jest.fn(), init: jest.fn() },
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("@/lib/auth-client", () => ({
  authClient: { useSession: () => ({ data: null }) },
}));
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined }),
}));
jest.mock("./animated-students-counter", () => ({
  AnimatedStudentsCounter: () => null,
}));
jest.mock("./landing-page/about", () => ({ About: () => null }));
jest.mock("./logos/google.svg", () => "google.svg");
jest.mock("./logos/melio.svg", () => "melio.svg");
jest.mock("./logos/microsoft.svg", () => "microsoft.svg");
jest.mock("./logos/jfrog.svg", () => "jfrog.svg");
jest.mock("./logos/dropbox.svg", () => "dropbox.svg");
jest.mock("./logos/wsc.svg", () => "wsc.svg");
jest.mock(
  "@/app/cracking-the-job-interview/feedbacks/feedback1.jpg",
  () => "feedback1.jpg",
);
jest.mock(
  "@/app/cracking-the-job-interview/feedbacks/feedback2.jpg",
  () => "feedback2.jpg",
);
jest.mock(
  "@/app/cracking-the-job-interview/feedbacks/feedback3.jpg",
  () => "feedback3.jpg",
);
jest.mock(
  "@/app/cracking-the-job-interview/feedbacks/feedback4.png",
  () => "feedback4.png",
);
jest.mock(
  "@/app/cracking-the-job-interview/feedbacks/feedback5.png",
  () => "feedback5.png",
);

let mockFormState = { succeeded: false, submitting: false, errors: null };
jest.mock("@formspree/react", () => ({
  useForm: () => [mockFormState, jest.fn()],
  ValidationError: () => null,
}));

let container: HTMLDivElement;
let root: Root;
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

beforeEach(() => {
  setTrackingConsent({ analytics: "granted", marketing: "granted" });
  mockFormState = { succeeded: false, submitting: false, errors: null };
  window.gtag = jest.fn();
  window.fbq = jest.fn();
  jest.clearAllMocks();
  container = document.createElement("div");
  // Cancel only navigation; the real React handlers still run.
  container.addEventListener("click", (event) => event.preventDefault());
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function render(element: ReactNode) {
  await act(async () => root.render(<StrictMode>{element}</StrictMode>));
}

async function click(element: Element | null) {
  expect(element).not.toBeNull();
  if (!element) throw new Error("Expected a clickable element");
  await act(async () =>
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    ),
  );
}

it.each([
  [RonkaCourseButton, "job-interview-course"],
  [RonkaPhysicalBookButton, "physical-book"],
  [RonkaDigitalBookButton, "digital-book"],
] as const)(
  "tracks a landing-page checkout once (%s)",
  async (Component, product) => {
    await render(<Component />);
    const anchor = container.querySelector("a");
    expect(anchor?.href).toBe(CHECKOUT_PRODUCTS[product].href);
    expect(anchor?.className).toContain("w-full");
    await click(anchor);
    expect(window.fbq).toHaveBeenCalledTimes(1);
    expect(window.fbq).toHaveBeenCalledWith(
      "track",
      "InitiateCheckout",
      expect.any(Object),
    );
    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "begin_checkout",
      expect.any(Object),
    );
  },
);

it("reports one checkout per course CTA click, with no bubbling duplicate", async () => {
  await render(<CoursePage />);
  const buttons = container.querySelectorAll(
    `a[href="${CHECKOUT_PRODUCTS["job-interview-course"].href}"]`,
  );
  expect(buttons.length).toBe(4);
  for (const button of buttons) {
    jest.clearAllMocks();
    await click(button);
    expect(window.fbq).toHaveBeenCalledTimes(1);
    expect(window.fbq).toHaveBeenCalledWith(
      "track",
      "InitiateCheckout",
      expect.objectContaining({ value: 99 }),
    );
    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledTimes(1);
  }
});

it("reports one canonical course impression in StrictMode and no extra views on iframe load", async () => {
  await render(<CoursePage />);
  expect(
    jest
      .mocked(window.fbq!)
      .mock.calls.filter(([, name]) => name === "ViewContent"),
  ).toHaveLength(1);
  expect(window.gtag).toHaveBeenCalledWith(
    "event",
    "view_item",
    expect.objectContaining({
      items: [expect.objectContaining({ item_id: "job-interview-course" })],
    }),
  );
  jest.clearAllMocks();
  await act(async () =>
    container.querySelector("iframe")!.dispatchEvent(new Event("load")),
  );
  expect(window.fbq).toHaveBeenCalledWith(
    "trackCustom",
    "video_loaded",
    expect.any(Object),
  );
  expect(
    jest
      .mocked(window.fbq!)
      .mock.calls.some(([, name]) => name === "ViewContent"),
  ).toBe(false);
});

it("does not turn social profile visits into contacts", async () => {
  await render(<Footer />);
  for (const anchor of container.querySelectorAll('a[href^="https:"]')) {
    jest.clearAllMocks();
    await click(anchor);
    expect(window.fbq).toHaveBeenCalledTimes(1);
    expect(window.fbq).toHaveBeenCalledWith(
      "trackCustom",
      "social_link_click",
      expect.any(Object),
    );
  }
});

it("reports a product to newly consented providers without duplicating previous providers", async () => {
  setTrackingConsent({ analytics: "granted", marketing: "unknown" });
  jest.clearAllMocks();
  await render(<ProductView product="digital-book" source="test" />);
  expect(window.gtag).toHaveBeenCalledTimes(1);
  expect(window.fbq).not.toHaveBeenCalled();
  await act(async () =>
    setTrackingConsent({ analytics: "granted", marketing: "granted" }),
  );
  expect(
    jest
      .mocked(window.gtag!)
      .mock.calls.filter(([command]) => command === "event"),
  ).toHaveLength(1);
  expect(
    jest
      .mocked(window.fbq!)
      .mock.calls.filter(([command]) => command === "track"),
  ).toHaveLength(1);
  await render(<ProductView product="digital-book" source="test" />);
  expect(
    jest
      .mocked(window.fbq!)
      .mock.calls.filter(([command]) => command === "track"),
  ).toHaveLength(1);
  await render(null);
  jest.clearAllMocks();
  await render(<ProductView product="digital-book" source="test" />);
  expect(window.gtag).toHaveBeenCalledTimes(1);
  expect(window.fbq).toHaveBeenCalledTimes(1);
});

it("reports Google Form interest without a checkout or cart conversion", async () => {
  await render(<AIPage />);
  jest.clearAllMocks();
  await click(
    container.querySelector('a[href="https://forms.gle/jMms7fX11cHxzUSV8"]'),
  );
  expect(window.fbq).toHaveBeenCalledTimes(1);
  expect(window.fbq).toHaveBeenCalledWith(
    "trackCustom",
    "course_interest_click",
    expect.any(Object),
  );
});

it.each([
  [ConsultingButton, "consulting_click"],
  [SteimatzkyButton, "book_click"],
] as const)(
  "keeps non-conversion clicks custom (%s)",
  async (Component, name) => {
    await render(<Component />);
    await click(container.querySelector("a"));
    expect(window.fbq).toHaveBeenCalledWith(
      "trackCustom",
      name,
      expect.any(Object),
    );
  },
);

it("reports a lead only after Formspree succeeds, once across re-renders", async () => {
  await render(<ContactForm />);
  expect(window.fbq).not.toHaveBeenCalled();
  mockFormState = { ...mockFormState, submitting: true };
  await render(<ContactForm />);
  expect(window.fbq).not.toHaveBeenCalled();
  mockFormState = { ...mockFormState, submitting: false };
  await render(<ContactForm />);
  expect(window.fbq).not.toHaveBeenCalled();
  mockFormState = { ...mockFormState, succeeded: true };
  await render(<ContactForm />);
  await render(<ContactForm />);
  expect(window.fbq).toHaveBeenCalledTimes(1);
  expect(window.fbq).toHaveBeenCalledWith("track", "Lead", {
    source: "contact-form",
    form_id: "contact",
  });
  expect(window.gtag).toHaveBeenCalledTimes(1);
  expect(window.gtag).toHaveBeenCalledWith(
    "event",
    "generate_lead",
    expect.objectContaining({ source: "contact-form" }),
  );
});
