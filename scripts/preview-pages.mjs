import { cp, rm, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";

const basePath = "docs-ipaymu-api-v2";
const previewRoot = ".local-pages";
const previewPath = join(previewRoot, basePath);

async function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited with signal ${signal}`));
        return;
      }

      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

await run("bun", ["./scripts/build-pages.mjs"]);

await rm(previewPath, { recursive: true, force: true });
await mkdir(previewPath, { recursive: true });
await cp("out", previewPath, { recursive: true });

console.log(`\nServing GitHub Pages preview at /${basePath}/\n`);
await run("serve", [previewRoot]);
