export class Dice {
  count;
  sides;
  modifier;
  damageType;

  constructor(count, sides, { modifier = 0, damageType = null } = {}) {
    this.count = count;
    this.sides = sides;
    this.modifier = modifier;
    this.damageType = damageType;
    Object.freeze(this);
  }

  double() {
    return new Dice(this.count * 2, this.sides, {
      modifier: this.modifier,
      damageType: this.damageType,
    });
  }

  scale(factor) {
    return new Dice(this.count * factor, this.sides, {
      modifier: this.modifier * factor,
      damageType: this.damageType,
    });
  }

  toString() {
    if (!this.modifier) {
      return `${this.count}d${this.sides}`;
    }
    const sign = this.modifier > 0 ? "+" : "";
    return `${this.count}d${this.sides}${sign}${this.modifier}`;
  }
}
