import { getCharacterAbilities, getCharacterSkills } from "~/utils/dndbeyond";
import { talespireLink } from "~/utils/talespire";

const validSoloModifierType = [
  "CHA",
  "Charisma",
  "CON",
  "Constitution",
  "DEX",
  "Dexterity",
  "INT",
  "Intelligence",
  "STR",
  "Strength",
  "WIS",
  "Wisdom",
];

export const diceValueFromMatch = ({
  dice,
  modifier = "",
  modifierType,
  numDice = 1,
  sign = "",
  soloModifier,
}) => {
  if (sign === "−" || sign === "–") {
    sign = "-";
  }

  if (soloModifier) {
    soloModifier = soloModifier.replace(/[−–]/g, "-");
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

export const isValidDice = (match, characterSkills = []) => {
  const soloModifierType = match.groups.soloModifierType;
  if (
    soloModifierType &&
    !(
      validSoloModifierType.includes(soloModifierType) ||
      characterSkills.includes(soloModifierType)
    )
  ) {
    return false;
  }

  return true;
};

const fullDiceRegex =
  /(?<numDice>\d+)?d(?<dice>\d+)(?:\s*(?<sign>[-+−–])\s*(?:your (?<modifierType>\w+) modifier|(?<modifier>(?!\d+d\d+)\d+)))?/;
const soloModifierRegex =
  /(?:(?<soloModifierType>[A-Z]{3}|\b[A-Z][a-zA-Z]*\b)\s*)?(?<soloModifier>[-+−–](?:\d(?!\s*(?:[m\d]|ft))|(?<!\d[-−–])\d\d+(?!\s*(?:m|ft))))/;

export const getDiceRegex = (matchDicelessModifier = true) => {
  return new RegExp(
    [fullDiceRegex, ...(matchDicelessModifier ? [soloModifierRegex] : [])]
      .map((regex) => regex.source)
      .join("|"),
    "g",
  );
};

export const getTextNodes = (root) => {
  if (!root) {
    return [];
  }
  const diceRegex = getDiceRegex();
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

  const parentTooltip = node.parentElement.closest(".ddbc-tooltip");
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

// This is similar to the above. For example Healing Hands (2024) uses the
// characters profiency as dice number.
const processPreviousElement = (node, match, characterSkills) => {
  const previousSibling = node.previousElementSibling;

  if (
    !match.groups.numDice &&
    previousSibling?.classList.contains("ddbc-tooltip") &&
    previousSibling
      ?.querySelector(".ddbc-snippet__tag")
      ?.textContent.match(/^\d+$/)
  ) {
    match.groups.numDice =
      previousSibling.querySelector(".ddbc-snippet__tag").textContent;
    return [previousSibling, match, null];
  }

  if (
    !match.groups.soloModifierType &&
    previousSibling?.classList.contains("skill-tooltip") &&
    characterSkills.includes(previousSibling.textContent)
  ) {
    match.groups.soloModifierType = previousSibling.textContent;
    return [null, match, previousSibling.textContent];
  }
  return [null, match, null];
};

export const embedInText = (node, labelOrCallback, matchDicelessModifier) => {
  let offset = 0;
  let fragment;
  let prependNode;
  let appendLabel;

  const characterSkills = getCharacterSkills();
  const diceRegex = getDiceRegex(matchDicelessModifier);
  const textContent = node.textContent;

  for (let match of textContent.matchAll(diceRegex)) {
    if (!isValidDice(match, characterSkills)) {
      continue;
    }

    if (offset === 0) {
      fragment = new DocumentFragment();

      [prependNode, match, appendLabel] = processPreviousElement(
        node,
        match,
        characterSkills,
      );

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
      // Actions use __heading while Features & Traits use heading
      const heading = getSiblingWithClass(node.parentElement, "_heading", 7);
      if (heading) {
        label = Array.prototype.filter
          .call(heading.childNodes, (node) => node.nodeType === 3)
          .map((node) => node.textContent)
          .join(" ");
      }
    }

    if (label && appendLabel && !label.endsWith(appendLabel)) {
      label = `${label}: ${appendLabel}`;
    }

    const link = talespireLink(null, label, dice, match[0]);
    link.style = "padding-left: 4px; padding-right: 4px;";

    if (linkContent) {
      link.replaceChildren(linkContent);
    }

    if (prependNode) {
      link.prepend(prependNode);
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
