#!/usr/bin/env bun

import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import Bun from "bun";

const { version } = await Bun.file(
  path.join(process.cwd(), "package.json"),
).json();

const symbioteZipPath = `web-ext-artifacts/tales-beyond-symbiote-${version}.zip`;

try {
  await fs.unlink(symbioteZipPath);
} catch (err) {
  if (err.code !== "ENOENT") {
    throw err;
  }
}

const symbioteZip = new AdmZip();
symbioteZip.addLocalFolder("./build/symbiote", "tales-beyond");

await fs.mkdir("web-ext-artifacts", { recursive: true });

symbioteZip.writeZip(symbioteZipPath);
