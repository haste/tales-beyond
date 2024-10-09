#!/usr/bin/env bun

import path from "node:path";
import Bun, { $ } from "bun";

await $`rm -rf build/*`;
await $`bun run build`;
await $`bun web-ext build -o -s build/chrome`;

const { version } = await Bun.file(
  path.join(process.cwd(), "package.json"),
).json();

const symbioteZip = `web-ext-artifacts/tales-beyond-symbiote-${version}.zip`;

await $`rm -f ${symbioteZip}`;
await $`7z a ${symbioteZip} ./build/symbiote/`;
await $`7z rn ${symbioteZip} symbiote tales-beyond`;