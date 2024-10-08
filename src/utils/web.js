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

// In some cases like Second Wind the dice values are wrapped in elements,
// so our text search fails since we are bound by #text nodes. If we are at
// the end of a #text node and the next element has a .ddbc-snippet__tag
// class, then we absorb that into our dice button.
const processNextElement = (node, match) => {
  const nextOffset = match.index + match[0].length;
  if (match.groups.sign) {
    return [nextOffset, match, null];
  }

  const origDice = diceValueFromMatch(match.groups);
  const nextSibling = node.nextElementSibling;

  const parentTooltip = getParentWithClass(
    node.parentElement,
    "ddbc-tooltip",
    2,
  );
  const parentTooltipSibling = parentTooltip?.nextElementSibling;

  if (
    nextOffset + 3 === node.textContent.length &&
    node.textContent
      .slice(nextOffset, nextOffset + 3)
      .match(/( [-+] | [-+]\d+)/) &&
    nextSibling?.querySelector(".ddbc-snippet__tag")
  ) {
    match.groups.sign = node.textContent.slice(nextOffset + 1, nextOffset + 2);
    match.groups.modifier =
      nextSibling.querySelector(".ddbc-snippet__tag").textContent;

    const linkContent = new DocumentFragment();
    linkContent.appendChild(
      document.createTextNode(`${origDice} ${match.groups.sign}\u00A0`),
    );
    linkContent.appendChild(nextSibling);

    return [nextOffset + 3, match, linkContent];
  }

  if (
    node.textContent.slice(nextOffset).trim().length === 0 &&
    (nextSibling?.textContent.match(/[-+]\d+$/) ||
      (parentTooltipSibling?.classList.contains("ddbc-tooltip") &&
        parentTooltipSibling?.textContent.match(/[-+]\d+$/)))
  ) {
    const modNode = nextSibling || parentTooltipSibling;
    match.groups.sign = modNode.textContent.slice(0, 1);
    match.groups.modifier = modNode.textContent.slice(1);

    const linkContent = new DocumentFragment();
    linkContent.appendChild(document.createTextNode(`${origDice}\u00A0`));
    linkContent.appendChild(modNode);

    return [node.textContent.length, match, linkContent];
  }
  return [nextOffset, match, null];
};

export const embedInText = (node, labelOrCallback) => {
  let offset = 0;
  let fragment;
  const textContent = node.textContent;
  for (let match of textContent.matchAll(diceRegex)) {
    if (offset === 0) {
      fragment = new DocumentFragment();

      if (match.index !== 0) {
        fragment.appendChild(
          document.createTextNode(textContent.slice(offset, match.index)),
        );
      }
    } else {
      fragment.appendChild(
        document.createTextNode(textContent.slice(offset, match.index)),
      );
    }

    // Check if we should merge the next element into this node.
    let nextOffset;
    let linkContent;
    [nextOffset, match, linkContent] = processNextElement(node, match);

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

    if (linkContent) {
      link.replaceChildren(linkContent);
    }
    fragment.appendChild(link);
    offset = nextOffset;
  }

  if (fragment && offset !== textContent.length) {
    fragment.appendChild(
      document.createTextNode(textContent.slice(offset, textContent.length)),
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

  if (node.className.includes(name)) {
    return node;
  }

  if (node.parentElement) {
    return getParentWithClass(node.parentElement, name, --attempts);
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
