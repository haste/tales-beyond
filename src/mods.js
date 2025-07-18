import { getCharacterActionsInCombat, getDiceValue } from "~/utils/dndbeyond";
import { BOOLEAN } from "~/utils/options";
import { settings } from "~/utils/storage";
import { talespireLink } from "~/utils/talespire";
import { getParentWithClass, getSiblingWithClass } from "~/utils/web";

const always = () => true;
const labelIsHeader = (mod, label) => mod.header === label;

export const mods = [
  {
    id: "modChaosBolt",
    type: BOOLEAN,
    header: "Chaos Bolt",
    description: "Changes the dice to include the missing d6.",
    check: labelIsHeader,
    fn: (label, diceButton) => {
      const level = getParentWithClass(diceButton, "ddbc-combat-attack", 4)
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
  },
  {
    id: "modInfiltratorArmorLightningLauncher",
    type: BOOLEAN,
    header: "Infiltrator Armor: Lightning Launcher",
    description:
      "Add an extra dice button for the once per turn 1d6 extra damage.",
    check: (mod, label) => label.includes(mod.header),
    fn: (label, diceButton) => {
      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      const clonedButton = diceButton.cloneNode(true);
      const damageText = clonedButton.querySelector(".ddbc-damage__value");
      damageText.innerText = damageText.innerText.replace("1d6", "2d6");

      const diceValue = getDiceValue(clonedButton);
      const tsLink = talespireLink(clonedButton, label, diceValue);
      diceButton.parentElement.appendChild(tsLink);
    },
  },
  {
    id: "modMagicMissile",
    type: BOOLEAN,
    header: "Magic Missile",
    description: "Adds extra dice buttons for multiple darts.",
    check: labelIsHeader,
    fn: (label, diceButton) => {
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
  },
  {
    id: "modMelfsMinuteMeteors",
    type: BOOLEAN,
    header: "Melf's Minute Meteors",
    description: "Adds an extra dice button for throwing two meteors.",
    check: labelIsHeader,
    fn: (label, diceButton) => {
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
  },
  {
    id: "modScorchingRay",
    type: BOOLEAN,
    header: "Scorching Ray",
    description: "Adds extra dice buttons for multiple rays.",
    check: labelIsHeader,
    fn: (label, diceButton) => {
      const extraRays = Number.parseInt(
        getSiblingWithClass(
          diceButton,
          "ddbc-note-components__component--scaled",
          5,
        )?.textContent.slice(8) || "0",
      );

      for (let i = 1; i < 3 + extraRays + 1; i++) {
        const diceValue = getDiceValue(diceButton).replace(2, 2 * i);

        const clonedButton = diceButton.cloneNode(true);
        const damageText = clonedButton.querySelector(".ddbc-damage__value");
        damageText.innerText = diceValue;

        const tsLink = talespireLink(
          clonedButton,
          i > 1 ? `${label} (${i} rays)` : label,
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
  },
  {
    id: "modTollTheDead",
    type: BOOLEAN,
    header: "Toll the Dead",
    description: "Adds an extra dice button for damaged targets.",
    check: labelIsHeader,
    fn: (label, diceButton) => {
      diceButton.classList.add("tales-beyond-extension");
      diceButton.parentElement.parentElement.classList.add(
        "tales-beyond-extension-versatile",
      );

      const clonedButton = diceButton.cloneNode(true);
      const damageText = clonedButton.querySelector(".ddbc-damage__value");
      damageText.innerText = damageText.innerText.replace("8", "12");

      const diceValue = getDiceValue(clonedButton);
      const tsLink = talespireLink(
        clonedButton,
        `${label} (Damaged)`,
        diceValue,
      );
      diceButton.parentElement.appendChild(tsLink);
    },
  },
  {
    id: "modTwoWeaponLightOffhand",
    type: BOOLEAN,
    header: "Two-Weapon Fighting",
    description:
      "Adds an extra dice button for making bonus attacks with light weapons " +
      "without positive modifier.",
    check: always,
    fn: (label, diceButton, nameSibling) => {
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

      const diceValue = getDiceValue(clonedButton);
      const tsLink = talespireLink(
        clonedButton,
        `${label} (Off-hand)`,
        diceValue,
      );
      diceButton.parentElement.appendChild(tsLink);
    },
  },
];

export const customMod = (label, diceButton, nameSibling) => {
  if (!getParentWithClass(diceButton, "__damage", 2)) {
    return;
  }

  for (const mod of mods) {
    if (mod.check(mod, label) && settings[mod.id]) {
      return mod.fn(label, diceButton, nameSibling);
    }
  }
};
