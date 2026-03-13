import { Dice } from "~/dice";
import { parseRoll, Roll } from "~/roll";
import {
  getCharacterActionsInCombat,
  getRollFromNode,
} from "~/utils/dndbeyond";
import { BOOLEAN } from "~/utils/options";
import { talespireLink } from "~/utils/talespire";
import { getParentWithClass, getSiblingWithClass } from "~/utils/web";

const always = () => true;
const labelIsHeader = ({ mod, label }) => mod.header === label;

export const mods = [
  {
    id: "modChaosBolt",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Chaos Bolt",
    description: "Changes the dice to include the missing d6.",
    check: labelIsHeader,
    fn: ({ label, diceButton }) => {
      const level = getParentWithClass(diceButton, "ddbc-combat-attack", 4)
        ? 1
        : Number.parseInt(
            getSiblingWithClass(
              diceButton,
              "ct-content-group__header-content",
              9,
            )?.textContent.slice(0, -8),
            10,
          );

      const damageValue = getSiblingWithClass(
        diceButton,
        "ddbc-damage__value",
        5,
      );
      const diceValue = parseRoll(damageValue.innerText).addDice(
        new Dice(level, 6),
      );

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
    check: ({ mod, label }) => label.includes(mod.header),
    fn: ({ label, diceButton }) => {
      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      const baseDice = getRollFromNode(diceButton);
      const diceValue = baseDice.double();

      const clonedButton = diceButton.cloneNode(true);
      const damageText = clonedButton.querySelector(".ddbc-damage__value");
      damageText.innerText = diceValue.toString();

      const tsLink = talespireLink(label, diceValue, clonedButton);
      diceButton.parentElement.appendChild(tsLink);
    },
  },
  {
    id: "modMagicMissile",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Magic Missile",
    description: "Adds extra dice buttons for multiple darts.",
    check: labelIsHeader,
    fn: ({ label, diceButton }) => {
      const extraDarts = Number.parseInt(
        getSiblingWithClass(
          diceButton,
          "ddbc-note-components__component--scaled",
          5,
        )?.textContent.slice(8) || "0",
        10,
      );

      const baseDice = getRollFromNode(diceButton);
      for (let i = 1; i < 3 + extraDarts + 1; i++) {
        const diceValue = baseDice.scale(i);

        const clonedButton = diceButton.cloneNode(true);
        const damageText = clonedButton.querySelector(".ddbc-damage__value");
        damageText.innerText = diceValue.toString();

        const tsLink = talespireLink(
          i > 1 ? `${label} (${i} darts)` : label,
          diceValue,
          clonedButton,
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
  },
  {
    id: "modMelfsMinuteMeteors",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Melf's Minute Meteors",
    description: "Adds an extra dice button for throwing two meteors.",
    check: labelIsHeader,
    fn: ({ label, diceButton }) => {
      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      const baseDice = getRollFromNode(diceButton);
      const diceValue = baseDice.scale(2);

      const clonedButton = diceButton.cloneNode(true);
      const damageText = clonedButton.querySelector(".ddbc-damage__value");
      damageText.innerText = diceValue.toString();

      const tsLink = talespireLink(
        `${label} (2 meteors)`,
        diceValue,
        clonedButton,
      );
      diceButton.parentElement.appendChild(tsLink);
    },
  },
  {
    id: "modScorchingRay",
    type: BOOLEAN,
    targets: ["damage", "hit"],
    header: "Scorching Ray",
    description: "Adds extra dice buttons for multiple rays.",
    check: labelIsHeader,
    fn: ({ label, diceButton, type }) => {
      const extraRays = Number.parseInt(
        getSiblingWithClass(
          diceButton,
          "ddbc-note-components__component--scaled",
          5,
        )?.textContent.slice(8) || "0",
        10,
      );

      const baseRayDice = getRollFromNode(diceButton);
      for (let i = 1; i < 3 + extraRays + 1; i++) {
        if (type === "damage") {
          const diceValue = baseRayDice.scale(i);

          const clonedButton = diceButton.cloneNode(true);
          const damageText = clonedButton.querySelector(".ddbc-damage__value");
          damageText.innerText = diceValue.toString();

          const tsLink = talespireLink(
            i > 1 ? `${label} (${i} rays)` : label,
            diceValue,
            clonedButton,
          );
          diceButton.parentElement.appendChild(tsLink);
        }

        if (type === "hit") {
          const diceValue = baseRayDice.repeat(i);
          const clonedButton = diceButton.cloneNode(true);

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
          diceButton.parentElement.appendChild(tsLink);
        }
      }

      diceButton.style = "display: none;";
      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      return true;
    },
  },
  {
    id: "modSpellfireFlare",
    type: BOOLEAN,
    targets: ["damage", "hit"],
    header: "Spellfire Flare",
    description: "Adds extra dice buttons for multiple blasts.",
    check: labelIsHeader,
    fn: ({ label, diceButton, type }) => {
      const level = getParentWithClass(diceButton, "ddbc-combat-attack", 4)
        ? 1
        : Number.parseInt(
            getSiblingWithClass(
              diceButton,
              "ct-content-group__header-content",
              9,
            )?.textContent.slice(0, -8),
            10,
          );

      if (level <= 1) {
        return false;
      }

      const baseFlareDice = getRollFromNode(diceButton);
      for (let i = 1; i < 1 + level; i++) {
        if (type === "damage") {
          const diceValue = baseFlareDice.scale(i);

          const clonedButton = diceButton.cloneNode(true);
          const damageText = clonedButton.querySelector(".ddbc-damage__value");
          damageText.innerText = diceValue.toString();

          const tsLink = talespireLink(
            i > 1 ? `${label} (${i} blasts)` : label,
            diceValue,
            clonedButton,
          );
          diceButton.parentElement.appendChild(tsLink);
        }

        if (type === "hit") {
          const diceValue = baseFlareDice.repeat(i);
          const clonedButton = diceButton.cloneNode(true);

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
          diceButton.parentElement.appendChild(tsLink);
        }
      }

      diceButton.style = "display: none;";
      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      return true;
    },
  },
  {
    id: "modTollTheDead",
    type: BOOLEAN,
    targets: ["damage"],
    header: "Toll the Dead",
    description: "Adds an extra dice button for damaged targets.",
    check: labelIsHeader,
    fn: ({ label, diceButton }) => {
      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      const baseDice = getRollFromNode(diceButton);
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
      });

      const clonedButton = diceButton.cloneNode(true);
      const damageText = clonedButton.querySelector(".ddbc-damage__value");
      damageText.innerText = diceValue.toString();

      const tsLink = talespireLink(
        `${label} (Damaged)`,
        diceValue,
        clonedButton,
      );
      diceButton.parentElement.appendChild(tsLink);
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
    check: always,
    fn: ({ label, diceButton, nameSibling }) => {
      if (
        !(
          nameSibling &&
          getCharacterActionsInCombat().includes("Two-Weapon Fighting")
        )
      ) {
        return;
      }

      const isLight = !!Array.prototype.find.call(
        nameSibling.parentElement.querySelectorAll(
          ".ddbc-note-components__component--plain",
        ),
        (el) => el.textContent === "Light",
      );

      if (!isLight) {
        return;
      }

      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      const clonedButton = diceButton.cloneNode(true);
      const damageText = clonedButton.querySelector(".ddbc-damage__value");
      damageText.innerText = damageText.innerText.split("+")[0];

      const diceValue = getRollFromNode(clonedButton);
      const tsLink = talespireLink(
        `${label} (Off-hand)`,
        diceValue,
        clonedButton,
      );
      diceButton.parentElement.appendChild(tsLink);
    },
  },
];

export const customMod = (
  { label, diceButton, nameSibling, type },
  settings,
) => {
  for (const mod of mods) {
    if (!mod.targets.includes(type)) {
      continue;
    }
    if (mod.check({ mod, label, type }) && settings[mod.id]) {
      return mod.fn({ label, diceButton, nameSibling, type });
    }
  }
};
