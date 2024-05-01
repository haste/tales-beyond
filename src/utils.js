const diceValue = ({
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
    // It's not too many cases where this will trigger, but it would be nice to
    // cache this a bit
    modifier = getAbilities()[modifierType];
  }
  if (+modifier < 0) {
    sign = "";
  }
  return `${numDice}d${dice}${sign}${modifier}`;
};

export const diceRegex =
  /((?<numDice>\d+)?d(?<dice>\d+)(?:\s*(?<sign>[+-])\s*(?:your (?<modifierType>\w+) modifier|(?<modifier>(?!\d+d\d+)\d+)))?|(?<soloModifierType>[A-Z]{3}\s*)?(?<soloModifier>[+-]\d+))/g;

export const talespireLink = (elem, label, dice, diceLabel) => {
  const link = document.createElement("button");
  link.classList.add("integrated-dice__container");
  link.classList.add("tales-beyond-extension");
  link.dataset.tsLabel = label;
  link.dataset.tsDice = dice;
  link.onclick = (event) => {
    event.stopPropagation();

    let name = label;
    let extraDice = "";
    if (event.altKey || event.ctrlKey) {
      name += " (ADV/DIS)";
      extraDice = `/${dice}`;
    }
    window.open(
      `talespire://dice/${encodeURIComponent(name)}:${dice}${extraDice}`,
      "_self",
    );
  };

  if (diceLabel) {
    link.innerText = diceLabel;
  } else if (elem) {
    link.innerHTML = elem.innerHTML;
  } else {
    link.innerText = dice;
  }

  return link;
};

export const getTextNodes = (root) => {
  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    (node) =>
      !node.parentNode.classList.contains("tales-beyond-extension") &&
      node.textContent.match(diceRegex)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
  );
  const textNodes = [];
  while (treeWalker.nextNode()) {
    textNodes.push(treeWalker.currentNode);
  }

  return textNodes;
};

export const getAbilities = () => {
  const abilities = Array.from(
    document.querySelectorAll(".ct-quick-info__ability"),
  ).reduce((acc, node) => {
    const stat = node.querySelector(".ddbc-ability-summary__label").textContent;

    let modifier = node.querySelector(".ddbc-signed-number").textContent;
    if (+modifier > 0) {
      modifier = modifier.slice(1);
    }

    acc[stat] = modifier;
    return acc;
  }, {});

  return abilities;
};

export const embedInText = (node, labelOrCallback) => {
  let offset = 0;
  let fragment;
  for (const match of node.textContent.matchAll(diceRegex)) {
    if (offset === 0) {
      fragment = new DocumentFragment();

      if (match.index !== 0) {
        fragment.appendChild(
          document.createTextNode(
            node.textContent.substring(offset, match.index),
          ),
        );
      }
    } else {
      fragment.appendChild(
        document.createTextNode(
          node.textContent.substring(offset, match.index),
        ),
      );
    }

    const dice = diceValue(match.groups);
    let label = labelOrCallback;
    if (typeof label === "function") {
      label = label(match, dice);
    }

    const link = talespireLink(null, label, diceValue(match.groups), match[0]);
    link.style = "padding-left: 4px; padding-right: 4px;";

    fragment.appendChild(link);
    offset = match.index + match[0].length;
  }

  if (fragment && offset !== node.textContent.length) {
    fragment.appendChild(
      document.createTextNode(
        node.textContent.substring(offset, node.textContent.length),
      ),
    );
  }

  if (fragment) {
    node.replaceWith(fragment);
  }
};
