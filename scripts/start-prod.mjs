/**
 * Production server on all interfaces — use after `npm run build`.
 * Prints the phone-friendly URL for LAN testing.
 */
import { spawn } from "child_process";
import fs from "fs";
import net from "net";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT ?? "3000";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules/next/dist/bin/next");
const buildId = path.join(root, ".next/BUILD_ID");

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

if (!fs.existsSync(buildId)) {
  console.error("\n  No production build found. Run: npm run build\n");
  process.exit(1);
}

function portInUse(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => resolve(true));
    probe.once("listening", () => {
      probe.close(() => resolve(false));
    });
    probe.listen(Number(port), "0.0.0.0");
  });
}

const busy = await portInUse(PORT);
if (busy) {
  console.error(`\n  Port ${PORT} is already in use (dev server or a previous prod run).`);
  console.error("  Stop it with Ctrl+C in that terminal, or run:");
  console.error(`    lsof -ti :${PORT} | xargs kill -9\n`);
  console.error("  Or use another port: PORT=3001 npm run start:lan\n");
  process.exit(1);
}

const lan = getLanAddress();
const localUrl = `http://localhost:${PORT}`;

console.log("\n  Triston portfolio — production server\n");
console.log(`  On this Mac:     ${localUrl}`);
if (lan) {
  console.log(`  On your phone:   http://${lan}:${PORT}`);
  console.log("  (same Wi‑Fi — production build, not dev)\n");
} else {
  console.log(`  On your phone:   http://<your-ip>:${PORT}\n`);
}

const child = spawn(
  process.execPath,
  [nextBin, "start", "-H", "0.0.0.0", "-p", PORT],
  { stdio: "inherit", env: process.env, cwd: root }
);

child.on("exit", (code) => process.exit(code ?? 0));
