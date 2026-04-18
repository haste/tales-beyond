import { injectOptionButton } from "~/characters/iconmenu";
import { injectContextMenu } from "~/contextmenu";
import svgLogo from "~/icons/icon.svg";
import { customMod } from "~/mods";
import type { RollType } from "~/roll";
import { isCharacterDeactivated } from "~/storage/characters";
import { getOptions, type Settings } from "~/storage/settings";
import { injectThemeStyle } from "~/themes";
import {
  getCharacterAbilities,
  getCharacterId,
  getRollFromNode,
  processBlockAbilities,
  processBlockAttributes,
  processBlockTidbits,
  processBlockTraitsAction,
} from "~/utils/dndbeyond";
import { namedObserver } from "~/utils/observer";
import { talespireLink } from "~/utils/talespire";
import {
  embedInText,
  getParentWithClass,
  getSiblingWithClass,
  getTextNodes,
  isParentsProcessed,
} from "~/utils/web";

const handleShortRestDice = (
  label: string | undefined,
  diceButton: HTMLElement,
) => {
  diceButton.style.display = "none";
  const parent = diceButton.parentElement;
  if (!parent) {
    return;
  }

  const roll = getRollFromNode(diceButton);
  if (!roll) {
    return;
  }

  const ourButton = parent.querySelector(".tales-beyond-extension-hit-dice");
  const tsLink = talespireLink(label, roll, diceButton);
  tsLink.classList.add("tales-beyond-extension-hit-dice");

  if (ourButton) {
    ourButton.replaceWith(tsLink);
  } else {
    parent.appendChild(tsLink);
  }
};

const hijackSidebar = () => {
  const sidebarPaneSelector = ".ct-sidebar__portal";
  const callback: MutationCallback = (_mutationList, observer) => {
    const paneContent =
      document.querySelector<HTMLElement>(sidebarPaneSelector);
    const headerNode = document.querySelector(".ct-sidebar__heading");
    if (!(paneContent && headerNode)) {
      return;
    }

    observer.disconnect();

    const label = headerNode.textContent?.trim();
    processBlockAttributes(paneContent, label);
    processBlockAbilities(paneContent, label);
    processBlockTidbits(paneContent, label);
    processBlockTraitsAction(paneContent, label);

    for (const node of getTextNodes(paneContent)) {
      const parentElement = node.parentElement;
      if (!parentElement) {
        continue;
      }

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

    observer.observe(paneContent, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  const observer = namedObserver("sidebar", callback);
  const paneContent = document.querySelector(sidebarPaneSelector);
  if (!paneContent) {
    return;
  }
  observer.observe(paneContent, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

const getDiceType = (diceButton: HTMLElement): RollType | undefined => {
  if (getParentWithClass(diceButton, "__damage", 2)) {
    return "damage";
  }

  if (getParentWithClass(diceButton, "__tohit", 2)) {
    return "hit";
  }
};

const processIntegratedDice = (addedNode: Node, settings: Settings) => {
  // Only process ELEMENT_NODE's
  if (!(addedNode instanceof Element)) {
    return;
  }

  for (const diceButton of addedNode.querySelectorAll<HTMLElement>(
    ".integrated-dice__container:not(.tales-beyond-extension)",
  )) {
    const previousSibling = diceButton.previousElementSibling;
    const parentPreviousSibling =
      diceButton.parentElement?.previousElementSibling;
    const parentNextSibling = diceButton.parentElement?.nextElementSibling;
    const nameSibling = getSiblingWithClass(diceButton, "__name");
    const diceType = getDiceType(diceButton);
    let diceValue = getRollFromNode(diceButton, diceType);

    // Fetch from secondary when "Scores Top" is set for Ability Score/Modifier
    // Display
    if (
      diceButton.parentElement?.className.includes("__primary") &&
      !diceValue
    ) {
      const secondary = getSiblingWithClass(diceButton, "__secondary", 3);
      if (secondary) {
        diceValue = getRollFromNode(secondary, diceType);
      }
    }

    // Ignore cases like Booming Blade where the dice has no default value
    if (!diceValue) {
      continue;
    }

    const attributeHeading = getSiblingWithClass(diceButton, "__heading", 3);
    const skillHeading = getSiblingWithClass(diceButton, "--skill", 3);
    const heading = attributeHeading || skillHeading;
    let label: string | undefined;
    if (
      // Attributes or Skill list
      heading
    ) {
      label =
        (heading.querySelector<HTMLElement>('[class*="__label"]') || heading)
          .textContent ?? undefined;
    } else if (
      // Saving throws
      parentPreviousSibling?.className.includes("ability-name")
    ) {
      const abbr = parentPreviousSibling.querySelector<HTMLElement>("abbr");
      if (abbr) {
        label = `${abbr.title} (Saving)`;
      }
    } else if (
      // Initiative (Mobile)
      parentNextSibling?.className.includes("_labelMobile")
    ) {
      label = parentNextSibling.textContent ?? undefined;
    } else if (
      // Initiative
      previousSibling?.tagName === "H2"
    ) {
      label = previousSibling.textContent ?? undefined;
    } else if (
      // Actions and Spells
      nameSibling
    ) {
      label =
        (
          nameSibling.querySelector<HTMLElement>('[class*="__label"]') ||
          nameSibling
        ).textContent ?? undefined;
      if (
        diceType &&
        label &&
        customMod({ label, diceButton, nameSibling, type: diceType }, settings)
      ) {
        continue;
      }
    }

    diceButton.replaceWith(talespireLink(label, diceValue, diceButton));
  }
};

export const characterAppWatcher = () => {
  const options = {
    childList: true,
    subtree: true,
  };

  let wasDiceDisabled = false;
  const callback: MutationCallback = async (mutationList, observer) => {
    const characterId = getCharacterId();
    if (!characterId) {
      return;
    }

    const isDeactivated = await isCharacterDeactivated(characterId);
    injectOptionButton(isDeactivated);

    if (isDeactivated) {
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

    const settings = await getOptions();

    observer.disconnect();

    for (const mutation of mutationList) {
      // This is a bit of a hack, but things get a bit messy when enabling dice,
      // so it's better to just iterate through all the integrated dice
      // containers in the character app.
      if (wasDiceDisabled) {
        wasDiceDisabled = false;
        const appNode = document.querySelector('[name="character-app"]');
        if (appNode) {
          processIntegratedDice(appNode, settings);
        }
      } else {
        for (const addedNode of mutation.addedNodes) {
          processIntegratedDice(addedNode, settings);
        }
      }

      for (const addedNode of mutation.addedNodes) {
        if (!(addedNode instanceof Element)) {
          continue;
        }

        for (const node of getTextNodes(addedNode)) {
          const parentNode = node.parentElement;
          if (isParentsProcessed(parentNode)) {
            continue;
          }

          embedInText(node, undefined, false);
        }
      }
    }

    const appNode = document.querySelector('[name="character-app"]');
    if (appNode) {
      observer.observe(appNode, options);
    }
  };

  const characterObserver = namedObserver("character", callback);
  const appNode = document.querySelector('[name="character-app"]');
  if (!appNode) {
    return;
  }

  characterObserver.observe(appNode, options);
};

export const sidebarPortalWatcher = () => {
  const callback: MutationCallback = async (mutationList, _observer) => {
    const characterId = getCharacterId();
    if (characterId && (await isCharacterDeactivated(characterId))) {
      return;
    }

    const settings = await getOptions();

    for (const mutation of mutationList) {
      if (mutation.addedNodes.length === 0) {
        continue;
      }

      for (const addedNode of mutation.addedNodes) {
        processIntegratedDice(addedNode, settings);
      }

      for (const addedNode of mutation.addedNodes) {
        if (
          addedNode instanceof Element &&
          addedNode.classList.contains("ct-sidebar__portal")
        ) {
          hijackSidebar();
        }
      }
    }
  };

  const sidebarObserver = namedObserver("sidebar-portal", callback);
  sidebarObserver.observe(document.body, { childList: true });
};

const showEnableDiceDialog = () => {
  if (document.querySelector(".tales-beyond-extension-dialog")) {
    return;
  }

  const dialog = document.createElement("dialog");
  dialog.classList.add("tales-beyond-extension-dialog");
  const closeDialog = (event: Event) => {
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

  const img = dialog.querySelector<HTMLImageElement>(
    ".tales-beyond-extension-dialog img",
  );
  if (img) {
    img.src = svgLogo;
  }

  const button = dialog.querySelector<HTMLElement>(
    ".tales-beyond-extension-dialog button",
  );
  if (button) {
    button.addEventListener("click", () => dialog.close());
    button.addEventListener("touchend", () => dialog.close());
  }

  document.body.appendChild(dialog);
  dialog.showModal();
};
