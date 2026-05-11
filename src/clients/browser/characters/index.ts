import { characterAppWatcher, sidebarPortalWatcher } from "~/characters";
import { character } from "~/characters/character";

const main = async () => {
  await character.hydrate();

  characterAppWatcher();
  sidebarPortalWatcher();
};

main();
