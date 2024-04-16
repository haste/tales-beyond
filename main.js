const talespire = (elem, label, dice) => {
  const anchor = document.createElement("a");
  anchor.style.border = "1px solid blue";
  anchor.classList.add("integrated-dice__container");
  anchor.classList.add("hijacked");
  anchor.href = `talespire://dice/${label}:${dice}`;
  anchor.onclick = (event) => event.stopPropagation();
  anchor.innerHTML = elem.innerHTML;

  return anchor;
};

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

const hijackDiceButtons = (fallbackLabel, parent) => {
  for (const diceButton of parent.querySelectorAll(
    ".integrated-dice__container:not(.hijacked)",
  )) {
    const label = diceButton.dataset.label || fallbackLabel;
    diceButton.replaceWith(
      talespire(diceButton, label, getDiceValue(diceButton)),
    );
  }
};

const customSpells = {
  "Toll the Dead": (label, action) => {
    const actionClone = action.cloneNode(true);
    action.after(actionClone);

    const damageClone = actionClone.querySelector(".ddbc-damage__value");
    damageClone.innerHTML = damageClone.innerHTML.replace("8", "12");

    const span = document.createElement("span");
    span.className =
      "ddbc-note-components__component ddbc-note-components__component--plain ddbc-note-components__component--scaled";
    span.innerHTML = "Damaged target";

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
      damageClone.innerHTML = damageClone.innerHTML.replace(/1/g, darts);

      hijackDiceButtons(`${label} (${darts} darts)`, actionClone);
    }
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
  damageClone.innerHTML = damageClone.innerHTML.split("+")[0];
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
  const tabHijackers = {
    Actions: hijackSpells,
    Spells: hijackSpells,
  };

  const callback = (_mutationList, observer) => {
    const activeTab = document.querySelector(
      ".ddbc-tab-list__nav-item--is-active",
    ).textContent;
    if (activeTab in tabHijackers) {
      observer.observe(document.querySelector(".ddbc-tab-options__body"), {
        childList: true,
      });
      tabHijackers[activeTab]();
    }
  };

  const observer = new MutationObserver(callback);
  callback([], observer);
  observer.observe(document.querySelector(".ddbc-tab-list__content"), {
    childList: true,
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

const main = () => {
  const appLoaded = document.querySelector(".ct-character-sheet-desktop");
  if (!appLoaded) {
    window.setTimeout(main, 500);
    return;
  }

  hijackGeneric();
  hijackTabs();
};

main();
