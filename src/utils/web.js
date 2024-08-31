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
  /((?<numDice>\d+)?d(?<dice>\d+)(?:\s*(?<sign>[+-])\s*(?:your (?<modifierType>\w+) modifier|(?<modifier>(?!\d+d\d+)\d+)))?|(?:(?<soloModifierType>[A-Z]{3}|\b[A-Z][a-zA-Z]*\b)\s*)?(?<soloModifier>[+-](?:\d(?![m\d])|\d\d+(?!m))))/g;

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

    // If we have no label, then see if we can fetch one from the heading. This
    // is mainly used for features.
    if (!label) {
      // Only fetch #text nodes directly under the parent. In most (all?) just
      // using node.firstChild.textContent would probably be enough.
      const heading = getSiblingWithClass(node.parentElement, "__heading", 7);
      if (heading) {
        label = Array.prototype.filter
          .call(heading.childNodes, (node) => node.nodeType === 3)
          .map((node) => node.textContent)
          .join(" ");
      }
    }

    const link = talespireLink(null, label, dice, match[0]);
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
    return getSiblingWithClass(node.parentElement, name, --attempts);
  }
  return;
};

export const getParentWithClass = (node, name, attempts = 5) => {
  if (!node || attempts === 0) {
    return;
  }

  if (node.classList.contains(name)) {
    return node;
  }

  if (node.parentElement) {
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

  return isParentsProcessed(node.parentElement, --attempts);
};
