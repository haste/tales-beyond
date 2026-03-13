import { abilityNames } from "~/consts";
import { getDiceRegex, parseRoll } from "~/roll";
import { talespireLink } from "~/utils/talespire";
import {
  embedInText,
  getTextNodes,
  rollFromMatchWithAbilities,
} from "~/utils/web";

export const getRollFromNode = (node, type) => {
  const damageValue = node.querySelector(".ddbc-damage__value");
  if (damageValue) {
    return parseRoll(damageValue.textContent, type);
  }

  const numberDisplay = node.querySelector('[class^="styles_numberDisplay"]');
  if (!numberDisplay) {
    // See if we can find one unique dice value within the node.
    const matches = [];
    for (const match of node.textContent.matchAll(getDiceRegex())) {
      matches.push(rollFromMatchWithAbilities(match.groups).toString());
    }

    const uniqMatches = [...new Set(matches)];
    if (uniqMatches.length === 1) {
      return parseRoll(uniqMatches[0], type);
    }

    return;
  }

  const isSigned = numberDisplay.className.includes("styles_signed");
  if (isSigned) {
    const sign = numberDisplay.querySelector(
      '[class^="styles_sign"]',
    ).textContent;
    const number = numberDisplay.lastChild.textContent;
    return parseRoll(`1d20${sign}${number}`, type);
  }
};

// Handles abilities on creatures and vehicles in sidebar, and on monster pages
export const processBlockAbilities = (node, label) => {
  // 2014
  for (const statNode of node.querySelectorAll(
    '[class^="styles_stat__"], .ability-block__stat, .ct-vehicle-block__ability-stat',
  )) {
    const ability =
      abilityNames[
        statNode.querySelector(
          '[class^="styles_statHeading__"], .ability-block__heading, .ct-vehicle-block__ability-heading, .stat-block-ability-scores-stat',
        ).textContent
      ];
    getTextNodes(
      statNode.querySelector(
        '[class^="styles_statModifier"], .ability-block__modifier, .ct-vehicle-block__ability-modifier, .stat-block-ability-scores-modifier',
      ),
    ).map((textNode) => embedInText(textNode, `${label}: ${ability}`));
  }

  // 2024
  for (const statRow of node.querySelectorAll(
    '.mon-stat-block-2024__stats tr, [class^="styles_stats__"] tr, .stats tr',
  )) {
    const [abilityAbr, _value, modifier, saving] = statRow.children;
    const ability = abilityNames[abilityAbr.textContent];

    getTextNodes(modifier).forEach((textNode) => {
      embedInText(textNode, `${label}: ${ability}`);
    });

    getTextNodes(saving).forEach((textNode) => {
      embedInText(textNode, `${label}: ${ability} (Saving)`);
    });
  }
};

export const processBlockAttributes = (node, label) => {
  for (const attributeLabel of node.querySelectorAll(
    '.mon-stat-block-2024__attribute-label, [class^="styles_attributeLabel"]',
  )) {
    if (["Initiative", "HP"].includes(attributeLabel.textContent)) {
      getTextNodes(attributeLabel.nextElementSibling).map((textNode) =>
        embedInText(textNode, `${label}: ${attributeLabel.textContent}`),
      );
    }
  }
};

export const processBlockTidbits = (node, label) => {
  for (const tidbitNode of node.querySelectorAll(
    '[class^="styles_attribute__"], .mon-stat-block__tidbit, .mon-stat-block-2024__tidbit',
  )) {
    const tidbit = tidbitNode.querySelector(
      '[class^="styles_attributeLabel__"], .mon-stat-block__tidbit-label, .mon-stat-block-2024__tidbit-label',
    ).textContent;
    const dataNode = tidbitNode.querySelector(
      "p, .mon-stat-block__tidbit-data, .mon-stat-block-2024__tidbit-data",
    );

    if (tidbit === "Saving Throws") {
      getTextNodes(dataNode).map((textNode) =>
        embedInText(textNode, (match, _dice) => {
          const ability = abilityNames[match.groups.soloModifierType];
          return `${label}: ${ability} (Saving)`;
        }),
      );
    } else if (tidbit === "Skills") {
      getTextNodes(dataNode).forEach((textNode) => {
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

export const processBlockTraitsAction = (node, label) => {
  for (const textNode of getTextNodes(node)) {
    const parentElement = textNode.parentElement;

    // Matches actions in creatures under extras.
    if (parentElement.tagName === "P") {
      let action = parentElement.querySelector("strong");
      if (action) {
        action = action.textContent
          // Get rid of .
          .slice(0, -1)
          // Get rid of text in parentheses
          .replace(/\([^()]*\)/g, "")
          .trim();

        embedInText(textNode, `${label}: ${action}`);
      }
    }
  }
};

export const processBlockDiceNotations = (node, label) => {
  for (const diceNode of node.querySelectorAll("[data-dicenotation]")) {
    const dice = parseRoll(diceNode.dataset.dicenotation);
    const rollAction = diceNode.dataset.rollaction;

    const link = talespireLink(
      `${label}: ${rollAction}`,
      dice,
      diceNode.textContent,
    );
    link.style = "padding-left: 4px; padding-right: 4px;";

    diceNode.replaceWith(link);
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

let previousCharacterName = null;
export const getCharacterName = () => {
  const heading = document.querySelector(".ddbc-character-tidbits__heading h1");
  const name = heading?.textContent?.trim();

  if (name) {
    previousCharacterName = name;
    return name;
  }

  return previousCharacterName;
};

export const getCharacterId = () => {
  const characterMatch = window.location.pathname.match(
    /^\/characters\/(?<characterId>\d+)\/?$/,
  );

  if (!characterMatch) {
    return;
  }

  return characterMatch.groups.characterId;
};
