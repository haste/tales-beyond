#!/usr/bin/env bun

// Creates chrome and symbiote zips

import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import Bun, { $ } from "bun";

await $`bun web-ext build -o -s build/chrome`;

const { version } = await Bun.file(
  path.join(process.cwd(), "package.json"),
).json();

const symbioteZipPath = `web-ext-artifacts/tales-beyond-symbiote-${version}.zip`;

try {
  await fs.unlink(symbioteZipPath);
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const symbioteZip = new AdmZip();
symbioteZip.addLocalFolder("./build/symbiote", "tales-beyond");

await fs.mkdir("web-ext-artifacts", { recursive: true });

symbioteZip.writeZip(symbioteZipPath);

// Build source zip for AMO

const sourceZip = new AdmZip();

[
  "biome.json",
  "bunfig.toml",
  "bun.lock",
  "CHANGELOG.md",
  "jsconfig.json",
  "jsdom.js",
  "LICENSE",
  "package.json",
  "README.md",
].forEach((file) => {
  sourceZip.addLocalFile(`./${file}`, file);
});

["docs", "scripts", "src"].forEach((folder) => {
  sourceZip.addLocalFolder(`./${folder}`, folder);
});

sourceZip.writeZip(`tales-beyond-source-${version}.zip`);
