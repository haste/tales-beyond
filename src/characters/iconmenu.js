import { computePosition } from "@floating-ui/dom";

import svgLogo from "~/icons/icon.svg";
import { getCharacterId, getCharacterName } from "~/utils/dndbeyond";
import { getOptions, saveOption } from "~/utils/storage";

export const isCharacterDeactivated = async (characterId) => {
  const settings = await getOptions();
  return settings.deactivatedCharacters
    .map(({ id }) => id)
    .includes(characterId);
};

export const injectOptionButton = () => {
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
  <div id="tales-beyond-extension-icon-menu" class="menu" popover>
    <div class="item deactivate-character">Deactivate for this character</div>
    <div class="item options">Show options</div>
  </div>
`;

  const menuNode = menuContainer.querySelector(".menu");

  menuNode
    .querySelector(".item.deactivate-character")
    .addEventListener("click", async () => {
      const settings = await getOptions();
      const characterId = getCharacterId();
      if (!(await isCharacterDeactivated(characterId))) {
        const deactivatedCharacters = settings.deactivatedCharacters;
        deactivatedCharacters.push({
          id: characterId,
          name: getCharacterName(),
        });
        await saveOption("deactivatedCharacters", deactivatedCharacters);
      }

      window.location.reload();
    });

  menuNode
    .querySelector(".item.options")
    .addEventListener("click", async () => {
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
  headerGroup.innerHTML = `
<button popovertarget="tales-beyond-extension-icon-menu" class="${baseClass}__button" role="button">
  <img src="${svgLogo}" title="Tales Beyond Options">
</button>
`;
  menuNode.addEventListener("toggle", (event) => {
    if (event.newState !== "open") {
      return;
    }

    const button = headerGroup.querySelector("button");
    computePosition(button, menuNode, {
      placement: "bottom",
    }).then(({ x, y }) => {
      Object.assign(menuNode.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  });

  headerGroup.addEventListener("click", () => {
    //menuNode.togglePopover({ source: menuNode });
  });

  gapNode.after(headerGroup);

  window.addEventListener("scroll", () => menuNode.hidePopover(), {
    capture: true,
    passive: true,
  });
};
