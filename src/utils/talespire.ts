import { character } from "~/characters/character";
import { Dice } from "~/dice";
import { Roll } from "~/roll";
import type { SettingModifierAction, Settings } from "~/storage/settings";
import { getOptions } from "~/storage/settings";

const modifierAction = (
  action: SettingModifierAction,
  name: string | undefined,
) => {
  switch (action) {
    case "adv":
      return { name: `${name} (ADV)`, repeat: 2, crit: false };
    case "dis":
      return { name: `${name} (DIS)`, repeat: 2, crit: false };
    case "adv-dis":
      return { name: `${name} (ADV/DIS)`, repeat: 2, crit: false };
    case "ea":
      return { name: `${name} (EA)`, repeat: 3, crit: false };
    case "crit":
      return { name: `${name} (CRIT)`, repeat: 1, crit: true };

    default:
      return { name, repeat: 1, crit: false };
  }
};

const checkModifierKeys = (
  event: MouseEvent,
  name: string | undefined,
  settings: Settings,
) => {
  let action: SettingModifierAction = "none";
  if (event.altKey) {
    action = settings.modifierKeyAlt;
  } else if (event.ctrlKey) {
    action = settings.modifierKeyCtrl;
  } else if (event.shiftKey) {
    action = settings.modifierKeyShift;
  }

  return modifierAction(action, name);
};

const formatCharacterName = (settings: Settings) => {
  const name = character.getName();
  if (typeof name !== "string") {
    return null;
  }

  switch (settings.prefixWithCharacterName) {
    case "initials":
      return (name.replace(/[^\p{L}\p{N}\s]/gu, "").match(/(^\S|\s\S)?/g) ?? [])
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

const prefixWithCharacterName = (
  label: string | undefined,
  settings: Settings,
) => {
  const name =
    settings.prefixWithCharacterName === "none"
      ? null
      : formatCharacterName(settings);

  if (typeof label === "string" && typeof name === "string") {
    return `${name}: ${label}`;
  }

  return name || label;
};

const expandD100 = (roll: Roll) =>
  new Roll({
    groups: roll.groups.map((group) =>
      group.flatMap((d) =>
        d.sides === 100 ? [d, new Dice(d.count, 10)] : [d],
      ),
    ),
  });

export const triggerTalespire = async (
  label: string | undefined,
  roll: Roll,
) => {
  const settings = await getOptions();
  const expanded = expandD100(roll);
  const diceUri = expanded.toString();
  label = prefixWithCharacterName(label, settings);

  const uri =
    typeof label === "string"
      ? `talespire://dice/${encodeURIComponent(label)}:${diceUri}`
      : `talespire://dice/${diceUri}`;

  if (TB_DRY_RUN_TALESPIRE_LINKS === "true") {
    // biome-ignore lint/suspicious/noConsole: debugging output
    console.log("TaleSpire Link", { name: label, dice: diceUri, uri });
  } else if (typeof TS !== "undefined" && TS.dice) {
    const rollDescriptors = expanded.groups.map((group, i) => ({
      name: i === 0 ? (label ?? "") : "",
      roll: group.map((d) => d.toString()).join("+"),
    }));
    TS.dice.putDiceInTray(rollDescriptors);
  } else {
    window.open(uri, "_self");
  }
};

export const talespireLink = (
  label: string | undefined,
  roll: Roll,
  content?: HTMLElement | string | null | undefined,
) => {
  label = label?.trim();
  const diceStr = roll.toString();
  const link = document.createElement("button");
  link.classList.add("integrated-dice__container");
  link.classList.add("tales-beyond-extension");
  link.dataset.tsLabel = label;
  link.dataset.tsDice = diceStr;
  if (roll.type) {
    link.dataset.tsType = roll.type;
  }
  link.addEventListener("click", async (event: MouseEvent) => {
    event.stopPropagation();

    const settings = await getOptions();
    const { name, repeat, crit } = checkModifierKeys(event, label, settings);
    const modified = crit ? roll.double() : roll;
    await triggerTalespire(
      name,
      repeat > 1 ? modified.repeat(repeat) : modified,
    );
  });

  if (typeof content === "string") {
    link.innerText = content;
  } else if (content) {
    link.innerHTML = content.innerHTML;
  } else {
    link.innerText = diceStr;
  }

  return link;
};
