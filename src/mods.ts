import { Dice } from "~/dice";
import { parseRoll, Roll, type RollType } from "~/roll";
import type { Settings, SettingsKeyOfType } from "~/storage/settings";
import {
  getCharacterActionsInCombat,
  getRollFromNode,
} from "~/utils/dndbeyond";
import { BOOLEAN } from "~/utils/options";
import { talespireLink } from "~/utils/talespire";
import { getParentWithClass, getSiblingWithClass } from "~/utils/web";

type ModMatch = "always" | "exact" | "includes";

type ModContext = {
  label: string;
  diceButton: HTMLElement;
  nameSibling: HTMLElement | undefined;
  type: RollType | undefined;
};

type ModBase = {
  targets: RollType[];
  header: string;
  description: string;
  match?: ModMatch;
  fn: (args: ModContext) => boolean;
};

type ModBoolean = ModBase & {
  type: typeof BOOLEAN;
  id: SettingsKeyOfType<boolean>;
};

type Mod = ModBoolean;

const matchesLabel = (mod: Mod, label: string): boolean => {
  switch (mod.match) {
    case "always":
      return true;
    case "includes":
      return label.includes(mod.header);
    default:
      return mod.header === label;
  }
};

export const mods: Mod[] = [
  {
    id: "modChaosBolt",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Chaos Bolt",
    description: "Changes the dice to include the missing d6.",
    fn: ({ label, diceButton }) => {
      const levelText = getParentWithClass(diceButton, "ddbc-combat-attack", 4)
        ? undefined
        : getSiblingWithClass(
            diceButton,
            "ct-content-group__header-content",
            9,
          )?.textContent.slice(0, -8);
      const level = Number.parseInt(levelText ?? "1", 10);

      const damageValue = getSiblingWithClass(
        diceButton,
        "ddbc-damage__value",
        5,
      );
      if (!damageValue) {
        return false;
      }

      const roll = parseRoll(damageValue.innerText, "damage");
      if (!roll) {
        return false;
      }

      const diceValue = roll.addDice(new Dice(level, 6));
      diceButton.replaceWith(talespireLink(label, diceValue));

      return true;
    },
  },
  {
    id: "modInfiltratorArmorLightningLauncher",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Infiltrator Armor: Lightning Launcher",
    description:
      "Add an extra dice button for the once per turn 1d6 extra damage.",
    match: "includes",
    fn: ({ label, diceButton }) => {
      const parent = diceButton.parentElement;
      const grandparent = parent?.parentElement;
      const baseDice = getRollFromNode(diceButton, "damage");
      const clonedButton = diceButton.cloneNode(true) as HTMLElement;
      const damageText = clonedButton.querySelector<HTMLElement>(
        ".ddbc-damage__value",
      );
      if (!(grandparent && baseDice && damageText)) {
        return false;
      }

      const diceValue = baseDice.double();
      damageText.innerText = diceValue.toString();

      diceButton.classList.add("tales-beyond-extension");
      grandparent.classList.add("tales-beyond-extension-versatile");

      const tsLink = talespireLink(label, diceValue, clonedButton);
      parent.appendChild(tsLink);

      return false;
    },
  },
  {
    id: "modMagicMissile",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Magic Missile",
    description: "Adds extra dice buttons for multiple darts.",
    fn: ({ label, diceButton }) => {
      const parent = diceButton.parentElement;
      const grandparent = parent?.parentElement;
      const baseDice = getRollFromNode(diceButton, "damage");
      if (!(parent && grandparent && baseDice)) {
        return false;
      }

      const extraDarts = Number.parseInt(
        getSiblingWithClass(
          diceButton,
          "ddbc-note-components__component--scaled",
          5,
        )?.textContent.slice(8) || "0",
        10,
      );

      for (let i = 1; i < 3 + extraDarts + 1; i++) {
        const diceValue = baseDice.scale(i);

        const clonedButton = diceButton.cloneNode(true) as HTMLElement;
        const damageText = clonedButton.querySelector<HTMLElement>(
          ".ddbc-damage__value",
        );
        if (!damageText) {
          continue;
        }
        damageText.innerText = diceValue.toString();

        const tsLink = talespireLink(
          i > 1 ? `${label} (${i} darts)` : label,
          diceValue,
          clonedButton,
        );
        parent.appendChild(tsLink);
      }

      diceButton.style.display = "none";
      diceButton.classList.add("tales-beyond-extension");
      grandparent.classList.add("tales-beyond-extension-versatile");

      return true;
    },
  },
  {
    id: "modMelfsMinuteMeteors",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Melf's Minute Meteors",
    description: "Adds an extra dice button for throwing two meteors.",
    fn: ({ label, diceButton }) => {
      const parent = diceButton.parentElement;
      const grandparent = parent?.parentElement;
      const baseDice = getRollFromNode(diceButton, "damage");
      const clonedButton = diceButton.cloneNode(true) as HTMLElement;
      const damageText = clonedButton.querySelector<HTMLElement>(
        ".ddbc-damage__value",
      );
      if (!(grandparent && baseDice && damageText)) {
        return false;
      }

      const diceValue = baseDice.scale(2);
      damageText.innerText = diceValue.toString();

      diceButton.classList.add("tales-beyond-extension");
      grandparent.classList.add("tales-beyond-extension-versatile");

      const tsLink = talespireLink(
        `${label} (2 meteors)`,
        diceValue,
        clonedButton,
      );
      parent.appendChild(tsLink);

      return false;
    },
  },
  {
    id: "modScorchingRay",
    type: BOOLEAN,
    targets: ["damage", "hit"],
    header: "Scorching Ray",
    description: "Adds extra dice buttons for multiple rays.",
    fn: ({ label, diceButton, type }) => {
      const parent = diceButton.parentElement;
      const grandparent = parent?.parentElement;
      const baseRayDice = getRollFromNode(diceButton, type);
      if (!(grandparent && baseRayDice)) {
        return false;
      }

      const extraRays = Number.parseInt(
        getSiblingWithClass(
          diceButton,
          "ddbc-note-components__component--scaled",
          5,
        )?.textContent.slice(8) || "0",
        10,
      );

      for (let i = 1; i < 3 + extraRays + 1; i++) {
        if (type === "damage") {
          const diceValue = baseRayDice.scale(i);

          const clonedButton = diceButton.cloneNode(true) as HTMLElement;
          const damageText = clonedButton.querySelector<HTMLElement>(
            ".ddbc-damage__value",
          );
          if (!damageText) {
            continue;
          }
          damageText.innerText = diceValue.toString();

          const tsLink = talespireLink(
            i > 1 ? `${label} (${i} rays)` : label,
            diceValue,
            clonedButton,
          );
          parent.appendChild(tsLink);
        }

        if (type === "hit") {
          const diceValue = baseRayDice.repeat(i);
          const clonedButton = diceButton.cloneNode(true) as HTMLElement;

          if (i > 1) {
            const badge = document.createElement("span");
            badge.classList.add("tales-beyond-extension-badge");
            badge.textContent = `${i}×`;
            clonedButton.prepend(badge);
          }

          const tsLink = talespireLink(
            i > 1 ? `${i}×${label}` : label,
            diceValue,
            clonedButton,
          );
          parent.appendChild(tsLink);
        }
      }

      diceButton.style.display = "none";
      diceButton.classList.add("tales-beyond-extension");
      grandparent.classList.add("tales-beyond-extension-versatile");

      return true;
    },
  },
  {
    id: "modSpellfireFlare",
    type: BOOLEAN,
    targets: ["damage", "hit"],
    header: "Spellfire Flare",
    description: "Adds extra dice buttons for multiple blasts.",
    fn: ({ label, diceButton, type }) => {
      const parent = diceButton.parentElement;
      const grandparent = parent?.parentElement;
      if (!grandparent) {
        return false;
      }

      const levelText = getParentWithClass(diceButton, "ddbc-combat-attack", 4)
        ? undefined
        : getSiblingWithClass(
            diceButton,
            "ct-content-group__header-content",
            9,
          )?.textContent.slice(0, -8);
      const level = Number.parseInt(levelText ?? "1", 10);

      if (level <= 1) {
        return false;
      }

      const baseFlareDice = getRollFromNode(diceButton, type);
      if (!baseFlareDice) {
        return false;
      }

      for (let i = 1; i < 1 + level; i++) {
        if (type === "damage") {
          const diceValue = baseFlareDice.scale(i);

          const clonedButton = diceButton.cloneNode(true) as HTMLElement;
          const damageText = clonedButton.querySelector<HTMLElement>(
            ".ddbc-damage__value",
          );
          if (!damageText) {
            continue;
          }
          damageText.innerText = diceValue.toString();

          const tsLink = talespireLink(
            i > 1 ? `${label} (${i} blasts)` : label,
            diceValue,
            clonedButton,
          );
          parent.appendChild(tsLink);
        }

        if (type === "hit") {
          const diceValue = baseFlareDice.repeat(i);
          const clonedButton = diceButton.cloneNode(true) as HTMLElement;

          if (i > 1) {
            const badge = document.createElement("span");
            badge.classList.add("tales-beyond-extension-badge");
            badge.textContent = `${i}×`;
            clonedButton.prepend(badge);
          }

          const tsLink = talespireLink(
            i > 1 ? `${i}×${label}` : label,
            diceValue,
            clonedButton,
          );
          parent.appendChild(tsLink);
        }
      }

      diceButton.style.display = "none";
      diceButton.classList.add("tales-beyond-extension");
      grandparent.classList.add("tales-beyond-extension-versatile");

      return true;
    },
  },
  {
    id: "modTollTheDead",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Toll the Dead",
    description: "Adds an extra dice button for damaged targets.",
    fn: ({ label, diceButton }) => {
      const parent = diceButton.parentElement;
      const grandparent = parent?.parentElement;
      const baseDice = getRollFromNode(diceButton, "damage");
      const clonedButton = diceButton.cloneNode(true) as HTMLElement;
      const damageText = clonedButton.querySelector<HTMLElement>(
        ".ddbc-damage__value",
      );
      if (!(grandparent && baseDice && damageText)) {
        return false;
      }

      const diceValue = new Roll({
        groups: baseDice.groups.map((g) =>
          g.map(
            (d) =>
              new Dice(d.count, 12, {
                modifier: d.modifier,
                damageType: d.damageType,
              }),
          ),
        ),
        type: "damage",
      });

      damageText.innerText = diceValue.toString();

      diceButton.classList.add("tales-beyond-extension");
      grandparent.classList.add("tales-beyond-extension-versatile");

      const tsLink = talespireLink(
        `${label} (Damaged)`,
        diceValue,
        clonedButton,
      );
      parent.appendChild(tsLink);

      return false;
    },
  },
  {
    id: "modTwoWeaponLightOffhand",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Two-Weapon Fighting",
    description:
      "Adds an extra dice button for making bonus attacks with light weapons " +
      "without positive modifier.",
    match: "always",
    fn: ({ label, diceButton, nameSibling }) => {
      const parent = diceButton.parentElement;
      const grandparent = parent?.parentElement;
      if (
        !(
          grandparent &&
          nameSibling?.parentElement &&
          getCharacterActionsInCombat().includes("Two-Weapon Fighting")
        )
      ) {
        return false;
      }

      const isLight = !!Array.prototype.find.call(
        nameSibling.parentElement.querySelectorAll(
          ".ddbc-note-components__component--plain",
        ),
        (el: HTMLElement) => el.textContent === "Light",
      );

      if (!isLight) {
        return false;
      }

      const clonedButton = diceButton.cloneNode(true) as HTMLElement;
      const damageText = clonedButton.querySelector<HTMLElement>(
        ".ddbc-damage__value",
      );
      const damageValue = damageText?.innerText.split("+")[0];
      if (!damageValue) {
        return false;
      }
      damageText.innerText = damageValue;

      const diceValue = getRollFromNode(clonedButton, "damage");
      if (!diceValue) {
        return false;
      }

      diceButton.classList.add("tales-beyond-extension");
      grandparent.classList.add("tales-beyond-extension-versatile");

      const tsLink = talespireLink(
        `${label} (Off-hand)`,
        diceValue,
        clonedButton,
      );
      parent.appendChild(tsLink);

      return false;
    },
  },
];

export const customMod = (
  { label, diceButton, nameSibling, type }: ModContext,
  settings: Settings,
) => {
  for (const mod of mods) {
    if (type && !mod.targets.includes(type)) {
      continue;
    }
    if (matchesLabel(mod, label) && settings[mod.id]) {
      return mod.fn({ label, diceButton, nameSibling, type });
    }
  }
};
