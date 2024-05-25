import { namedObserver } from "~/observer";
import { embedInText, getTextNodes } from "~/utils/web";
import { processBlockAbilities, processBlockTidbits } from "~/utils/dndbeyond";
import { talespireLink } from "~/utils/talespire";

const updateMonsters = (node) => {
  if (!node) {
    return;
  }

  const monsterName = node
    .querySelector(".mon-stat-block__name")
    .textContent.trim();

  processBlockAbilities(node, monsterName);
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

  const observer = namedObserver("monsters", callback);
  observer.observe(document.querySelector("section.primary-content"), {
    childList: true,
    subtree: true,
  });
};

main();
