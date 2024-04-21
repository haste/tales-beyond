#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const readJSON = async (filePath) =>
  JSON.parse(await fs.readFile(filePath), {
    encoding: "utf-8",
  });

const browser = process.argv[2];
if (!browser || !["firefox", "chrome"].includes(browser)) {
  console.error(
    `Usage: ${path.relative(process.cwd(), process.argv[1])} [firefox|chrome]`,
  );
  process.exit(1);
}

const buildDir = path.join(process.cwd(), "build", browser);
const srcDir = path.join(process.cwd(), "src");

const { version } = await readJSON(path.join(process.cwd(), "package.json"));
const sharedManifest = await readJSON(
  path.join(srcDir, "manifest.shared.json"),
);
const browserManifest = await readJSON(
  path.join(srcDir, `manifest.${browser}.json`),
);

const manifest = { version, ...sharedManifest, ...browserManifest };
await fs.rm(buildDir, { force: true, recursive: true });
await fs.mkdir(buildDir);
await fs.cp(srcDir, buildDir, { recursive: true });
await fs.writeFile(
  path.join(buildDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf-8",
);
