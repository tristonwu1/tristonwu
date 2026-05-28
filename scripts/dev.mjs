/**
 * Starts Next.js dev server on all interfaces and prints the phone-friendly URL.
 */
import { spawn } from "child_process";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT ?? "3000";
const nextBin = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../node_modules/next/dist/bin/next"
);

function getLanAddress() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    if (!entries) continue;
    for (const entry of entries) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }
  return null;
}

const lan = getLanAddress();
const localUrl = `http://localhost:${PORT}`;

console.log("\n  Triston portfolio — dev server\n");
console.log(`  On this Mac:     ${localUrl}`);
if (lan) {
  console.log(`  On your phone:   http://${lan}:${PORT}`);
  console.log("  (same Wi‑Fi as this computer)");
  console.log("  If loading hangs on phone, restart dev after config changes.\n");
} else {
  console.log("  On your phone:   connect to the same Wi‑Fi, then use this Mac's IP:");
  console.log(`                   http://<your-ip>:${PORT}\n`);
}

const child = spawn(
  process.execPath,
  [nextBin, "dev", "-H", "0.0.0.0", "-p", PORT],
  { stdio: "inherit", env: process.env }
);

child.on("exit", (code) => process.exit(code ?? 0));
