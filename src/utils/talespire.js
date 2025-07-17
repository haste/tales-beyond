import { doubleDiceExpression } from "~/utils/diceUtils";
import { getCharacterName } from "~/utils/dndbeyond";
import { settings } from "~/utils/storage";

const modifierAction = (action, name) => {
  switch (action) {
    case "adv":
      return { name: `${name} (ADV)`, extraDice: true };
    case "dis":
      return { name: `${name} (DIS)`, extraDice: true };
    case "adv-dis":
      return { name: `${name} (ADV/DIS)`, extraDice: true };
    case "crit":
      return { name: `${name} (CRIT)`, extraDice: false };

    default:
      return { name, extraDice: false };
  }
};

const checkModifierKeys = (event, name) => {
  let action = "none";
  if (event.altKey) {
    action = settings.modifierKeyAlt;
  } else if (event.ctrlKey) {
    action = settings.modifierKeyCtrl;
  } else if (event.shiftKey) {
    action = settings.modifierKeyShift;
  }

  if (action === "none") {
    return { name, extraDice: false };
  }

  return modifierAction(action, name);
};

const formatCharacterName = () => {
  const name = getCharacterName();
  if (typeof name !== "string") {
    return null;
  }

  switch (settings.prefixWithCharacterName) {
    case "initials":
      return name
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .match(/(^\S|\s\S)?/g)
        .map((v) => v.trim())
        .join("")
        .toLocaleUpperCase();
    case "first":
      return name.split(/\s/)[0];
    case "last":
      return name.split(/\s/).pop() || "";
    case "full":
      return name;
    default:
      return null;
  }
};

const prefixWithCharacterName = (label) => {
  const name =
    settings.prefixWithCharacterName !== "none" ? formatCharacterName() : null;

  if (typeof label === "string" && typeof name === "string") {
    return `${name}: ${label}`;
  }

  return name || label;
};

export const triggerTalespire = (label, dice, extraDice) => {
  label = prefixWithCharacterName(label);

  let uri;
  if (typeof label === "string") {
    uri = `talespire://dice/${encodeURIComponent(label)}:${dice}${extraDice ? `/${dice}` : ""}`;
  } else {
    uri = `talespire://dice/${dice}${extraDice ? `/${dice}` : ""}`;
  }

  if (TB_DRY_RUN_TALESPIRE_LINKS === "true") {
    console.log("TaleSpire Link", { name: label, dice, extraDice, uri });
  } else if (typeof TS !== "undefined" && TS.dice) {
    const rollDescriptors = [{ name: label ?? "", roll: dice }];
    if (extraDice) {
      rollDescriptors.push({ name: "", roll: dice });
    }
    TS.dice.putDiceInTray(rollDescriptors);
  } else {
    window.open(uri, "_self");
  }
};

export const talespireLink = (elem, label, dice, diceLabel) => {
  label = label?.trim();
  dice = dice.replace(/d100/g, "d100+d10").replace(/[−–]/g, "-");
  diceLabel = diceLabel?.replace(/[−–]/g, "-");

  const link = document.createElement("button");
  link.classList.add("integrated-dice__container");
  link.classList.add("tales-beyond-extension");
  link.dataset.tsLabel = label;
  link.dataset.tsDice = dice;
  link.addEventListener("click", (event) => {
    event.stopPropagation();

    const { name, extraDice } = checkModifierKeys(event, label);

    if (name?.includes("CRIT")) {
      dice = doubleDiceExpression(dice);
    }

    triggerTalespire(name, dice, extraDice);
  });

  if (diceLabel) {
    link.innerText = diceLabel;
  } else if (elem) {
    link.innerHTML = elem.innerHTML;
  } else {
    link.innerText = dice;
  }

  return link;
};
