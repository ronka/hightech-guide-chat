import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { build } from "esbuild";

// Requires agent-browser on PATH, as documented in tests/analytics/README.md.
// No user profile, real provider scripts, payment pages, credentials or Next env.
const exec = promisify(execFile);
const session = `tracking-${process.pid}`;
const bundle = await build({
  entryPoints: ["tests/analytics/browser-fixture.tsx"],
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: {
    "process.env.NODE_ENV": '"development"',
    "process.env.NEXT_PUBLIC_ANALYTICS_MODE": '"test"',
    "process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID": '"G-TEST123"',
    "process.env.NEXT_PUBLIC_FB_PIXEL_ID": '"123456"',
    "process.env.NEXT_PUBLIC_ANALYTICS_HOSTNAME": '"127.0.0.1"',
    "process.env.NEXT_PUBLIC_VERCEL_ENV": '"development"',
  },
  plugins: [
    {
      name: "no-posthog-network",
      setup(builder) {
        builder.onResolve({ filter: /^posthog-js$/ }, () => ({
          path: "posthog-js",
          namespace: "test",
        }));
        builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({
          contents: "export default { capture() {}, init() {} };",
          loader: "js",
        }));
      },
    },
  ],
});
const server = createServer((request, response) => {
  // A second safety boundary even if a browser CLI version ignores allowlists.
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'",
  );
  if (request.url === "/fixture.js") {
    response.setHeader("Content-Type", "application/javascript");
    response.end(bundle.outputFiles[0].text);
  } else {
    response.setHeader("Content-Type", "text/html");
    response.end(
      '<!doctype html><html><head><title>Tracking test</title></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>',
    );
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}`;
async function browser(...args) {
  const { stdout } = await exec(
    "agent-browser",
    ["--session", session, "--json", ...args],
    {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
      env: {
        ...process.env,
        AGENT_BROWSER_ALLOWED_DOMAINS: "127.0.0.1",
        AGENT_BROWSER_DEFAULT_TIMEOUT: "10000",
      },
    },
  );
  const result = JSON.parse(stdout);
  assert.notEqual(result.success, false, JSON.stringify(result));
  return result.data;
}
async function click(name) {
  // Refresh refs after every state change; use the exact accessible button name.
  await browser("snapshot", "-i");
  await browser("find", "role", "button", "click", "--name", name, "--exact");
}
async function snapshot() {
  const data = await browser(
    "eval",
    "JSON.stringify(window.trackingSnapshot())",
  );
  return JSON.parse(data.result);
}
try {
  await browser("open", url);
  await browser(
    "wait",
    "--fn",
    "typeof window.trackingSnapshot === 'function' && window.trackingSnapshot().meta.some(c => c[1] === 'ViewContent') && window.trackingSnapshot().google.some(c => c[1] === 'view_item')",
  );
  const initial = await snapshot();
  assert.equal(initial.meta.filter((c) => c[1] === "PageView").length, 1);
  assert.equal(initial.meta.filter((c) => c[1] === "ViewContent").length, 1);
  assert.equal(initial.google.filter((c) => c[1] === "view_item").length, 1);
  await click("Checkout");
  const checkout = await snapshot();
  assert.equal(checkout.google.filter((c) => c[1] === "begin_checkout").length, 1);
  assert.equal(checkout.meta.filter((c) => c[1] === "InitiateCheckout").length, 1);
  assert.equal(checkout.meta.filter((c) => c[1] === "Purchase").length, 0);

  // Fresh document: test explicit permission overrides independently of the
  // default-policy visit. No application banner or grant call is required above.
  await browser("open", `${url}/permission-overrides`);
  await browser(
    "wait",
    "--fn",
    "typeof window.trackingSnapshot === 'function'",
  );
  assert.deepEqual(await snapshot(), { google: [], meta: [] });
  await click("Checkout");
  assert.deepEqual(await snapshot(), { google: [], meta: [] });
  await click("Allow analytics");
  await browser(
    "wait",
    "--fn",
    "window.trackingSnapshot().google.some(c => c[1] === 'view_item')",
  );
  let state = await snapshot();
  assert.equal(state.google.filter((c) => c[1] === "view_item").length, 1);
  assert.equal(state.meta.length, 0);
  await click("Allow both");
  await browser(
    "wait",
    "--fn",
    "window.trackingSnapshot().meta.some(c => c[1] === 'ViewContent')",
  );
  state = await snapshot();
  assert.equal(state.google.filter((c) => c[1] === "view_item").length, 1);
  assert.equal(state.meta.filter((c) => c[1] === "ViewContent").length, 1);
  await click("Checkout");
  await click("Social");
  state = await snapshot();
  assert.equal(state.google.filter((c) => c[1] === "begin_checkout").length, 1);
  assert.equal(state.meta.filter((c) => c[1] === "InitiateCheckout").length, 1);
  assert.equal(
    state.meta.filter(
      (c) => c[0] === "trackCustom" && c[1] === "social_link_click",
    ).length,
    1,
  );
  assert.equal(
    state.meta.filter((c) => c[1] === "Contact" || c[1] === "Purchase").length,
    0,
  );
  await click("Revoke");
  await click("Checkout");
  state = await snapshot();
  assert.equal(state.google.filter((c) => c[0] === "event").length, 0);
  assert.equal(
    state.meta.filter((c) => c[0] === "track" || c[0] === "trackCustom").length,
    0,
  );
  await click("Allow both");
  await click("New visit");
  state = await snapshot();
  assert.equal(state.google.filter((c) => c[1] === "view_item").length, 1);
  assert.equal(state.meta.filter((c) => c[1] === "ViewContent").length, 1);
  console.log(
    "PASS: no-prompt startup, page/product/checkout events, permission overrides, custom mapping, revocation and repeat visits. External SDK/network delivery intentionally blocked.",
  );
} finally {
  await browser("close").catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}
