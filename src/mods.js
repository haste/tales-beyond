import { getCharacterActionsInCombat, getDiceValue } from "~/utils/dndbeyond";
import { settings } from "~/utils/storage";
import { talespireLink } from "~/utils/talespire";
import { getParentWithClass, getSiblingWithClass } from "~/utils/web";

const always = () => true;
const labelIsHeader = (mod, label) => mod.header === label;

export const mods = [
  {
    id: "modChaosBolt",
    header: "Chaos Bolt",
    description: "Changes the dice to include the missing d6.",
    check: labelIsHeader,
    fn: (label, diceButton) => {
      const level = getParentWithClass(diceButton, "ddbc-combat-attack")
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
    id: "modMagicMissile",
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
    id: "modTollTheDead",
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
    header: "Two-Weapon Fighting",
    description:
      "Adds an extra dice button for making bonus attacks with light weapons" +
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
  if (!getParentWithClass(diceButton, "__damage", 3)) {
    return;
  }

  for (const mod of mods) {
    if (mod.check(mod, label) && settings[mod.id]) {
      return mod.fn(label, diceButton, nameSibling);
    }
  }
};
