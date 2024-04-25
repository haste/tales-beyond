import { watch } from "node:fs";
import { build } from "./build";

watch("src", async (event, filename) => {
  await build();
});
