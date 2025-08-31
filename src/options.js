import { mods } from "~/mods";
import {
  addUIElement,
  BOOLEAN,
  DEACTIVATE_CHARACTER,
  DROPDOWN,
} from "~/utils/options";
import { getOptions } from "~/utils/storage";

const general = [
  {
    id: "contextMenuEnabled",
    type: BOOLEAN,
    header: "Right-click menu",
    description:
      "Open a menu when right-clicking dice buttons to roll with Advantage, Disadvantage, or as a Critical Hit.",
  },
  {
    id: "prefixWithCharacterName",
    type: DROPDOWN,
    header: "Prefix dice rolls with",
    options: [
      { value: "full", label: "Full character name" },
      { value: "first", label: "First part of character name" },
      { value: "last", label: "Last part of character name" },
      { value: "initials", label: "Initials of character name" },
      { value: "none", label: "Nothing" },
    ],
  },
];

const modifierOptions = [
  { value: "adv", label: "Advantage" },
  { value: "adv-dis", label: "Advantage / Disadvantage" },
  { value: "dis", label: "Disadvantage" },
  { value: "crit", label: "Critical Hit" },
  { value: "none", label: "None" },
];

const keys = [
  {
    id: "modifierKeyShift",
    type: DROPDOWN,
    header: "Shift key",
    options: modifierOptions,
  },
  {
    id: "modifierKeyCtrl",
    type: DROPDOWN,
    header: "Ctrl key",
    options: modifierOptions,
  },
  {
    id: "modifierKeyAlt",
    type: DROPDOWN,
    header: "Alt key",
    options: modifierOptions,
  },
];

const restoreOptions = async () => {
  const settings = await getOptions();

  // Remove the modifier keys section as it isn't something we can support in
  // TaleSpire currently.
  if (typeof TS !== "undefined") {
    document.querySelector("#modifiers").remove();
    document.querySelector("footer").dataset.talespire = "";
  } else {
    const keyList = document.querySelector("#key-list");
    for (const key of keys) {
      addUIElement(settings, keyList, key);
    }
  }

  const modList = document.querySelector("#mod-list");
  for (const mod of mods) {
    addUIElement(settings, modList, mod);
  }

  const generalList = document.querySelector("#general-list");
  for (const opt of general) {
    addUIElement(settings, generalList, opt);
  }

  const deactivatedList = document.querySelector("#deactivated-list");
  for (const character of settings.deactivatedCharacters) {
    addUIElement(settings, deactivatedList, {
      id: character.id,
      header: `${character.name} (${character.id})`,
      type: DEACTIVATE_CHARACTER,
    });
  }
};

document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "complete") {
    restoreOptions();
  }
});
