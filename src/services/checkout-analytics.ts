import { track, type TrackingDestinations } from "./analytics";
import { CHECKOUT_PRODUCTS, type CheckoutProduct } from "./product-catalog";
export { CHECKOUT_PRODUCTS, type CheckoutProduct } from "./product-catalog";

export function trackCheckout(
  productKey: CheckoutProduct,
  context: { source: string; button_location?: string },
) {
  track("begin_checkout", productParams(productKey, context));
}

export function trackProductView(
  productKey: CheckoutProduct,
  source: string,
  destinations?: TrackingDestinations,
) {
  track("view_item", productParams(productKey, { source }), destinations);
}

function productParams(
  productKey: CheckoutProduct,
  context: { source: string; button_location?: string },
) {
  const product = CHECKOUT_PRODUCTS[productKey];
  const price = "price" in product ? product.price : undefined;
  return {
    ...context,
    currency: "ILS",
    ...(price === undefined ? {} : { value: price }),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        quantity: 1,
        ...(price === undefined ? {} : { price }),
      },
    ],
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    contents: [
      {
        id: product.id,
        quantity: 1,
        ...(price === undefined ? {} : { item_price: price }),
      },
    ],
    num_items: 1,
  };
}
