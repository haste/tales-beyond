import { characterAppWatcher, sidebarPortalWatcher } from "~/characters";
import { character } from "~/characters/character";

// Wait until the TS API is ready
const symbioteReady = new Promise<void>((resolve) => {
  if (typeof window.handleSymbioteStateChange === "undefined") {
    window.handleSymbioteStateChange = (event) => {
      if (event.kind === "hasInitialized") {
        resolve();
      }
    };
  }
});

window.addEventListener(
  "load",
  async () => {
    if (!/^\/characters\/\d+\/?$/.test(window.location.pathname)) {
      return;
    }

    await symbioteReady;
    await character.hydrate();

    characterAppWatcher();
    sidebarPortalWatcher();
  },
  false,
);
