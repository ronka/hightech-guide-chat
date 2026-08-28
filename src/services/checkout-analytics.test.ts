jest.mock("./analytics", () => ({ track: jest.fn() }));
import { track } from "./analytics";
import { CHECKOUT_PRODUCTS, trackCheckout } from "./checkout-analytics";

beforeEach(() => jest.clearAllMocks());

it("reports a single course checkout with consistent Google and Meta IDs", () => {
  trackCheckout("job-interview-course", {
    source: "course",
    button_location: "hero",
  });
  expect(track).toHaveBeenCalledTimes(1);
  expect(track).toHaveBeenCalledWith(
    "begin_checkout",
    expect.objectContaining({
      value: 99,
      currency: "ILS",
      button_location: "hero",
      items: [
        {
          item_id: "job-interview-course",
          item_name: CHECKOUT_PRODUCTS["job-interview-course"].name,
          quantity: 1,
          price: 99,
        },
      ],
      content_ids: ["job-interview-course"],
      contents: [{ id: "job-interview-course", quantity: 1, item_price: 99 }],
    }),
  );
});

it.each(["physical-book", "digital-book"] as const)(
  "does not invent a price for %s",
  (product) => {
    trackCheckout(product, { source: "landing-page" });
    const params = jest.mocked(track).mock.calls[0][1];
    if (!params) throw new Error("Expected checkout parameters");
    expect(params).not.toHaveProperty("value");
    expect(params.items).toEqual([
      {
        item_id: product,
        item_name: CHECKOUT_PRODUCTS[product].name,
        quantity: 1,
      },
    ]);
  },
);
