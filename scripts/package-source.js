#!/usr/bin/env bun

import path from "node:path";
import AdmZip from "adm-zip";
import Bun from "bun";

const { version } = await Bun.file(
  path.join(process.cwd(), "package.json"),
).json();

const sourceZip = new AdmZip();

[
  "biome.json",
  "bunfig.toml",
  "bun.lock",
  "CHANGELOG.md",
  "tsconfig.json",
  "jsdom.js",
  "LICENSE",
  "package.json",
  "README.md",
].forEach((file) => {
  sourceZip.addLocalFile(`./${file}`);
});

["docs", "scripts", "src"].forEach((folder) => {
  sourceZip.addLocalFolder(`./${folder}`, folder);
});

sourceZip.writeZip(`tales-beyond-source-${version}.zip`);
