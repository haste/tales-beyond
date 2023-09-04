const talespire = (elem, label, dice) => {
  const anchor = document.createElement("a");
  anchor.style.border = "1px solid blue";
  anchor.classList.add("integrated-dice__container");
  anchor.href = `talespire://dice/${label}:${dice}`;
  anchor.onclick = (event) => event.stopPropagation();
  anchor.innerHTML = elem.innerHTML;

  return anchor;
};

const onClick = (target) => (event) => {
  event.stopPropagation();
  talespire(target);
};

const hijackDiceButtons = (label, parent, overrideDice = null) => {
  for (const diceButton of parent.querySelectorAll(
    ".integrated-dice__container"
  )) {
    const signedNumber = diceButton.querySelector(".ddbc-signed-number");
    const damageValue = diceButton.querySelector(".ddbc-damage__value");

    if (overrideDice) {
      diceButton.replaceWith(talespire(diceButton, label, overrideDice));
    } else if (signedNumber) {
      const sign = signedNumber.querySelector(
        ".ddbc-signed-number__sign"
      ).textContent;
      const numbers = signedNumber.querySelector(
        ".ddbc-signed-number__number"
      ).textContent;
      diceButton.replaceWith(
        talespire(diceButton, label, `1d20${sign}${numbers}`)
      );
    } else if (damageValue) {
      diceButton.replaceWith(
        talespire(diceButton, label, damageValue.textContent)
      );
    } else {
      diceButton.replaceWith(
        talespire(diceButton, label, diceButton.textContent)
      );
    }
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
      ".ddbc-note-components"
    ).firstChild;
    if (firtsComponent.textContent.includes("Count:")) {
      numDarts += parseInt(firtsComponent.textContent.substring(7));
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

const hijackSpells = () => {
  for (const action of document.querySelectorAll(
    ".ct-spells-spell, .ddbc-combat-attack"
  )) {
    const label = action.querySelector(
      ".ct-spells-spell__label, .ddbc-spell-name, .ddbc-action-name, .ddbc-combat-attack__name"
    ).textContent;

    if (label in customSpells) {
      customSpells[label](label, action);
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

  const callback = (_mutationList, _observer) => {
    const activeTab = document.querySelector(
      ".ddbc-tab-list__nav-item--is-active"
    ).textContent;
    if (activeTab in tabHijackers) {
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
    ".ddbc-saving-throws-summary__ability"
  )) {
    const elem = action.querySelector(
      ".ddbc-saving-throws-summary__ability-name"
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
