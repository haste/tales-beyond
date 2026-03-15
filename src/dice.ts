export const normalizeMinus = (str: string): string =>
  str.replace(/[−–]/g, "-");

export type DiceMatch = {
  0: string;
  index: number;
  groups: DiceMatchGroups;
};

export type DiceMatchGroups = {
  dice?: string;
  modifier?: string;
  modifierType?: string;
  numDice?: string;
  sign?: string;
  soloModifier?: string;
  soloModifierType?: string;
};

export const diceFromMatch = ({
  dice,
  modifier,
  numDice,
  sign,
  soloModifier,
}: DiceMatchGroups): Dice => {
  const count = numDice ? Number.parseInt(numDice, 10) : 1;

  if (soloModifier) {
    return new Dice(count, 20, {
      modifier: Number.parseInt(normalizeMinus(soloModifier), 10),
    });
  }

  const sides = Number.parseInt(dice || "0", 10);

  let mod = 0;
  if (modifier) {
    mod = Number.parseInt(`${normalizeMinus(sign || "")}${modifier}`, 10);
  }

  return new Dice(count, sides, { modifier: mod });
};

type DiceOptions = {
  modifier?: number;
  damageType?: string | null;
};

export class Dice {
  readonly count: number;
  readonly sides: number;
  readonly modifier: number;
  readonly damageType: string | null;

  constructor(
    count: number,
    sides: number,
    { modifier = 0, damageType = null }: DiceOptions = {},
  ) {
    this.count = count;
    this.sides = sides;
    this.modifier = modifier;
    this.damageType = damageType;
    Object.freeze(this);
  }

  double(): Dice {
    return new Dice(this.count * 2, this.sides, {
      modifier: this.modifier,
      damageType: this.damageType,
    });
  }

  scale(factor: number): Dice {
    return new Dice(this.count * factor, this.sides, {
      modifier: this.modifier * factor,
      damageType: this.damageType,
    });
  }

  toString(): string {
    if (!this.modifier) {
      return `${this.count}d${this.sides}`;
    }
    const sign = this.modifier > 0 ? "+" : "";
    return `${this.count}d${this.sides}${sign}${this.modifier}`;
  }
}
