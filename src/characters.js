import { namedObserver } from "~/observer";
import { injectThemeStyle } from "~/themes";
import {
  getCharacterAbilities,
  processBlockAbilities,
  processBlockTidbits,
} from "~/utils/dndbeyond";
import { talespireLink } from "~/utils/talespire";
import {
  embedInText,
  getSiblingWithClass,
  getTextNodes,
  isParentsProcessed,
} from "~/utils/web";

const getDiceValue = (node) => {
  const damageValue = node.querySelector(".ddbc-damage__value");
  if (damageValue) {
    return damageValue.textContent;
  }

  const numberDisplay = node.querySelector('[class^="styles_numberDisplay"]');
  if (!numberDisplay) {
    return;
  }

  const isSigned = numberDisplay.className.includes("styles_signed");
  if (isSigned) {
    const sign = numberDisplay.querySelector(
      '[class^="styles_sign"]',
    ).textContent;
    const number = numberDisplay.lastChild.textContent;
    return `1d20${sign}${number}`;
  }
};

const hijackDiceButtons = (fallbackLabel, parent, replaceHijacked = false) => {
  for (const diceButton of parent.querySelectorAll(
    `.integrated-dice__container${
      replaceHijacked ? "" : ":not(.tales-beyond-extension)"
    }`,
  )) {
    const label = diceButton.dataset.label || fallbackLabel;
    diceButton.replaceWith(
      talespireLink(diceButton, label, getDiceValue(diceButton)),
    );
  }
};

const customSpells = {
  "Toll the Dead": (label, action) => {
    const actionClone = action.cloneNode(true);
    action.after(actionClone);

    const damageClone = actionClone.querySelector(".ddbc-damage__value");
    damageClone.innerText = damageClone.innerText.replace("8", "12");

    const span = document.createElement("span");
    span.className =
      "ddbc-note-components__component \
      ddbc-note-components__component--plain  \
      ddbc-note-components__component--scaled";
    span.innerText = "Damaged target";

    const componentsClone = actionClone.querySelector(".ddbc-note-components");
    if (componentsClone) {
      componentsClone.textContent = `, ${componentsClone.textContent} `;
      componentsClone.prepend(span);
    }

    hijackDiceButtons(label, action);
    hijackDiceButtons(`${label} (Damaged)`, actionClone);
  },

  "Magic Missile": (label, action) => {
    const level = action.classList.contains("ddbc-combat-attack")
      ? 1
      : Number.parseInt(
          // TODO: This should really just look for .ct-content-group instead
          action.parentNode.parentNode.parentNode.parentNode
            .querySelector(".ct-content-group__header-content")
            .textContent.slice(0, -8),
        );

    const numDarts = 2 + level;

    hijackDiceButtons(label, action);

    for (let i = 1; i < numDarts; i++) {
      const darts = numDarts - i + 1;
      const actionClone = action.cloneNode(true);
      action.after(actionClone);

      const labelClone = actionClone.querySelector(".ddbc-spell-name");
      labelClone.textContent = `${label} (${darts} darts)`;

      const damageClone = actionClone.querySelector(".ddbc-damage__value");
      damageClone.innerText = damageClone.innerText.replace(/1/g, darts);

      hijackDiceButtons(`${label} (${darts} darts)`, actionClone, true);
    }
  },

  "Chaos Bolt": (label, action) => {
    const level = action.classList.contains("ddbc-combat-attack")
      ? 1
      : Number.parseInt(
          // TODO: This should really just look for .ct-content-group instead
          action.parentNode.parentNode.parentNode.parentNode
            .querySelector(".ct-content-group__header-content")
            .textContent.slice(0, -8),
        );

    const damageValue = action.querySelector(".ddbc-damage__value");
    damageValue.innerText = `${damageValue.innerText}+${level}d6`;

    const damageIcon = action.querySelector(".ddbc-damage__icon");
    if (damageIcon) {
      damageIcon.remove();
    }

    hijackDiceButtons(label, action);
  },
};

const createOffHandButton = (label, action) => {
  // Set dice button as versatile
  const damageContainer = action.querySelector(
    ".ddbc-combat-item-attack__damage",
  );
  // They have a typo here (ddb vs ddbc), so just hardcode it:
  //const damageClass = damageContainer.classList[0];
  //damageContainer.classList.add(`${damageClass}--is-versatile`);
  damageContainer.classList.add("ddb-combat-item-attack__damage--is-versatile");

  const diceContainer = action.querySelector(
    ".ddbc-combat-attack__damage .integrated-dice__container:not(.tales-beyond-extension)",
  );

  if (!diceContainer) {
    return;
  }

  const diceContainerClone = diceContainer.cloneNode(true);
  diceContainerClone.dataset.label = label;
  diceContainer.after(diceContainerClone);

  const damageClone = diceContainerClone.querySelector(".ddbc-damage__value");
  damageClone.innerText = damageClone.innerText.split("+")[0];
};

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

    processBlockAbilities(paneContent, headerNode.textContent);
    processBlockTidbits(paneContent, headerNode.textContent);

    for (const node of getTextNodes(paneContent)) {
      let label = headerNode.textContent;
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

      // Matches actions in creatures under extras.
      if (parentElement.tagName === "P") {
        let action = parentElement.querySelector("strong");
        if (action) {
          action = action.textContent
            // Get rid of .
            .slice(0, -1)
            // Get rid of text in parentheses
            .replace(/\([^()]*\)/g, "")
            .trim();
          // Remove the punctuation mark
          label = `${label}: ${action}`;
        }
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
    const nameSibling = getSiblingWithClass(diceButton, "__name");
    const diceValue = getDiceValue(diceButton);

    // Ignore cases like Booming Blade where the dice has no default value
    if (!diceValue) {
      continue;
    }

    let label;
    if (
      // Attributes
      parentPreviousSibling?.className.includes("__heading") ||
      // Skill list
      parentPreviousSibling?.className.includes("--skill")
    ) {
      label = (
        parentPreviousSibling.querySelector('[class*="__label"]') ||
        parentPreviousSibling
      ).textContent;
    } else if (
      // Saving throws
      parentPreviousSibling?.className.includes("ability-name")
    ) {
      const abbr = parentPreviousSibling.querySelector("abbr");
      label = `${abbr.title} (Saving)`;
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
    }

    diceButton.replaceWith(talespireLink(diceButton, label, diceValue));
  }
};

const characterAppWatcher = () => {
  const options = {
    childList: true,
    subtree: true,
  };

  let wasDiceDisabled;
  const callback = (mutationList, observer) => {
    const isCharacterSelected = /^\/characters\/\d+\/?$/.test(
      window.location.pathname,
    );
    if (!isCharacterSelected) {
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

    observer.disconnect();

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

          embedInText(node);
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

const sidebarPortalWatcher = () => {
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
  img.src = chrome.runtime.getURL("icons/icon.svg");

  const button = dialog.querySelector(".tales-beyond-extension-dialog button");
  button.addEventListener("click", () => dialog.close());
  button.addEventListener("touchend", dialog.close());

  document.body.appendChild(dialog);
  dialog.showModal();
};

const main = () => {
  characterAppWatcher();
  sidebarPortalWatcher();
};

main();
