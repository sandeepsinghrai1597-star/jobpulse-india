import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
export default async function globalSetup() {
  const projectRoot = process.cwd();
  const fixturePath = path.join(projectRoot, "e2e", ".generated", "fixtures.json");

  execFileSync("node", ["scripts/setup-e2e.mjs"], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (!fs.existsSync(fixturePath)) {
    throw new Error(`E2E fixture file was not created: ${fixturePath}`);
  }
}
