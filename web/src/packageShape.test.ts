/**
 * One package, two hosts: pi loads the extension entry, PI WEB loads the plugin.
 *
 * The web half used to be a separate package that re-exported this one; it now
 * lives in `web/` here, so a declared path that does not ship is a silent
 * feature loss in either host rather than a load error. The packed manifest is
 * written by `scripts/build-package.mjs`, so both the source manifest and that
 * script are checked.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
	pi?: { extensions?: string[]; skills?: string[]; prompts?: string[] };
	piWeb?: { plugins?: { id: string; browserRoot: string; module: string; serverModule: string }[] };
	scripts?: Record<string, string>;
	devDependencies?: Record<string, string>;
};
const plugin = manifest.piWeb?.plugins?.[0];

describe("one package, both hosts", () => {
	it("keeps the extension entry, and the plugin beside it", () => {
		expect(manifest.pi?.extensions).toEqual(["./index.ts"]);
		expect(plugin?.id).toBe("subagents");
	});

	it("points the plugin at the bundles the web build writes", () => {
		expect(manifest.scripts?.["build:web"]).toBe("node scripts/build-web.mjs");
		const build = readFileSync(join(root, "web", "build.mjs"), "utf8");
		// Built into `web/dist`, copied into the package as `web/`, which is what piWeb names.
		expect(build).toContain(`outfile: "web/dist/${(plugin?.module ?? "").replace(/^web\//, "")}"`);
		expect(build).toContain(`outfile: "web/dist/${(plugin?.serverModule ?? "").replace(/^web\//, "")}"`);
	});

	it("keeps the browser-only toolchain out of the runtime dependencies", () => {
		for (const name of ["lit", "happy-dom", "@gang-of-beads/pi-web-plugin-api"]) {
			expect(Object.keys(manifest.devDependencies ?? {})).toContain(name);
		}
	});

	it("copies the built plugin into the published package", () => {
		const packer = readFileSync(join(root, "scripts", "build-package.mjs"), "utf8");
		expect(packer).toContain("build-web.mjs");
		expect(packer).toContain("publishedPackage.piWeb");
	});
});
