import { Dice } from "~/dice";

export const normalizeMinus = (str) => str.replace(/[−–]/g, "-");

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

export const rollFromMatch = ({
  dice,
  modifier,
  numDice,
  sign,
  soloModifier,
}) => {
  if (soloModifier) {
    const mod = Number.parseInt(normalizeMinus(soloModifier), 10);
    return new Roll({
      dice: [
        new Dice(Number.parseInt(numDice, 10) || 1, 20, { modifier: mod }),
      ],
    });
  }

  const count = numDice ? Number.parseInt(numDice, 10) : 1;
  const sides = Number.parseInt(dice, 10);

  const normalizedSign = normalizeMinus(sign || "");

  let mod = 0;
  if (modifier !== undefined && modifier !== "") {
    mod = Number.parseInt(`${normalizedSign}${modifier}`, 10);
  }

  return new Roll({
    dice: [new Dice(count, sides, { modifier: mod })],
  });
};

export const parseRoll = (str) => {
  const normalized = normalizeMinus(str);
  const diceRegex = getDiceRegex(false);
  const dice = [];

  for (const match of normalized.matchAll(diceRegex)) {
    const roll = rollFromMatch(match.groups);
    dice.push(...roll.dice);
  }

  if (dice.length === 0) {
    return null;
  }

  return new Roll({ dice });
};

export class Roll {
  dice;

  constructor({ dice }) {
    this.dice = Object.freeze([].concat(dice));
    Object.freeze(this);
  }

  double() {
    return this._clone({ dice: this.dice.map((d) => d.double()) });
  }

  scale(factor) {
    return this._clone({ dice: this.dice.map((d) => d.scale(factor)) });
  }

  addDice(dice) {
    return this._clone({ dice: [...this.dice, dice] });
  }

  duplicate() {
    return [this, this];
  }

  toString() {
    return this.dice.map((d) => d.toString()).join("+");
  }

  _clone(overrides) {
    return new Roll({
      dice: this.dice,
      ...overrides,
    });
  }
}
