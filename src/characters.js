import { namedObserver } from "~/observer";
import { injectThemeStyle } from "~/themes";
import {
  getCharacterAbilities,
  processBlockAbilities,
  processBlockTidbits,
} from "~/utils/dndbeyond";
import { talespireLink } from "~/utils/talespire";
import {
  diceRegex,
  diceValueFromMatch,
  embedInText,
  getParentWithClass,
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
    // See if we can find one unique dice value within the node.
    const matches = [];
    for (const match of node.textContent.matchAll(diceRegex)) {
      matches.push(diceValueFromMatch(match.groups));
    }

    const uniqMatches = [...new Set(matches)];
    if (uniqMatches.length === 1) {
      return uniqMatches[0];
    }

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

const customSpells = {
  "Toll the Dead": (label, diceButton) => {
    diceButton.classList.add("tales-beyond-extension");
    diceButton.parentElement.parentElement.classList.add(
      "tales-beyond-extension-versatile",
    );

    const clonedButton = diceButton.cloneNode(true);
    const damageText = clonedButton.querySelector(".ddbc-damage__value");
    damageText.innerText = damageText.innerText.replace("8", "12");

    const diceValue = getDiceValue(clonedButton);
    const tsLink = talespireLink(clonedButton, `${label} (Damaged)`, diceValue);
    diceButton.parentElement.appendChild(tsLink);
  },

  "Magic Missile": (label, diceButton) => {
    const extraDarts = Number.parseInt(
      getSiblingWithClass(
        diceButton,
        "ddbc-note-components__component--scaled",
        5,
      )?.textContent.slice(8) || "0",
    );

    for (let i = 1; i < 3 + extraDarts + 1; i++) {
      const diceValue = getDiceValue(diceButton).replaceAll(1, i);

      const clonedButton = diceButton.cloneNode(true);
      const damageText = clonedButton.querySelector(".ddbc-damage__value");
      damageText.innerText = diceValue;

      const tsLink = talespireLink(
        clonedButton,
        i > 1 ? `${label} (${i} darts)` : label,
        diceValue,
      );
      diceButton.parentElement.appendChild(tsLink);
    }

    diceButton.style = "display: none;";
    diceButton.classList.add("tales-beyond-extension");
    diceButton.parentElement.parentElement.classList.add(
      "tales-beyond-extension-versatile",
    );

    return true;
  },

  "Melf's Minute Meteors": (label, diceButton) => {
    diceButton.classList.add("tales-beyond-extension");
    diceButton.parentElement.parentElement.classList.add(
      "tales-beyond-extension-versatile",
    );

    const clonedButton = diceButton.cloneNode(true);
    const damageText = clonedButton.querySelector(".ddbc-damage__value");
    damageText.innerText = damageText.innerText.replace("2", "4");

    const diceValue = getDiceValue(clonedButton);
    const tsLink = talespireLink(
      clonedButton,
      `${label} (2 meteors)`,
      diceValue,
    );
    diceButton.parentElement.appendChild(tsLink);
  },

  "Chaos Bolt": (label, diceButton) => {
    const level = getParentWithClass(diceButton, "ddbc-combat-attack")
      ? 1
      : Number.parseInt(
          getSiblingWithClass(
            diceButton,
            "ct-content-group__header-content",
            9,
          )?.textContent.slice(0, -8),
        );

    const damageValue = getSiblingWithClass(
      diceButton,
      "ddbc-damage__value",
      5,
    );
    const diceValue = `${damageValue.innerText}+${level}d6`;

    diceButton.replaceWith(talespireLink(null, label, diceValue, diceValue));

    return true;
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
      if (
        label in customSpells &&
        !getParentWithClass(diceButton, "__tohit", 3) &&
        customSpells[label](label, diceButton)
      ) {
        continue;
      }
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
