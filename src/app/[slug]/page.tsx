import { redirect } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  switch (params.slug) {
    case "iftach-bar-salary-talk":
      redirect("https://www.youtube.com/watch?v=pzq37L4UBUU");
    case "cs-facebook-group":
      redirect("https://www.facebook.com/groups/154179721990088");
    case "learning-porgram":
      redirect(
        "https://docs.google.com/spreadsheets/d/1K0vX803HCqLOVxkcRnNqsMS2QEc_VHyRlD3y5QRuI3Q/edit?usp=sharing"
      );
    case "evrit-book-chat-promo":
    case "evrit-book-chat-message":
      redirect(
        "https://www.e-vrit.co.il/Product/33185/%D7%94%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%94%D7%99%D7%99%D7%98%D7%A7%D7%99%D7%A1%D7%98_%D7%94%D7%9E%D7%AA%D7%97%D7%99%D7%9C"
      );
    case "steimatzky-book-chat-promo":
    case "steimatzky-book-chat-message":
      redirect("https://www.steimatzky.co.il/011360920");
  }

  redirect("/");
}
