import { spawn } from "node:child_process";

const basePath = "/docs-ipaymu-api-v2";

const child = spawn("bun", ["run", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    BASE_PATH: basePath,
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
