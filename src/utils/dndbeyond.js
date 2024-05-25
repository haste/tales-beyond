import { abilityNames } from "~/consts";
import { embedInText, getTextNodes } from "~/utils/web";

// Handles abilities on creatures and vehicles in sidebar, and on monster pages
export const processBlockAbilities = (node, label) => {
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

export const getCharacterAbilities = () => {
  const abilities = Array.from(
    document.querySelectorAll(".ct-quick-info__ability"),
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
  }, {});

  return abilities;
};
