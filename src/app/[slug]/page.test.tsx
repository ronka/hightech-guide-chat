import { redirect } from "next/navigation";
import Page from "./page";

// Mock the next/navigation redirect function
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Page component", () => {
  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  test("redirects to YouTube for iftach-bar-salary-talk", () => {
    Page({ params: { slug: "iftach-bar-salary-talk" } });
    expect(redirect).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=pzq37L4UBUU"
    );
  });

  test("redirects to Facebook group for cs-facebook-group", () => {
    Page({ params: { slug: "cs-facebook-group" } });
    expect(redirect).toHaveBeenCalledWith(
      "https://www.facebook.com/groups/154179721990088"
    );
  });

  test("redirects to Google Sheets for learning-porgram", () => {
    Page({ params: { slug: "learning-porgram" } });
    expect(redirect).toHaveBeenCalledWith(
      "https://docs.google.com/spreadsheets/d/1K0vX803HCqLOVxkcRnNqsMS2QEc_VHyRlD3y5QRuI3Q/edit?usp=sharing"
    );
  });

  test("redirects to e-vrit for evrit-book-chat-promo", () => {
    Page({ params: { slug: "evrit-book-chat-promo" } });
    expect(redirect).toHaveBeenCalledWith(
      "https://www.e-vrit.co.il/Product/33185/%D7%94%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%94%D7%99%D7%99%D7%98%D7%A7%D7%99%D7%A1%D7%98_%D7%94%D7%9E%D7%AA%D7%97%D7%99%D7%9C"
    );
  });

  test("redirects to e-vrit for evrit-book-chat-message", () => {
    Page({ params: { slug: "evrit-book-chat-message" } });
    expect(redirect).toHaveBeenCalledWith(
      "https://www.e-vrit.co.il/Product/33185/%D7%94%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%94%D7%99%D7%99%D7%98%D7%A7%D7%99%D7%A1%D7%98_%D7%94%D7%9E%D7%AA%D7%97%D7%99%D7%9C"
    );
  });

  test("redirects to steimatzky for steimatzky-book-chat-promo", () => {
    Page({ params: { slug: "steimatzky-book-chat-promo" } });
    expect(redirect).toHaveBeenCalledWith(
      "https://www.steimatzky.co.il/011360920"
    );
  });

  test("redirects to steimatzky for steimatzky-book-chat-message", () => {
    Page({ params: { slug: "steimatzky-book-chat-message" } });
    expect(redirect).toHaveBeenCalledWith(
      "https://www.steimatzky.co.il/011360920"
    );
  });

  test("redirects to home for unknown slug", () => {
    Page({ params: { slug: "unknown-path" } });
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
