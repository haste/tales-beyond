import { watch } from "node:fs";
import { build } from "./build";

watch("src", { recursive: true }, async (_event, _filename) => {
  await build();
});
