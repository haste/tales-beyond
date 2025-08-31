import { characterAppWatcher, sidebarPortalWatcher } from "~/characters";
import { getOptions } from "~/utils/storage";

document.addEventListener(
  "readystatechange",
  (event) => {
    if (
      event.target.readyState === "complete" &&
      /^\/characters\/\d+\/?$/.test(window.location.pathname)
    ) {
      getOptions();

      characterAppWatcher();
      sidebarPortalWatcher();
    }
  },
  false,
);

// we don't need to rely on any events here.
if (typeof window.handleSymbioteStateChange === "undefined") {
  window.handleSymbioteStateChange = Function.prototype;
}
