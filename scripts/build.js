#!/usr/bin/env bun

import Bun, { $ } from "bun";

import fs from "node:fs/promises";
import path from "node:path";

const srcDir = path.join(process.cwd(), "src");
const browserSrcDir = path.join(process.cwd(), "src/clients/browser");
const symbioteSrcDir = path.join(process.cwd(), "src/clients/symbiote");
const browsers = ["firefox", "chrome"];

const inlineSVG = {
  name: "inline-SVG",
  setup(build) {
    build.onLoad({ filter: /\.(svg)$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      const contents = `data:image/svg+xml;base64,${btoa(text)}`;

      return {
        contents,
        loader: "text",
      };
    });
  },
};

const bunBuild = async (config) => {
  const result = await Bun.build({
    plugins: [inlineSVG],
    sourcemap: "inline",
    define: {
      TB_DRY_RUN_TALESPIRE_LINKS: JSON.stringify(
        Bun.env.TB_DRY_RUN_TALESPIRE_LINKS ?? "false",
      ),
    },
    ...config,
  });
  if (!result.success) {
    throw new AggregateError(result.logs, "Build failed");
  }

  // Prevent our code from polluting window.
  if (config.wrap) {
    for (const ba of result.outputs) {
      if (ba.loader === "jsx") {
        const file = Bun.file(ba.path);
        const data = await file.bytes();
        const writer = file.writer();
        writer.write("(() => {");
        writer.write(data);
        writer.write("})()");
        writer.end();
      }
    }
  }
};

const buildBrowser = async () => {
  const sharedDir = path.join(process.cwd(), "build/shared-browser");

  const { version } = await Bun.file(
    path.join(process.cwd(), "package.json"),
  ).json();
  const sharedManifest = await Bun.file(
    path.join(browserSrcDir, "manifest.shared.json"),
  ).json();

  for (const script of sharedManifest.content_scripts) {
    for (const js of script.js) {
      await bunBuild({
        entrypoints: [path.join(browserSrcDir, js)],
        outdir: sharedDir,
      });
    }
  }

  for (const js of ["options.js"]) {
    await bunBuild({
      entrypoints: [path.join(srcDir, js)],
      outdir: sharedDir,
    });
  }

  await $`cp -rf ${browserSrcDir}/background.js ${sharedDir}`;
  await $`cp -rf ${srcDir}/{icons,css,options.html} LICENSE README.md CHANGELOG.md ${sharedDir}`;

  for (const browser of browsers) {
    const buildDir = path.join(process.cwd(), "build", browser);

    // Shared files
    await fs.cp(sharedDir, buildDir, {
      recursive: true,
    });

    const browserManifest = await Bun.file(
      path.join(browserSrcDir, `manifest.${browser}.json`),
    ).json();

    // Manifest
    const manifest = { version, ...sharedManifest, ...browserManifest };
    await Bun.write(
      path.join(buildDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
  }
};

const buildSymbiote = async () => {
  const buildDir = path.join(process.cwd(), "build/symbiote");

  const { version } = await Bun.file(
    path.join(process.cwd(), "package.json"),
  ).json();
  const manifestBase = await Bun.file(
    path.join(symbioteSrcDir, "manifest.json"),
  ).json();

  for (const entry of manifestBase.environment.extras) {
    if (entry.endsWith(".js")) {
      await bunBuild({
        entrypoints: [path.join(symbioteSrcDir, entry)],
        outdir: buildDir,
        wrap: true,
      });
    }
  }

  for (const js of ["index.js"]) {
    await bunBuild({
      entrypoints: [path.join(symbioteSrcDir, js)],
      outdir: buildDir,
      wrap: true,
    });
  }

  for (const js of ["options.js"]) {
    await bunBuild({
      entrypoints: [path.join(srcDir, js)],
      outdir: buildDir,
      wrap: true,
    });
  }

  await $`cp -rf ${symbioteSrcDir}/index.html ${buildDir}`;
  await $`cp -rf ${srcDir}/{icons,css,options.html} LICENSE README.md CHANGELOG.md ${buildDir}`;

  // Manifest
  const manifest = { version, ...manifestBase };
  await Bun.write(
    path.join(buildDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
};

export const build = async () => {
  await buildBrowser();
  await buildSymbiote();
  console.log("Build complete");
};

await build();
