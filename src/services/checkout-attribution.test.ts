import { checkoutUrl } from "./checkout-attribution";
it("forwards only bounded campaign parameters, never arbitrary personal/payment fields", () => {
  const url = new URL(
    checkoutUrl(
      "https://pay.grow.link/example",
      new URLSearchParams({
        utm_source: "google",
        gclid: "click123",
        email: "private@example.com",
        token: "secret",
        sum: "1",
        cField1: "unverified",
      }),
    ),
  );
  expect([...url.searchParams]).toEqual([
    ["utm_source", "google"],
    ["gclid", "click123"],
  ]);
});
it("does not duplicate or override existing checkout settings", () => {
  const url = new URL(
    checkoutUrl(
      "https://pay.grow.link/example?utm_source=existing",
      new URLSearchParams(
        "utm_source=other&utm_source=third&fbclid=" + "a".repeat(501),
      ),
    ),
  );
  expect([...url.searchParams]).toEqual([["utm_source", "existing"]]);
});
