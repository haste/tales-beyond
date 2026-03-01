import { Dice } from "~/dice";

export const normalizeMinus = (str: string): string =>
  str.replace(/[−–]/g, "-");

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

interface DiceMatchGroups {
  dice?: string;
  modifier?: string;
  modifierType?: string;
  numDice?: string;
  sign?: string;
  soloModifier?: string;
  soloModifierType?: string;
}

export const rollFromMatch = ({
  dice,
  modifier,
  numDice,
  sign,
  soloModifier,
}: DiceMatchGroups): Roll => {
  const count = numDice ? Number.parseInt(numDice, 10) : 1;

  if (soloModifier) {
    return new Roll({
      dice: [
        new Dice(count, 20, {
          modifier: Number.parseInt(normalizeMinus(soloModifier), 10),
        }),
      ],
    });
  }

  const sides = Number.parseInt(dice || "0", 10);

  let mod = 0;
  if (modifier) {
    mod = Number.parseInt(`${normalizeMinus(sign || "")}${modifier}`, 10);
  }

  return new Roll({
    dice: [new Dice(count, sides, { modifier: mod })],
  });
};

export const parseRoll = (str: string): Roll | null => {
  const normalized = normalizeMinus(str);
  const diceRegex = getDiceRegex(false);
  const dice: Dice[] = [];

  for (const match of normalized.matchAll(diceRegex)) {
    const roll = rollFromMatch(match.groups as DiceMatchGroups);
    dice.push(...roll.dice);
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
