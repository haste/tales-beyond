import { characterAppWatcher, sidebarPortalWatcher } from "~/characters";
import { getOptions } from "~/storage/settings";

window.addEventListener(
  "load",
  () => {
    if (/^\/characters\/\d+\/?$/.test(window.location.pathname)) {
      getOptions();

      characterAppWatcher();
      sidebarPortalWatcher();
    }
  },
  false,
);

// we don't need to rely on any events here.
if (typeof window.handleSymbioteStateChange === "undefined") {
  window.handleSymbioteStateChange = () => {
    // noop
  };
}
