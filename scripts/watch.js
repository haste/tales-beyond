import { watch } from "node:fs";
import { build } from "./build";

watch("src", async (_event, _filename) => {
  await build();
});
