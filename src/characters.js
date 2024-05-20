import { namedObserver } from "~/observer";
import {
  embedInText,
  getSiblingWithClass,
  getTextNodes,
  isParentsProcessed,
  talespireLink,
} from "~/utils";

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

const handleShortRestDice = (label, textNode, diceButton) => {
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
    if (!paneContent) {
      return;
    }

    const headerNode = document.querySelector(".ct-sidebar__heading");
    observer.disconnect();

    for (const node of getTextNodes(paneContent)) {
      let label = headerNode.textContent;
      const parentElement = node.parentElement;
      const isShortRestContainer =
        parentElement.parentElement?.classList.contains(
          "ct-reset-pane__hitdie-manager-dice",
        );
      // Match short rest dice
      if (isShortRestContainer) {
        handleShortRestDice(label, node, parentElement);
        continue;
      }

      // Matches actions in creatures under extras.
      if (parentElement.tagName === "P") {
        const action = parentElement.querySelector("em > strong");
        if (action) {
          // Remove the punctuation mark
          label = action.textContent.slice(0, -1);
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
    ".integrated-dice__container",
  )) {
    const previousSibling = diceButton.previousSibling;
    const parentPreviousSibling = diceButton.parentElement?.previousSibling;
    const nameSibling = getSiblingWithClass(diceButton, "__name");
    if (
      // Attributes
      parentPreviousSibling?.className.includes("__heading") ||
      // Skill list
      parentPreviousSibling?.className.includes("--skill")
    ) {
      const diceValue = getDiceValue(diceButton);
      if (!diceValue) {
        continue;
      }

      const heading =
        parentPreviousSibling.querySelector('[class*="__label"]') ||
        parentPreviousSibling;

      const ts = talespireLink(diceButton, heading.textContent, diceValue);
      diceButton.replaceWith(ts);
    } else if (
      // Saving throws
      parentPreviousSibling?.className.includes("ability-name")
    ) {
      const abbr = parentPreviousSibling.querySelector("abbr");

      diceButton.replaceWith(
        talespireLink(
          diceButton,
          `${abbr.title} (Saving)`,
          getDiceValue(diceButton),
        ),
      );
    } else if (
      // Initiative
      previousSibling?.tagName === "H2"
    ) {
      diceButton.replaceWith(
        talespireLink(
          diceButton,
          previousSibling.textContent,
          getDiceValue(diceButton),
        ),
      );
    } else if (
      // Actions and Spells
      nameSibling
    ) {
      const diceValue = getDiceValue(diceButton);
      if (!diceValue) {
        continue;
      }

      const heading =
        nameSibling.querySelector('[class*="__label"]') || nameSibling;

      const ts = talespireLink(diceButton, heading.textContent, diceValue);
      diceButton.replaceWith(ts);
    }
  }
};

const characterAppWatcher = () => {
  const callback = (mutationList, observer) => {
    observer.disconnect();

    for (const mutation of mutationList) {
      if (mutation.addedNodes.length === 0) {
        continue;
      }

      for (const addedNode of mutation.addedNodes) {
        processIntegratedDice(addedNode);
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

    observer.observe(document.querySelector('[name="character-app"]'), {
      childList: true,
      subtree: true,
    });
  };

  const characterObserver = namedObserver("character", callback);
  characterObserver.observe(document.querySelector('[name="character-app"]'), {
    childList: true,
    subtree: true,
  });
};

const sidebarPortalWatcher = () => {
  const callback = (mutationList, _observer) => {
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length === 0) {
        continue;
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

const main = () => {
  characterAppWatcher();
  sidebarPortalWatcher();
};

main();
