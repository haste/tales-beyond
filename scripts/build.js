#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const browser = process.argv[2];
if (!browser || !["firefox", "chrome"].includes(browser)) {
  console.error(
    `Usage: ${path.relative(process.cwd(), process.argv[1])} [firefox|chrome]`,
  );
  process.exit(1);
}

const buildDir = path.join(process.cwd(), "build", browser);
const srcDir = path.join(process.cwd(), "src");

const sharedManifest = JSON.parse(
  await fs.readFile(path.join(process.cwd(), "src/manifest.shared.json"), {
    encoding: "utf-8",
  }),
);
const browserManifest = JSON.parse(
  await fs.readFile(path.join(process.cwd(), `src/manifest.${browser}.json`), {
    encoding: "utf-8",
  }),
);

const manifest = {...sharedManifest, ...browserManifest};
await fs.rm(buildDir, {force: true, recursive: true});
await fs.mkdir(buildDir);
await fs.cp(srcDir, buildDir, {recursive: true});
await fs.writeFile(
  path.join(buildDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf-8",
);
