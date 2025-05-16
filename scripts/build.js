#!/usr/bin/env bun

import Bun, { $, Glob } from "bun";

import fs from "node:fs/promises";
import path from "node:path";
import * as sass from "sass";

const nodeModulesDir = path.join(process.cwd(), "node_modules");
const srcDir = path.join(process.cwd(), "src");
const sharedDir = path.join(process.cwd(), "build/shared");
const browserSrcDir = path.join(srcDir, "clients/browser");
const symbioteSrcDir = path.join(srcDir, "clients/symbiote");
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

const buildShared = async () => {
  await fs.mkdir(sharedDir, { recursive: true });
  await fs.cp(path.join(srcDir, "icons"), path.join(sharedDir, "icons"), { recursive: true });
  await fs.copyFile(path.join(srcDir, "options.html"), path.join(sharedDir, "options.html"));
  await fs.copyFile("LICENSE", path.join(sharedDir, "LICENSE"));
  await fs.copyFile("README.md", path.join(sharedDir, "README.md"));
  await fs.copyFile("CHANGELOG.md", path.join(sharedDir, "CHANGELOG.md"));
};

const buildBrowser = async () => {
  const sharedBrowserDir = path.join(process.cwd(), "build/shared-browser");

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
        outdir: sharedBrowserDir,
      });
    }
  }

  for (const js of ["options.js"]) {
    await bunBuild({
      entrypoints: [path.join(srcDir, js)],
      outdir: sharedBrowserDir,
    });
  }

  await fs.copyFile(path.join(browserSrcDir, "background.js"), path.join(sharedBrowserDir, "background.js"));

  for (const browser of browsers) {
    const buildDir = path.join(process.cwd(), "build", browser);

    // Shared files
    await fs.cp(sharedDir, buildDir, {
      recursive: true,
    });
    await fs.cp(sharedBrowserDir, buildDir, {
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

  // Shared files
  await fs.cp(sharedDir, buildDir, {
    recursive: true,
  });

  await fs.copyFile(path.join(symbioteSrcDir, "index.html"), path.join(buildDir, "index.html"));

  // Manifest
  const manifest = { version, ...manifestBase };
  await Bun.write(
    path.join(buildDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
};

const buildSCSS = async () => {
  const scssFiles = path.join(srcDir, "scss/*.scss");
  const cssPath = path.join(sharedDir, "css");

  const glob = new Glob(scssFiles);
  for await (const file of glob.scan(".")) {
    const result = sass.compile(file, {
      style: "compressed",
      sourceMap: true,
      sourceMapIncludeSources: true,
      loadPaths: [nodeModulesDir],
      // https://github.com/twbs/bootstrap/issues/29853
      silenceDeprecations: ["import"],
      quietDeps: true,
    });

    await Bun.write(
      path.format({
        ...path.parse(path.join(cssPath, path.basename(file))),
        base: "",
        ext: ".css",
      }),
      result.css,
    );
  }
};

export const build = async () => {
  await buildSCSS();
  await buildShared();
  await buildBrowser();
  await buildSymbiote();
  console.log("Build complete");
};

await build();
