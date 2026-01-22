import { computePosition } from "@floating-ui/dom";

import svgLogo from "~/icons/icon.svg";
import { getCharacterId, getCharacterName } from "~/utils/dndbeyond";
import {
  deactivateCharacter,
  getOptions,
  reactivateCharacter,
} from "~/utils/storage";

export const injectOptionButton = (isDeactivated = false) => {
  const charApp = document.querySelector('[name="character-app"]');
  if (!charApp || document.querySelector(".tales-beyond-extension-icon")) {
    return;
  }

  const gapNode = charApp.querySelector('[class*="--gap"]');
  if (!gapNode) {
    return;
  }

  const menuContainer = document.createElement("div");
  menuContainer.classList.add("tales-beyond-extension-icon-menu");
  menuContainer.innerHTML = `
  <div id="tales-beyond-extension-icon-menu" class="menu">
    <div class="item toggle-character"></div>
    <div class="item options">Show options</div>
  </div>
`;

  const menuNode = menuContainer.querySelector(".menu");
  const toggleItem = menuNode.querySelector(".item.toggle-character");
  toggleItem.textContent = isDeactivated
    ? "Reactivate for this character"
    : "Deactivate for this character";

  menuNode.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    menuNode.classList.remove("open");
  });

  toggleItem.addEventListener("click", async () => {
    menuNode.classList.remove("open");

    if (isDeactivated) {
      await reactivateCharacter(getCharacterId());
    } else {
      await deactivateCharacter(getCharacterId(), getCharacterName());
    }

    window.location.reload();
  });

  menuNode
    .querySelector(".item.options")
    .addEventListener("click", async () => {
      menuNode.classList.remove("open");

      const settings = await getOptions();
      if (settings?.symbioteURL) {
        window.location.href = `${settings.symbioteURL}/options.html`;
      } else {
        chrome.runtime.sendMessage({ action: "openOptionsPage" });
      }
    });

  document.body.appendChild(menuContainer);

  const baseClass = gapNode.className.substring(
    0,
    gapNode.className.indexOf("__"),
  );

  const headerGroup = document.createElement("div");
  headerGroup.className = gapNode.className.substring(
    0,
    gapNode.className.lastIndexOf(" "),
  );
  headerGroup.classList.add("tales-beyond-extension-icon");
  headerGroup.title = isDeactivated
    ? "Tales Beyond (Deactivated)"
    : "Tales Beyond";
  headerGroup.innerHTML = `
<button class="${baseClass}__button" role="button">
  <img src="${svgLogo}">
</button>
`;

  if (isDeactivated) {
    headerGroup.classList.add("deactivated");
  }

  const button = headerGroup.querySelector("button");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menuNode.classList.toggle("open");
    if (isOpen) {
      computePosition(button, menuNode, {
        placement: "bottom",
      }).then(({ x, y }) => {
        Object.assign(menuNode.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    }
  });

  gapNode.after(headerGroup);

  window.addEventListener("scroll", () => menuNode.classList.remove("open"), {
    capture: true,
    passive: true,
  });
};
