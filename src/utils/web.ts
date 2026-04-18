import {
  type DiceMatch,
  type DiceMatchGroups,
  diceFromMatch,
  normalizeMinus,
} from "~/dice";
import { getDiceRegex, Roll } from "~/roll";
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

export const rollFromMatchWithAbilities = (groups: DiceMatchGroups) => {
  const resolvedModifier = groups.modifierType
    ? getCharacterAbilities()[groups.modifierType]
    : undefined;

  if (resolvedModifier) {
    const mod = Number.parseInt(resolvedModifier, 10);
    return new Roll({
      dice: diceFromMatch({
        ...groups,
        modifierType: undefined,
        modifier: `${Math.abs(mod)}`,
        sign: mod < 0 ? "-" : "+",
      }),
    });
  }

  return new Roll({ dice: diceFromMatch(groups) });
};

export const isValidDice = (
  match: DiceMatch,
  characterSkills: string[] = [],
) => {
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

export const getTextNodes = (root?: Element | null): Text[] => {
  if (!root) {
    return [];
  }
  const diceRegex = getDiceRegex();
  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    (node: Node) =>
      node.parentElement &&
      node.parentElement.tagName !== "STYLE" &&
      node.textContent?.match(diceRegex) &&
      !isParentsProcessed(node.parentElement)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
  );
  const textNodes: Text[] = [];
  while (treeWalker.nextNode()) {
    const { currentNode } = treeWalker;
    if (currentNode instanceof Text) {
      textNodes.push(currentNode);
    }
  }

  return textNodes;
};

// In some cases like Second Wind the dice values are wrapped in elements,
// so our text search fails since we are bound by #text nodes. If we are at
// the end of a #text node and the next element has a .ddbc-snippet__tag
// class, then we absorb that into our dice button.
const processNextElement = (
  node: Text,
  match: DiceMatch,
): [number, DocumentFragment | null] => {
  const nextOffset = match.index + match[0].length;

  if (match.groups.sign) {
    return [nextOffset, null];
  }

  const origDice = rollFromMatchWithAbilities(match.groups);
  const nextSibling = node.nextElementSibling;
  const snippetTag = nextSibling?.querySelector(".ddbc-snippet__tag");
  const parentTooltip = node.parentElement?.closest(".ddbc-tooltip");
  const parentTooltipSibling = parentTooltip?.nextElementSibling;

  if (
    nextOffset + 3 === node.textContent.length &&
    node.textContent
      .slice(nextOffset, nextOffset + 3)
      .match(/( [-+] | [-+]\d+)/) &&
    nextSibling &&
    snippetTag
  ) {
    match.groups.sign = node.textContent.slice(nextOffset + 1, nextOffset + 2);
    match.groups.modifier = snippetTag.textContent;

    const linkContent = new DocumentFragment();
    linkContent.appendChild(
      document.createTextNode(`${origDice} ${match.groups.sign}\u00A0`),
    );
    linkContent.appendChild(nextSibling);

    return [nextOffset + 3, linkContent];
  }

  const modNode = nextSibling ?? parentTooltipSibling;
  if (
    node.textContent.slice(nextOffset).trim().length === 0 &&
    modNode &&
    modNode?.textContent &&
    (nextSibling?.textContent?.match(/[-+]\d+$/) ||
      (parentTooltipSibling?.classList.contains("ddbc-tooltip") &&
        parentTooltipSibling?.textContent?.match(/[-+]\d+$/)))
  ) {
    match.groups.sign = modNode.textContent.slice(0, 1);
    match.groups.modifier = modNode.textContent.slice(1);

    const linkContent = new DocumentFragment();
    linkContent.appendChild(document.createTextNode(`${origDice}\u00A0`));
    linkContent.appendChild(modNode);

    return [node.textContent.length, linkContent];
  }
  return [nextOffset, null];
};

// This is similar to the above. For example Healing Hands (2024) uses the
// characters profiency as dice number.
const processPreviousElement = (
  node: Text,
  match: DiceMatch,
  characterSkills: string[],
): [Element | null, string | null] => {
  const previousSibling = node.previousElementSibling;
  const snippetTag = previousSibling?.querySelector(".ddbc-snippet__tag");

  if (
    !match.groups.numDice &&
    previousSibling?.classList.contains("ddbc-tooltip") &&
    snippetTag?.textContent?.match(/^\d+$/)
  ) {
    match.groups.numDice = snippetTag.textContent;
    return [previousSibling, null];
  }

  if (
    !match.groups.soloModifierType &&
    previousSibling?.classList.contains("skill-tooltip") &&
    characterSkills.includes(previousSibling.textContent)
  ) {
    match.groups.soloModifierType = previousSibling.textContent;
    return [null, previousSibling.textContent];
  }
  return [null, null];
};

export const embedInText = (
  node: Text,
  labelOrCallback:
    | string
    | undefined
    | ((match: DiceMatch, dice: Roll) => string | undefined),
  matchDicelessModifier?: boolean,
) => {
  let offset = 0;
  let fragment: DocumentFragment | undefined;
  let prependNode: Element | null = null;
  let appendLabel: string | null = null;

  const characterSkills = getCharacterSkills();
  const diceRegex = getDiceRegex(matchDicelessModifier);
  const textContent = node.textContent;

  for (const match of textContent.matchAll(
    diceRegex,
  ) as IterableIterator<DiceMatch>) {
    if (!isValidDice(match, characterSkills)) {
      continue;
    }

    if (!fragment) {
      fragment = new DocumentFragment();

      [prependNode, appendLabel] = processPreviousElement(
        node,
        match,
        characterSkills,
      );
    }

    if (match.index > offset) {
      fragment.appendChild(
        document.createTextNode(textContent.slice(offset, match.index)),
      );
    }

    // Check if we should merge the next element into this node.
    const [nextOffset, linkContent] = processNextElement(node, match);
    const dice = rollFromMatchWithAbilities(match.groups);
    let label =
      typeof labelOrCallback === "function"
        ? labelOrCallback(match, dice)
        : labelOrCallback;

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

    const link = talespireLink(label, dice, normalizeMinus(match[0]));
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

export const getSiblingWithClass = (
  node: HTMLElement | null,
  name: string,
  attempts = 5,
): HTMLElement | undefined => {
  if (!node || attempts === 0) {
    return;
  }

  const sibling = node.querySelector<HTMLElement>(`[class*="${name}"]`);
  if (sibling) {
    return sibling;
  }

  if (node.parentElement) {
    return getSiblingWithClass(node.parentElement, name, --attempts);
  }
  return;
};

export const getParentWithClass = (
  node: HTMLElement | null,
  name: string,
  attempts = 5,
): Element | undefined => {
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

export const isParentsProcessed = (
  node: HTMLElement | null,
  attempts = 4,
): boolean => {
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
