import { getTextNodes, embedInText, talespireLink } from "~/utils";

const abilityNames = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

const updateMonsters = (node) => {
  if (!node) {
    return;
  }

  const monsterName = node
    .querySelector(".mon-stat-block__name")
    .textContent.trim();

  // Get proper labels on stats
  for (const statNode of node.querySelectorAll(".ability-block__stat")) {
    const ability =
      abilityNames[
        statNode.querySelector(".ability-block__heading").textContent
      ];
    getTextNodes(statNode.querySelector(".ability-block__modifier")).map(
      (textNode) => embedInText(textNode, `${monsterName}: ${ability}`),
    );
  }

  // Get proper labels on saving throws and skills
  for (const tidbitNode of node.querySelectorAll(".mon-stat-block__tidbit")) {
    const label = tidbitNode.querySelector(
      ".mon-stat-block__tidbit-label",
    ).textContent;
    const dataNode = tidbitNode.querySelector(".mon-stat-block__tidbit-data");

    if (label === "Saving Throws") {
      getTextNodes(dataNode).map((textNode) =>
        embedInText(textNode, (match, _dice) => {
          const ability = abilityNames[match.groups.soloModifierType.trim()];
          return `${monsterName}: ${ability} (Saving)`;
        }),
      );
    } else if (label === "Skills") {
      getTextNodes(dataNode).map((textNode) => {
        const skill = textNode.previousSibling.textContent;
        embedInText(textNode, `${monsterName}: ${skill}`);
      });
    }
  }

  // Replace dice notations
  for (const diceNode of node.querySelectorAll("[data-dicenotation]")) {
    const dice = diceNode.dataset.dicenotation;
    const label = diceNode.dataset.rollaction;

    const link = talespireLink(
      null,
      `${monsterName}: ${label}`,
      dice,
      diceNode.textContent,
    );
    link.style = "padding-left: 4px; padding-right: 4px;";

    diceNode.replaceWith(link);
  }

  // Match anything we missed
  for (const textNode of getTextNodes(node)) {
    embedInText(textNode, monsterName);
  }
};

const main = () => {
  // Single monster detail page
  updateMonsters(document.querySelector(".detail-content"));

  // Search list
  const callback = (mutationList, observer) => {
    observer.disconnect();
    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && node.classList.contains("more-info")) {
          updateMonsters(node);
        }
      }
    }
    observer.observe(document.querySelector("section.primary-content"), {
      childList: true,
      subtree: true,
    });
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.querySelector("section.primary-content"), {
    childList: true,
    subtree: true,
  });
};

main();
