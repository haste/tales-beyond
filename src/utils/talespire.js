import { settings } from "~/utils/storage";

const modifierAction = (action, name) => {
  switch (action) {
    case "adv":
      return { name: `${name} (ADV)`, extraDice: true };
    case "dis":
      return { name: `${name} (DIS)`, extraDice: true };
    case "adv-dis":
      return { name: `${name} (ADV/DIS)`, extraDice: true };

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

export const talespireLink = (elem, label, dice, diceLabel) => {
  label = label?.trim();

  const link = document.createElement("button");
  link.classList.add("integrated-dice__container");
  link.classList.add("tales-beyond-extension");
  link.dataset.tsLabel = label;
  link.dataset.tsDice = dice;
  link.onclick = (event) => {
    event.stopPropagation();

    dice = dice.replace(/d100/g, "d100+d10");

    const { name, extraDice } = checkModifierKeys(event, label);

    let uri;
    if (typeof name === "string") {
      uri = `talespire://dice/${encodeURIComponent(name)}:${dice}${extraDice ? `/${dice}` : ""}`;
    } else {
      uri = `talespire://dice/${dice}${extraDice ? `/${dice}` : ""}`;
    }

    if (TB_DRY_RUN_TALESPIRE_LINKS === "true") {
      // biome-ignore lint/suspicious/noConsoleLog: Used during dev only
      console.log("TaleSpire Link", { name, dice, extraDice, uri });
    } else {
      window.open(uri, "_self");
    }
  };

  if (diceLabel) {
    link.innerText = diceLabel;
  } else if (elem) {
    link.innerHTML = elem.innerHTML;
  } else {
    link.innerText = dice;
  }

  return link;
};
