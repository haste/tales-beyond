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

const symbioteZip = `web-ext-artifacts/tales-beyond-symbiote-${version}.zip`;

try {
  await fs.unlink(symbioteZip);
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const zip = new AdmZip();
zip.addLocalFolder("./build/symbiote", "tales-beyond");

await fs.mkdir("web-ext-artifacts", { recursive: true });

zip.writeZip(symbioteZip);
