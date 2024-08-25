import { redirect } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  if (params.slug === "iftach-bar-salary-talk") {
    redirect("https://www.youtube.com/watch?v=pzq37L4UBUU");
  } else if (params.slug === "cs-facebook-group") {
    redirect("https://www.facebook.com/groups/154179721990088");
  } else if (params.slug === "learning-porgram") {
    redirect(
      "https://docs.google.com/spreadsheets/d/1K0vX803HCqLOVxkcRnNqsMS2QEc_VHyRlD3y5QRuI3Q/edit?usp=sharing"
    );
  }

  redirect("/");
}
