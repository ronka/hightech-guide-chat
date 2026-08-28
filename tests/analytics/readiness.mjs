import { readFileSync } from "node:fs";
const evidence = JSON.parse(
  readFileSync("docs/tracking-launch-evidence.json", "utf8"),
);
const blocked = ["implementation", "providerValidation", "cutover"].filter(
  (key) =>
    evidence[key]?.status !== "PASS" ||
    !Array.isArray(evidence[key]?.evidence) ||
    evidence[key].evidence.length === 0 ||
    (Array.isArray(evidence[key]?.remaining) &&
      evidence[key].remaining.length > 0),
);
if (blocked.length) {
  console.error(
    `NOT LAUNCH READY: ${blocked.join(", ")}. See docs/tracking-launch-evidence.json.`,
  );
  process.exitCode = 1;
} else
  console.log(
    "All recorded launch gates passed. Review the evidence before enabling campaigns.",
  );
