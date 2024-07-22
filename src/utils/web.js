import { getCharacterAbilities } from "~/utils/dndbeyond";
import { talespireLink } from "~/utils/talespire";

export const diceValueFromMatch = ({
  dice,
  modifier = "",
  modifierType,
  numDice = 1,
  sign = "",
  soloModifier,
}) => {
  if (soloModifier) {
    return `${numDice}d20${soloModifier}`;
  }

  if (modifierType) {
    modifier = getCharacterAbilities()[modifierType];
  }
  if (+modifier < 0) {
    sign = "";
  }
  return `${numDice}d${dice}${sign}${modifier}`;
};

export const diceRegex =
  /((?<numDice>\d+)?d(?<dice>\d+)(?:\s*(?<sign>[+-])\s*(?:your (?<modifierType>\w+) modifier|(?<modifier>(?!\d+d\d+)\d+)))?|(?:(?<soloModifierType>[A-Z]{3}|\b[A-Z][a-zA-Z]*\b)\s*)?(?<soloModifier>[+-]\d+))/g;

export const getTextNodes = (root) => {
  if (!root) {
    return [];
  }
  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    (node) =>
      node.parentElement.tagName !== "STYLE" &&
      node.textContent.match(diceRegex) &&
      !isParentsProcessed(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
  );
  const textNodes = [];
  while (treeWalker.nextNode()) {
    textNodes.push(treeWalker.currentNode);
  }

  return textNodes;
};

export const embedInText = (node, labelOrCallback) => {
  let offset = 0;
  let fragment;
  for (const match of node.textContent.matchAll(diceRegex)) {
    if (offset === 0) {
      fragment = new DocumentFragment();

      if (match.index !== 0) {
        fragment.appendChild(
          document.createTextNode(node.textContent.slice(offset, match.index)),
        );
      }
    } else {
      fragment.appendChild(
        document.createTextNode(node.textContent.slice(offset, match.index)),
      );
    }

    const dice = diceValueFromMatch(match.groups);
    let label = labelOrCallback;
    if (typeof label === "function") {
      label = label(match, dice);
    }

    const link = talespireLink(
      null,
      label,
      diceValueFromMatch(match.groups),
      match[0],
    );
    link.style = "padding-left: 4px; padding-right: 4px;";

    fragment.appendChild(link);
    offset = match.index + match[0].length;
  }

  if (fragment && offset !== node.textContent.length) {
    fragment.appendChild(
      document.createTextNode(
        node.textContent.slice(offset, node.textContent.length),
      ),
    );
  }

  if (fragment) {
    node.replaceWith(fragment);
  }
};

export const getSiblingWithClass = (node, name, attempts = 5) => {
  if (!node || attempts === 0) {
    return;
  }

  const sibling = node.querySelector(`[class*="${name}"]`);
  if (sibling) {
    return sibling;
  }

  if (node.parentElement) {
    // biome-ignore lint/style/noParameterAssign: it's not here
    return getSiblingWithClass(node.parentElement, name, --attempts);
  }
  return;
};

export const isParentsProcessed = (node, attempts = 4) => {
  if (!node || attempts === 0) {
    return false;
  }

  if (
    node.nodeType === 1 &&
    node.classList.contains("tales-beyond-extension")
  ) {
    return true;
  }

  // biome-ignore lint/style/noParameterAssign: it's not here
  return isParentsProcessed(node.parentElement, --attempts);
};
