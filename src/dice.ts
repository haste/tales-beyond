interface DiceOptions {
  modifier?: number;
  damageType?: string | null;
}

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
