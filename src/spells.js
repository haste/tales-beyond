import { injectContextMenu } from "~/contextmenu";
import {
  processBlockAbilities,
  processBlockAttributes,
  processBlockTidbits,
  processBlockTraitsAction,
} from "~/utils/dndbeyond";
import { namedObserver } from "~/utils/observer";
import { talespireLink } from "~/utils/talespire";
import { embedInText, getTextNodes } from "~/utils/web";

const updateSpells = (node) => {
  if (!node) {
    return;
  }

  let spellName;
  const previousSibling = node.previousElementSibling;
  if (previousSibling) {
    spellName = previousSibling
      .querySelector(".spell-name .name")
      .textContent.trim();
  } else {
    spellName = document.querySelector(".page-title").textContent.trim();
  }

  for (const statNode of node.querySelectorAll(
    ".stat-block, .stat-block-finder",
  )) {
    const monsterName = statNode
      .querySelector("h4, .Stat-Block-Styles_Stat-Block-Title")
      .textContent.trim();
    processBlockAbilities(statNode, monsterName);
    processBlockAttributes(statNode, monsterName);
    processBlockTidbits(statNode, monsterName);
    processBlockTraitsAction(statNode, monsterName);

    // Replace dice notations
    for (const diceNode of statNode.querySelectorAll("[data-dicenotation]")) {
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
  }

  for (const textNode of getTextNodes(node)) {
    let label = spellName;
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
        label = `${label}: ${action}`;
      }
    }

    embedInText(textNode, label);
  }
};

export const spellWatcher = () => {
  // Single spell detail page
  updateSpells(document.querySelector(".detail-content"));

  // Search list
  const callback = async (mutationList, observer) => {
    observer.disconnect();

    await injectContextMenu();

    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && node.classList.contains("more-info")) {
          updateSpells(node);
        }
      }
    }

    observer.observe(document.querySelector("section.primary-content"), {
      childList: true,
      subtree: true,
    });
  };

  const observer = namedObserver("spells", callback);
  observer.observe(document.querySelector("section.primary-content"), {
    childList: true,
    subtree: true,
  });
};
