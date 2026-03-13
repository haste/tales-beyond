import {
  type Dice,
  type DiceMatchGroups,
  diceFromMatch,
  normalizeMinus,
} from "~/dice";

const fullDiceRegex =
  /(?<numDice>\d+)?d(?<dice>\d+)(?:\s*(?<sign>[-+−–])\s*(?:your (?<modifierType>\w+) modifier|(?<modifier>(?!\d+d\d+)\d+)))?/;
const soloModifierRegex =
  /(?:(?<soloModifierType>[A-Z]{3}|\b[A-Z][a-zA-Z]*\b)\s*)?(?<soloModifier>[-+−–](?:\d(?!\s*(?:[m\d]|ft))|(?<!\d[-−–])\d\d+(?!\s*(?:m|ft))))/;

export const getDiceRegex = (matchDicelessModifier = true): RegExp => {
  return new RegExp(
    [fullDiceRegex, ...(matchDicelessModifier ? [soloModifierRegex] : [])]
      .map((regex) => regex.source)
      .join("|"),
    "g",
  );
};

export const parseRoll = (str: string): Roll | null => {
  const normalized = normalizeMinus(str);
  const diceRegex = getDiceRegex(false);
  const dice: Dice[] = [];

  for (const match of normalized.matchAll(diceRegex)) {
    dice.push(diceFromMatch(match.groups as DiceMatchGroups));
  }

  if (dice.length === 0) {
    return null;
  }

  return new Roll({ dice });
};

export class Roll {
  readonly dice: readonly Dice[];

  constructor({ dice }: { dice: Dice | readonly Dice[] }) {
    this.dice = Object.freeze(([] as Dice[]).concat(dice));
    Object.freeze(this);
  }

  double(): Roll {
    return this.clone({ dice: this.dice.map((d) => d.double()) });
  }

  scale(factor: number): Roll {
    return this.clone({ dice: this.dice.map((d) => d.scale(factor)) });
  }

  addDice(dice: Dice): Roll {
    return this.clone({ dice: [...this.dice, dice] });
  }

  repeat(n: number): Roll[] {
    return Array(n).fill(this);
  }

  toString(): string {
    return this.dice.map((d) => d.toString()).join("+");
  }

  private clone(overrides: { dice: readonly Dice[] }): Roll {
    return new Roll({ ...overrides });
  }
}
