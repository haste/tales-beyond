import { mods } from "~/mods";
import { getOptions } from "~/storage/settings";
import {
  addUIElement,
  BOOLEAN,
  DEACTIVATE_CHARACTER,
  DROPDOWN,
  type OptionEntry,
} from "~/utils/options";

const general: OptionEntry[] = [
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
    header: "Prefix rolls with",
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

const keys: OptionEntry[] = [
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

  const modList = document.querySelector<HTMLElement>("#mod-list");
  const generalList = document.querySelector<HTMLElement>("#general-list");
  const deactivatedList =
    document.querySelector<HTMLElement>("#deactivated-list");
  const keyList = document.querySelector<HTMLElement>("#key-list");
  const modifiers = document.querySelector("#modifiers");
  const footer = document.querySelector<HTMLElement>("footer");
  if (
    !(
      modList &&
      generalList &&
      deactivatedList &&
      keyList &&
      modifiers &&
      footer
    )
  ) {
    throw new Error("options page is missing required elements");
  }

  // Remove the modifier keys section as it isn't something we can support in
  // TaleSpire currently.
  if (typeof TS === "undefined") {
    for (const key of keys) {
      addUIElement(settings, keyList, key);
    }
  } else {
    modifiers.remove();
    footer.dataset.talespire = "";
  }

  for (const mod of mods) {
    addUIElement(settings, modList, mod);
  }

  for (const opt of general) {
    addUIElement(settings, generalList, opt);
  }

  for (const character of settings.deactivatedCharacters) {
    addUIElement(settings, deactivatedList, {
      id: character.id,
      header: `${character.name} (${character.id})`,
      type: DEACTIVATE_CHARACTER,
    });
  }
};

window.addEventListener("load", () => {
  restoreOptions();
});
