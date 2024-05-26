#!/usr/bin/env node

import Bun, { $ } from "bun";

import fs from "node:fs/promises";
import path from "node:path";

const srcDir = path.join(process.cwd(), "src");
const browsers = ["firefox", "chrome"];

const bunBuild = async (config) => {
  const result = await Bun.build(config);
  if (!result.success) {
    throw new AggregateError(result.logs, "Build failed");
  }
};

export const build = async () => {
  const sharedDir = path.join(process.cwd(), "build/shared");

  const { version } = await Bun.file(
    path.join(process.cwd(), "package.json"),
  ).json();
  const sharedManifest = await Bun.file(
    path.join(srcDir, "manifest.shared.json"),
  ).json();

  for (const script of sharedManifest.content_scripts) {
    for (const js of script.js) {
      await bunBuild({
        entrypoints: [path.join(srcDir, js)],
        outdir: sharedDir,
        sourcemap: "inline",
        define: {
          TB_DRY_RUN_TALESPIRE_LINKS: JSON.stringify(
            Bun.env.TB_DRY_RUN_TALESPIRE_LINKS ?? "false",
          ),
        },
      });
    }
  }

  await $`cp -rf ${srcDir}/{icons,{dialog,styles}.css} LICENSE ${sharedDir}`;

  for (const browser of browsers) {
    const buildDir = path.join(process.cwd(), "build", browser);

    // Shared files
    await fs.cp(sharedDir, buildDir, {
      recursive: true,
    });

    const browserManifest = await Bun.file(
      path.join(srcDir, `manifest.${browser}.json`),
    ).json();

    // Manifest
    const manifest = { version, ...sharedManifest, ...browserManifest };
    await Bun.write(
      path.join(buildDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
  }

  console.log("Build complete");
};

await build();
