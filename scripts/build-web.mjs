// Builds the PI WEB half into web/dist. Called by scripts/build-package.mjs, which copies it into
// the packed package; run it directly for a local build.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
execFileSync(process.execPath, [path.join(root, "web", "build.mjs")], { cwd: root, stdio: "inherit" });
