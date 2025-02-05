import { injectContextMenu } from "~/contextmenu";
import {
  processBlockAbilities,
  processBlockAttributes,
  processBlockTidbits,
} from "~/utils/dndbeyond";
import { namedObserver } from "~/utils/observer";
import { talespireLink } from "~/utils/talespire";
import { embedInText, getTextNodes } from "~/utils/web";

const updateMonsters = (node) => {
  if (!node) {
    return;
  }

  const monsterName = node
    .querySelector(".mon-stat-block__name, .mon-stat-block-2024__name")
    .textContent.trim();

  processBlockAbilities(node, monsterName);
  processBlockAttributes(node, monsterName);
  processBlockTidbits(node, monsterName);

  // Get proper labels on saving throws and skills

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

export const monsterWatcher = () => {
  // Single monster detail page
  updateMonsters(document.querySelector(".detail-content"));

  // Search list
  const callback = async (mutationList, observer) => {
    observer.disconnect();

    await injectContextMenu();

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

  const observer = namedObserver("monsters", callback);
  observer.observe(document.querySelector("section.primary-content"), {
    childList: true,
    subtree: true,
  });
};
