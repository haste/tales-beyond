import {
  injectOptionButton,
  isCharacterDeactivated,
} from "~/characters/iconmenu";
import { injectContextMenu } from "~/contextmenu";
import svgLogo from "~/icons/icon.svg";
import { customMod } from "~/mods";
import { injectThemeStyle } from "~/themes";
import {
  getCharacterAbilities,
  getCharacterId,
  getDiceValue,
  processBlockAbilities,
  processBlockAttributes,
  processBlockTidbits,
  processBlockTraitsAction,
} from "~/utils/dndbeyond";
import { namedObserver } from "~/utils/observer";
import { talespireLink } from "~/utils/talespire";
import {
  embedInText,
  getSiblingWithClass,
  getTextNodes,
  isParentsProcessed,
} from "~/utils/web";

const handleShortRestDice = (label, diceButton) => {
  diceButton.style = "display: none;";
  const ourButton = diceButton.parentElement.querySelector(
    ".tales-beyond-extension-hit-dice",
  );
  const tsLink = talespireLink(diceButton, label, getDiceValue(diceButton));
  tsLink.classList.add("tales-beyond-extension-hit-dice");

  if (ourButton) {
    ourButton.replaceWith(tsLink);
  } else {
    diceButton.parentElement.appendChild(tsLink);
  }
};

const hijackSidebar = () => {
  const sidebarPaneSelector = ".ct-sidebar__portal";
  const callback = (_mutationList, observer) => {
    const paneContent = document.querySelector(sidebarPaneSelector);
    const headerNode = document.querySelector(".ct-sidebar__heading");
    if (!(paneContent && headerNode)) {
      return;
    }

    observer.disconnect();

    const label = headerNode.textContent.trim();
    processBlockAttributes(paneContent, label);
    processBlockAbilities(paneContent, label);
    processBlockTidbits(paneContent, label);
    processBlockTraitsAction(paneContent, label);

    for (const node of getTextNodes(paneContent)) {
      const parentElement = node.parentElement;
      const isShortRestContainer =
        parentElement.parentElement?.classList.contains(
          "ct-reset-pane__hitdie-manager-dice",
        );
      // Match short rest dice
      if (isShortRestContainer) {
        handleShortRestDice(label, parentElement);
        continue;
      }

      // Skip item names
      if (parentElement.className.includes("itemName")) {
        continue;
      }

      embedInText(node, label);
    }

    observer.observe(document.querySelector(sidebarPaneSelector), {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  const observer = namedObserver("sidebar", callback);
  observer.observe(document.querySelector(sidebarPaneSelector), {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

const processIntegratedDice = (addedNode) => {
  // Only process ELEMENT_NODE's
  if (addedNode.nodeType !== 1) {
    return;
  }

  for (const diceButton of addedNode.querySelectorAll(
    ".integrated-dice__container:not(.tales-beyond-extension)",
  )) {
    const previousSibling = diceButton.previousSibling;
    const parentPreviousSibling = diceButton.parentElement?.previousSibling;
    const parentNextSibling = diceButton.parentElement?.nextSibling;
    const nameSibling = getSiblingWithClass(diceButton, "__name");
    let diceValue = getDiceValue(diceButton);

    // Fetch from secondary when "Scores Top" is set for Ability Score/Modifier
    // Display
    if (
      !!diceButton.parentElement.className.includes("__primary") &&
      !diceValue
    ) {
      diceValue = getDiceValue(
        getSiblingWithClass(diceButton, "__secondary", 3),
      );
    }

    // Ignore cases like Booming Blade where the dice has no default value
    if (!diceValue) {
      continue;
    }

    const attributeHeading = getSiblingWithClass(diceButton, "__heading", 3);
    const skillHeading = getSiblingWithClass(diceButton, "--skill", 3);
    let label;
    if (
      // Attributes
      attributeHeading ||
      // Skill list
      skillHeading
    ) {
      const heading = attributeHeading || skillHeading;
      label = (heading.querySelector('[class*="__label"]') || heading)
        .textContent;
    } else if (
      // Saving throws
      parentPreviousSibling?.className.includes("ability-name")
    ) {
      const abbr = parentPreviousSibling.querySelector("abbr");
      label = `${abbr.title} (Saving)`;
    } else if (
      // Initiative (Mobile)
      parentNextSibling?.className?.includes("_labelMobile")
    ) {
      label = parentNextSibling.textContent;
    } else if (
      // Initiative
      previousSibling?.tagName === "H2"
    ) {
      label = previousSibling.textContent;
    } else if (
      // Actions and Spells
      nameSibling
    ) {
      label = (nameSibling.querySelector('[class*="__label"]') || nameSibling)
        .textContent;
      if (customMod(label, diceButton, nameSibling)) {
        continue;
      }
    }

    diceButton.replaceWith(talespireLink(diceButton, label, diceValue));
  }
};

export const characterAppWatcher = () => {
  const options = {
    childList: true,
    subtree: true,
  };

  let wasDiceDisabled;
  const callback = async (mutationList, observer) => {
    const characterId = getCharacterId();
    if (!characterId || (await isCharacterDeactivated(characterId))) {
      return;
    }

    const isDiceEnabled = !!document.querySelector(
      ".ct-character-sheet--dice-enabled",
    );

    if (!isDiceEnabled) {
      if (!wasDiceDisabled) {
        showEnableDiceDialog();
      }

      wasDiceDisabled = true;
      return;
    }

    getCharacterAbilities();
    injectThemeStyle();
    await injectContextMenu();

    observer.disconnect();

    injectOptionButton();

    for (const mutation of mutationList) {
      // This is a bit of a hack, but things get a bit messy when enabling dice,
      // so it's better to just iterate through all the integrated dice
      // containers in the character app.
      if (wasDiceDisabled) {
        wasDiceDisabled = false;
        processIntegratedDice(document.querySelector('[name="character-app"]'));
      } else {
        for (const addedNode of mutation.addedNodes) {
          processIntegratedDice(addedNode);
        }
      }

      for (const addedNode of mutation.addedNodes) {
        for (const node of getTextNodes(addedNode)) {
          const parentNode = node.parentElement;
          if (isParentsProcessed(parentNode)) {
            continue;
          }

          embedInText(node, null, false);
        }
      }
    }

    observer.observe(document.querySelector('[name="character-app"]'), options);
  };

  const characterObserver = namedObserver("character", callback);
  characterObserver.observe(
    document.querySelector('[name="character-app"]'),
    options,
  );
};

export const sidebarPortalWatcher = () => {
  const callback = (mutationList, _observer) => {
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length === 0) {
        continue;
      }

      for (const addedNode of mutation.addedNodes) {
        processIntegratedDice(addedNode);
      }

      for (const addedNode of mutation.addedNodes) {
        if (
          addedNode.nodeType === 1 &&
          addedNode.classList.contains("ct-sidebar__portal")
        ) {
          hijackSidebar();
        }
      }
    }
  };

  const sidebarObserver = namedObserver("sidebar-portal", callback);
  sidebarObserver.observe(document.querySelector("body"), { childList: true });
};

const showEnableDiceDialog = () => {
  if (document.querySelector(".tales-beyond-extension-dialog")) {
    return;
  }

  const dialog = document.createElement("dialog");
  dialog.classList.add("tales-beyond-extension-dialog");
  const closeDialog = (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  };

  dialog.innerHTML = `
<h2>
  <img>
  Tales Beyond
</h2>

<p>
  Digital dice needs to be enabled for this extension to function properly.
</p>

<ul>
  <li>Click <strong>Manage</strong> next to your characters name.</li>
  <li>Go to <strong>Character Settings.</strong></li>
  <li>Enable <strong>Dice Rolling.</strong></li>
</ul>

<button aria-label="Close">
  Close
</button>
  `;

  dialog.addEventListener("click", closeDialog);
  dialog.addEventListener("touchend", closeDialog);

  const img = dialog.querySelector(".tales-beyond-extension-dialog img");
  img.src = svgLogo;

  const button = dialog.querySelector(".tales-beyond-extension-dialog button");
  button.addEventListener("click", () => dialog.close());
  button.addEventListener("touchend", dialog.close());

  document.body.appendChild(dialog);
  dialog.showModal();
};
