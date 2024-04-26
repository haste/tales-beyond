import { talespireLink, getTextNodes, embedInText } from "~/utils";

const getDiceValue = (diceButton) => {
  const signedNumber = diceButton.querySelector(".ddbc-signed-number");
  const damageValue = diceButton.querySelector(".ddbc-damage__value");

  if (signedNumber) {
    const sign = signedNumber.querySelector(
      ".ddbc-signed-number__sign",
    ).textContent;
    const numbers = signedNumber.querySelector(
      ".ddbc-signed-number__number",
    ).textContent;

    return `1d20${sign}${numbers}`;
  }

  if (damageValue) {
    return damageValue.textContent;
  }

  return diceButton.textContent;
};

const hijackDiceButtons = (fallbackLabel, parent, replaceHijacked = false) => {
  for (const diceButton of parent.querySelectorAll(
    `.integrated-dice__container${replaceHijacked ? "" : ":not(.hijacked)"}`,
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
    componentsClone.textContent = `, ${componentsClone.textContent} `;
    componentsClone.prepend(span);

    hijackDiceButtons(label, action);
    hijackDiceButtons(`${label} (Damaged)`, actionClone);
  },

  "Magic Missile": (label, action) => {
    let numDarts = 3;
    const firtsComponent = action.querySelector(
      ".ddbc-note-components",
    ).firstChild;
    if (firtsComponent.textContent.includes("Count:")) {
      numDarts += Number.parseInt(firtsComponent.textContent.substring(7));
    }

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
    ".ddbc-combat-attack__damage .integrated-dice__container:not(.hijacked)",
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

const hijackSpells = () => {
  const hasTwoHandedWeaponFighting = !!Array.prototype.find.call(
    document.querySelectorAll(".ct-basic-actions__action"),
    (el) => el.textContent === "Two-Weapon Fighting",
  );
  for (const action of document.querySelectorAll(
    ".ct-spells-spell, .ddbc-combat-attack",
  )) {
    const label = action.querySelector(
      ".ddbc-spell-name, .ddbc-action-name, .ddbc-combat-attack__label",
    ).textContent;
    const isLight = !!Array.prototype.find.call(
      action.querySelectorAll(".ddbc-note-components__component--plain"),
      (el) => el.textContent === "Light",
    );

    if (label in customSpells) {
      customSpells[label](label, action);
    } else if (hasTwoHandedWeaponFighting && isLight) {
      createOffHandButton(`${label} (Off-hand)`, action);
      hijackDiceButtons(label, action);
    } else {
      hijackDiceButtons(label, action);
    }
  }
};

const hijackTabs = () => {
  const callback = (_mutationList, observer) => {
    observer.disconnect();
    hijackSpells();
    observer.observe(document.querySelector(".ct-primary-box"), {
      childList: true,
      subtree: true,
    });
  };

  const observer = new MutationObserver(callback);
  callback([], observer);
  observer.observe(document.querySelector(".ct-primary-box"), {
    childList: true,
    subtree: true,
  });
};

const hijackGeneric = () => {
  const groups = [
    ".ct-skills__item",
    ".ddbc-saving-throws-summary__ability",
    ".ddbc-ability-summary",
    ".ct-combat__summary-group--initiative",
  ];

  const labels = [
    ".ct-skills__col--skill",
    ".ddbc-saving-throws-summary__ability-name",
    ".ddbc-ability-summary__label",
    ".ct-combat__summary-label",
  ];

  for (const action of document.querySelectorAll(groups.join(","))) {
    const elem = action.querySelector(labels.join(","));
    let label = elem.textContent;
    const abbr = elem.querySelector("abbr");
    if (abbr) {
      label = abbr.title;
    }

    if (action.classList.contains("ddbc-saving-throws-summary__ability")) {
      label = `${label} (Saving)`;
    }

    hijackDiceButtons(label, action);
  }

  for (const action of document.querySelectorAll(
    ".ddbc-saving-throws-summary__ability",
  )) {
    const elem = action.querySelector(
      ".ddbc-saving-throws-summary__ability-name",
    );
    let label = elem.textContent;
    const abbr = elem.querySelector("abbr");
    if (abbr) {
      label = abbr.title;
    }

    hijackDiceButtons(`${label} Save`, action);
  }
};

const hijackSidebar = () => {
  const callback = (_mutationList, observer) => {
    const paneContent = document.querySelector(".ct-sidebar__pane-content");
    if (!paneContent) {
      return;
    }

    const headerNode = document.querySelector(".ct-sidebar__heading");
    observer.disconnect();

    for (const node of getTextNodes(paneContent)) {
      embedInText(node, headerNode.textContent);
    }

    observer.observe(document.querySelector(".ct-sidebar__portal"), {
      childList: true,
      subtree: true,
    });
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.querySelector(".ct-sidebar__portal"), {
    childList: true,
    subtree: true,
  });
};

const main = () => {
  const appLoaded = document.querySelector(".ct-character-sheet-desktop");
  if (!appLoaded) {
    window.setTimeout(main, 500);
    return;
  }

  hijackGeneric();
  hijackTabs();
  hijackSidebar();
};

main();
