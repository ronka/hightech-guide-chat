import fs from "fs";
import path from "path";
import { db } from "@/db/index";
import { coursePurchase } from "@/db/schema";

const COURSE_SLUG = "job-interview-course";
const CSV_PATH = path.resolve(process.argv[2] ?? "pm.csv");

function parseCSV(content: string) {
  const lines = content.trim().split("\n");
  const headers = lines[0].replace(/"/g, "").split(",");
  return lines.slice(1).map((line) => {
    const values = line.match(/(".*?"|[^,]+)/g)?.map((v) => v.replace(/"/g, "")) ?? [];
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

async function main() {
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(content);

  console.log(`Importing ${rows.length} purchases...`);

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = row.billing_email?.toLowerCase().trim();
    const transactionCode = row.order_id?.trim() || null;
    const purchasedAt = new Date(row.purchase_date);

    if (!email) {
      console.warn("Skipping row with no email:", row);
      skipped++;
      continue;
    }

    const result = await db
      .insert(coursePurchase)
      .values({
        id: crypto.randomUUID(),
        email,
        courseSlug: COURSE_SLUG,
        transactionCode,
        purchasedAt,
      })
      .onConflictDoNothing({ target: coursePurchase.transactionCode })
      .returning({ id: coursePurchase.id });

    if (result.length > 0) {
      console.log(`  ✓ ${email} (order ${transactionCode})`);
      inserted++;
    } else {
      console.log(`  ~ skipped duplicate: ${email} (order ${transactionCode})`);
      skipped++;
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped/duplicates: ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
