import { rm } from "node:fs/promises";
import * as esbuild from "esbuild";

/**
 * PI WEB loads a plugin's browser module as-is, without an import map, so the browser entry is one
 * self-contained file. The session daemon loads the server entry with Node's own loader and it is
 * bundled the same way, so the published package needs no runtime dependencies for either.
 *
 * Output stays in `web/dist` and `scripts/build-package.mjs` copies it to `web/` of the published
 * package, which is where `piWeb.plugins` points.
 */
await rm("web/dist", { recursive: true, force: true });
const shared = { bundle: true, format: "esm", target: "es2022", legalComments: "eof", logLevel: "info" };
await esbuild.build({ ...shared, banner: { js: "/*! Bundles Lit, BSD-3-Clause: see THIRD_PARTY_NOTICES.md */" }, entryPoints: ["web/src/pi-web-plugin.ts"], outfile: "web/dist/browser/pi-web-plugin.js", platform: "browser" });
await esbuild.build({ ...shared, entryPoints: ["web/src/server-plugin.ts"], outfile: "web/dist/server-plugin.js", platform: "node" });
