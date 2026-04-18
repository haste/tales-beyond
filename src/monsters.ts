import { injectContextMenu } from "~/contextmenu";
import {
  processBlockAbilities,
  processBlockAttributes,
  processBlockDiceNotations,
  processBlockTidbits,
  processBlockTraitsAction,
} from "~/utils/dndbeyond";
import { namedObserver } from "~/utils/observer";
import { embedInText, getTextNodes } from "~/utils/web";

const updateMonsters = (node: HTMLElement | null) => {
  if (!node) {
    return;
  }

  const monsterName = node
    .querySelector<HTMLElement>(
      ".mon-stat-block__name, .mon-stat-block-2024__name",
    )
    ?.textContent?.trim();

  if (!monsterName) {
    return;
  }

  // Replace dice notations
  processBlockDiceNotations(node, monsterName);

  // Get proper labels on abilities, saving throws, skills, traits and actions
  processBlockAbilities(node, monsterName);
  processBlockAttributes(node, monsterName);
  processBlockTidbits(node, monsterName);
  processBlockTraitsAction(node, monsterName);

  // Match anything we missed
  for (const textNode of getTextNodes(node)) {
    embedInText(textNode, monsterName);
  }
};

export const monsterWatcher = () => {
  // Single monster detail page
  updateMonsters(document.querySelector<HTMLElement>(".detail-content"));

  const root = document.querySelector<HTMLElement>("section.primary-content");
  if (!root) {
    return;
  }

  // Search list
  const callback: MutationCallback = async (mutationList, observer) => {
    observer.disconnect();

    await injectContextMenu();

    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (
          node instanceof HTMLElement &&
          node.classList.contains("more-info")
        ) {
          updateMonsters(node);
        }
      }
    }

    observer.observe(root, { childList: true, subtree: true });
  };

  const observer = namedObserver("monsters", callback);
  observer.observe(root, { childList: true, subtree: true });
};
