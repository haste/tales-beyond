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

const updateSpells = (node: HTMLElement | null) => {
  if (!node) {
    return;
  }

  const previousSibling = node.previousElementSibling;
  const titleElement = previousSibling
    ? previousSibling.querySelector<HTMLElement>(".spell-name .name .link")
    : document.querySelector<HTMLElement>(".page-title");
  const spellName = titleElement?.textContent?.trim();

  for (const statNode of node.querySelectorAll<HTMLElement>(
    ".stat-block, .stat-block-finder",
  )) {
    // 5e5: Giant Insect (h4)
    // 5e: Summon Aberration (p.Stat-Block-Styles_Stat-Block-Title)
    const monsterName = statNode
      .querySelector<HTMLElement>("h4, .Stat-Block-Styles_Stat-Block-Title")
      ?.textContent?.trim();

    processBlockAbilities(statNode, monsterName);
    processBlockAttributes(statNode, monsterName);
    processBlockTidbits(statNode, monsterName);
    processBlockTraitsAction(statNode, monsterName);

    // Replace dice notations
    processBlockDiceNotations(statNode, monsterName);
  }

  for (const textNode of getTextNodes(node)) {
    let label = spellName;
    const parentElement = textNode.parentElement;
    // Matches actions in creatures under extras.
    if (parentElement?.tagName === "P") {
      const actionText =
        parentElement.querySelector<HTMLElement>("strong")?.textContent;

      if (actionText) {
        const actionLabel = actionText
          // Get rid of .
          .slice(0, -1)
          // Get rid of text in parentheses
          .replace(/\([^()]*\)/g, "")
          .trim();
        label = spellName ? `${spellName}: ${actionLabel}` : actionLabel;
      }
    }

    embedInText(textNode, label);
  }
};

export const spellWatcher = () => {
  // Single spell detail page
  updateSpells(document.querySelector(".detail-content"));

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
          updateSpells(node);
        }
      }
    }

    observer.observe(root, { childList: true, subtree: true });
  };

  const observer = namedObserver("spells", callback);
  observer.observe(root, { childList: true, subtree: true });
};
