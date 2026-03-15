import {
  type Dice,
  type DiceMatch,
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

const parseGroup = (str: string): Dice[] => {
  const normalized = normalizeMinus(str);
  const diceRegex = getDiceRegex(false);
  const dice: Dice[] = [];

  for (const match of normalized.matchAll(
    diceRegex,
  ) as IterableIterator<DiceMatch>) {
    dice.push(diceFromMatch(match.groups));
  }

  return dice;
};

export const parseRoll = (str: string, type?: RollType): Roll | null => {
  const groups = str
    .split("/")
    .map(parseGroup)
    .filter((g) => g.length > 0);

  if (groups.length === 0) {
    return null;
  }

  return new Roll({ groups, type });
};

export type RollType = "hit" | "damage";

type RollOpts = {
  type?: RollType;
};

export class Roll {
  readonly groups: readonly (readonly Dice[])[];
  readonly type?: RollType;

  constructor(
    opts: (
      | { dice: Dice | readonly Dice[] }
      | { groups: readonly (readonly Dice[])[] }
    ) &
      RollOpts,
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
    this.type = opts.type;
    Object.freeze(this);
  }

  double(): Roll {
    return new Roll({
      groups: this.groups.map((g) => g.map((d) => d.double())),
      type: this.type,
    });
  }

  scale(factor: number): Roll {
    return new Roll({
      groups: this.groups.map((g) => g.map((d) => d.scale(factor))),
      type: this.type,
    });
  }

  addDice(dice: Dice): Roll {
    const group = this.groups[0];
    if (!group || this.groups.length !== 1) {
      throw new Error("addDice requires a single-group roll");
    }
    return new Roll({ dice: [...group, dice], type: this.type });
  }

  repeat(n: number): Roll {
    return new Roll({
      groups: Array.from({ length: n }, () => this.groups).flat(),
      type: this.type,
    });
  }

  toString(): string {
    return this.groups
      .map((g) => g.map((d) => d.toString()).join("+"))
      .join("/");
  }
}
