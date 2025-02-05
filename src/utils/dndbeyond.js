import { abilityNames } from "~/consts";
import {
  diceValueFromMatch,
  embedInText,
  getDiceRegex,
  getTextNodes,
} from "~/utils/web";

export const getDiceValue = (node) => {
  const damageValue = node.querySelector(".ddbc-damage__value");
  if (damageValue) {
    return damageValue.textContent;
  }

  const numberDisplay = node.querySelector('[class^="styles_numberDisplay"]');
  if (!numberDisplay) {
    // See if we can find one unique dice value within the node.
    const matches = [];
    for (const match of node.textContent.matchAll(getDiceRegex())) {
      matches.push(diceValueFromMatch(match.groups));
    }

    const uniqMatches = [...new Set(matches)];
    if (uniqMatches.length === 1) {
      return uniqMatches[0];
    }

    return;
  }

  const isSigned = numberDisplay.className.includes("styles_signed");
  if (isSigned) {
    const sign = numberDisplay.querySelector(
      '[class^="styles_sign"]',
    ).textContent;
    const number = numberDisplay.lastChild.textContent;
    return `1d20${sign}${number}`;
  }
};

// Handles abilities on creatures and vehicles in sidebar, and on monster pages
export const processBlockAbilities = (node, label) => {
  // 2014
  for (const statNode of node.querySelectorAll(
    ".ddbc-creature-block__ability-stat, .ability-block__stat, .ct-vehicle-block__ability-stat",
  )) {
    const ability =
      abilityNames[
        statNode.querySelector(
          ".ddbc-creature-block__ability-heading, .ability-block__heading, .ct-vehicle-block__ability-heading",
        ).textContent
      ];
    getTextNodes(
      statNode.querySelector(
        ".ddbc-creature-block__ability-modifier, .ability-block__modifier, .ct-vehicle-block__ability-modifier",
      ),
    ).map((textNode) => embedInText(textNode, `${label}: ${ability}`));
  }

  // 2024
  for (const statRow of node.querySelectorAll(
    '.mon-stat-block-2024__stats tr, [class^="styles_stats"] tr',
  )) {
    const [abilityAbr, _value, modifier, saving] = statRow.children;
    const ability = abilityNames[abilityAbr.textContent];

    getTextNodes(modifier).map((textNode) =>
      embedInText(textNode, `${label}: ${ability}`),
    );

    getTextNodes(saving).map((textNode) =>
      embedInText(textNode, `${label}: ${ability} (Saving)`),
    );
  }
};

export const processBlockAttributes = (node, label) => {
  for (const attributeLabel of node.querySelectorAll(
    '.mon-stat-block-2024__attribute-label, [class^="styles_attributeLabel"]',
  )) {
    if (attributeLabel.textContent === "Initiative") {
      getTextNodes(attributeLabel.nextElementSibling).map((textNode) =>
        embedInText(textNode, `${label}: Initiative`),
      );
    }
  }
};

export const processBlockTidbits = (node, label) => {
  for (const tidbitNode of node.querySelectorAll(
    ".ddbc-creature-block__tidbit, .mon-stat-block__tidbit",
  )) {
    const tidbit = tidbitNode.querySelector(
      ".ddbc-creature-block__tidbit-label, .mon-stat-block__tidbit-label",
    ).textContent;
    const dataNode = tidbitNode.querySelector(
      ".ddbc-creature-block__tidbit-data, .mon-stat-block__tidbit-data",
    );

    if (tidbit === "Saving Throws") {
      getTextNodes(dataNode).map((textNode) =>
        embedInText(textNode, (match, _dice) => {
          const ability = abilityNames[match.groups.soloModifierType];
          return `${label}: ${ability} (Saving)`;
        }),
      );
    } else if (tidbit === "Skills") {
      getTextNodes(dataNode).map((textNode) => {
        embedInText(textNode, (match, _dice) => {
          const skill = textNode.previousSibling?.textContent;
          if (skill) {
            return `${label}: ${skill}`;
          }

          if (match.groups.soloModifierType) {
            return `${label}: ${match.groups.soloModifierType}`;
          }

          return label;
        });
      });
    }
  }
};

let previousCharacterAbilities = {};
export const getCharacterAbilities = () => {
  const abilities = Array.from(
    document.querySelectorAll(".ddbc-ability-summary"),
  ).reduce((acc, node) => {
    const stat = node.querySelector(".ddbc-ability-summary__label").textContent;

    let modifier = node.querySelector(
      '[class^="styles_numberDisplay"',
    ).textContent;
    if (+modifier > 0) {
      modifier = modifier.slice(1);
    }

    acc[stat] = modifier;
    return acc;
  }, previousCharacterAbilities);

  previousCharacterAbilities = abilities;

  return abilities;
};

let previousCharacterActionsInCombat = [];
export const getCharacterActionsInCombat = () => {
  const actions = Array.from(
    document.querySelectorAll(".ct-basic-actions__action"),
  ).map((node) => node.textContent);

  if (!actions.length) {
    return previousCharacterActionsInCombat;
  }

  previousCharacterActionsInCombat = actions;

  return actions;
};

// Include defaults to handle extras on mobile without opening the skills
// section
let previousCharacterSkills = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];
export const getCharacterSkills = () => {
  const skills = Array.from(
    document.querySelectorAll(".ct-skills__item .ct-skills__col--skill"),
  ).map((node) => node.textContent);

  if (!skills.length) {
    return previousCharacterSkills;
  }

  previousCharacterSkills = skills;

  return skills;
};
