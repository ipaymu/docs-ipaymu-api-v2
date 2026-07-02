// Removes any leftover staged Close API route from `src/app`.
// Runs before the public build so an interrupted `build:private`/`dev:private`
// (Ctrl-C, crash) can never break or leak into the public build.
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const DEST = join("src", "app", "[lang]", "close-api");

if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true, force: true });
  console.log("Removed a leftover staged Close API route from src/app.");
}
