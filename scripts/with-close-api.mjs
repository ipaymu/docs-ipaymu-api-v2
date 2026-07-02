// Stages the private Close API route into the Next.js app, runs a Next command
// with the PRIVATE_BUILD flags, then removes the staged route again — even if
// interrupted (Ctrl-C) or on crash.
//
//   node scripts/with-close-api.mjs build   # → out-private/
//   node scripts/with-close-api.mjs dev      # → http://localhost:3000/id/close-api
//
// The Close API route lives in `private/close-api/` and is intentionally NOT part
// of `src/app`, so a normal `next build` (the public site) can never emit it.
// See INTEGRATION-close-api.md.
import { cpSync, rmSync, existsSync, renameSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const mode = process.argv[2] === "dev" ? "dev" : "build";

const SRC = join("private", "close-api");
const DEST = join("src", "app", "[lang]", "close-api");
const NEXT_BIN = join("node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");

function cleanup() {
  if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true });
}

// Safety net: synchronous cleanup on ANY parent exit (normal, error, or
// process.exit). rmSync is sync, so it completes before the process dies.
process.on("exit", cleanup);

// Start from a clean state (handles leftovers from a previously killed run).
cleanup();
cpSync(SRC, DEST, { recursive: true });

const env = {
  ...process.env,
  PRIVATE_BUILD: "1",
  NEXT_PUBLIC_PRIVATE_BUILD: "1",
  // Mermaid (remark-mermaid-dataurl) renders diagrams via headless Chromium.
  // Match the public CI flag so the headless browser launches reliably.
  PUPPETEER_CHROMIUM_FLAGS: process.env.PUPPETEER_CHROMIUM_FLAGS || "--no-sandbox",
};

const child = spawn(NEXT_BIN, [mode], { stdio: "inherit", env });

// Forward termination signals to the child; cleanup runs via the 'exit' hook.
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    if (child.exitCode === null) child.kill(sig);
  });
}

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

child.on("exit", (code) => {
  const exitCode = code ?? 1;

  if (mode === "build" && exitCode === 0) {
    if (existsSync("out-private")) rmSync("out-private", { recursive: true, force: true });
    renameSync("out", "out-private");
    console.log("\n✔ Private build ready in ./out-private");
  }

  process.exit(exitCode);
});
