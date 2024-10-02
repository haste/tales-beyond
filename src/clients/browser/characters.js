import { characterAppWatcher, sidebarPortalWatcher } from "~/characters";

const main = () => {
  characterAppWatcher();
  sidebarPortalWatcher();
};

main();
