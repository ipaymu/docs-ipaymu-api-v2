import { spawnSync } from "node:child_process";
import { cpSync } from "node:fs";
import "./clean-staged.mjs";

const output = process.argv[2] === "export" ? "export" : "standalone";
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  {
    stdio: "inherit",
    env: { ...process.env, NEXT_OUTPUT: output },
  },
);
if (result.status !== 0) process.exit(result.status ?? 1);

if (output === "standalone") {
  // Next's standalone output does not include public assets automatically.
  cpSync("public", ".next/standalone/public", { recursive: true });
  cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
}
