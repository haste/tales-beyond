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
  readonly groups: readonly (readonly Dice[])[];

  constructor(
    opts:
      | { dice: Dice | readonly Dice[] }
      | { groups: readonly (readonly Dice[])[] },
  ) {
    if ("groups" in opts) {
      this.groups = Object.freeze(
        opts.groups.map((g) => Object.freeze([...g])),
      );
    } else {
      this.groups = Object.freeze([
        Object.freeze(([] as Dice[]).concat(opts.dice)),
      ]);
    }
    Object.freeze(this);
  }

  double(): Roll {
    return new Roll({
      groups: this.groups.map((g) => g.map((d) => d.double())),
    });
  }

  scale(factor: number): Roll {
    return new Roll({
      groups: this.groups.map((g) => g.map((d) => d.scale(factor))),
    });
  }

  addDice(dice: Dice): Roll {
    const group = this.groups[0];
    if (!group || this.groups.length !== 1) {
      throw new Error("addDice requires a single-group roll");
    }
    return new Roll({ dice: [...group, dice] });
  }

  repeat(n: number): Roll {
    return new Roll({
      groups: Array.from({ length: n }, () => this.groups).flat(),
    });
  }

  toString(): string {
    return this.groups
      .map((g) => g.map((d) => d.toString()).join("+"))
      .join("/");
  }
}
