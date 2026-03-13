import { describe, expect, test } from "bun:test";

import { Dice } from "~/dice";
import { parseRoll, Roll } from "~/roll";

const mustParseRoll = (str: string): Roll => {
  const roll = parseRoll(str);
  expect(roll).not.toBeNull();
  return roll as Roll;
};

describe("Roll", () => {
  describe("constructor", () => {
    test("single dice", () => {
      const roll = new Roll({ dice: [new Dice(1, 20, { modifier: 5 })] });
      expect(roll.groups).toHaveLength(1);
      expect(roll.groups[0]).toHaveLength(1);
    });

    test("accepts single Dice (not array)", () => {
      const roll = new Roll({ dice: new Dice(1, 20) });
      expect(roll.groups).toHaveLength(1);
      expect(roll.groups[0]).toHaveLength(1);
    });
  });

  describe("toString", () => {
    test("single dice", () => {
      const roll = new Roll({ dice: [new Dice(2, 6, { modifier: 3 })] });
      expect(roll.toString()).toBe("2d6+3");
    });

    test("multiple dice", () => {
      const roll = new Roll({
        dice: [
          new Dice(2, 6, { modifier: 3 }),
          new Dice(1, 8, { modifier: 2 }),
        ],
      });
      expect(roll.toString()).toBe("2d6+3+1d8+2");
    });

    test("multiple dice no modifiers", () => {
      const roll = new Roll({
        dice: [new Dice(2, 8), new Dice(1, 6)],
      });
      expect(roll.toString()).toBe("2d8+1d6");
    });

    test("template literal usage", () => {
      const roll = new Roll({ dice: [new Dice(2, 6, { modifier: 3 })] });
      expect(`${roll}`).toBe("2d6+3");
    });
  });

  describe("parse", () => {
    test("single dice", () => {
      const roll = mustParseRoll("2d6+3");
      expect(roll.groups[0]).toHaveLength(1);
      expect(roll.toString()).toBe("2d6+3");
    });

    test("single dice no modifier", () => {
      const roll = mustParseRoll("2d6");
      expect(roll.groups[0]).toHaveLength(1);
      expect(roll.toString()).toBe("2d6");
    });

    test("multi-dice with modifiers", () => {
      const roll = mustParseRoll("2d6+3+1d8+2");
      const group = roll.groups[0];
      expect(group).toHaveLength(2);
      expect(group?.[0]).toEqual(new Dice(2, 6, { modifier: 3 }));
      expect(group?.[1]).toEqual(new Dice(1, 8, { modifier: 2 }));
      expect(roll.toString()).toBe("2d6+3+1d8+2");
    });

    test("multi-dice no modifiers", () => {
      const roll = mustParseRoll("2d8+1d6");
      const group = roll.groups[0];
      expect(group).toHaveLength(2);
      expect(group?.[0]).toEqual(new Dice(2, 8));
      expect(group?.[1]).toEqual(new Dice(1, 6));
      expect(roll.toString()).toBe("2d8+1d6");
    });

    test("negative modifier", () => {
      const roll = mustParseRoll("1d20-3");
      expect(roll.groups[0]?.[0]).toEqual(new Dice(1, 20, { modifier: -3 }));
      expect(roll.toString()).toBe("1d20-3");
    });

    test("unicode minus", () => {
      const roll = mustParseRoll("1d20–3");
      expect(roll.groups[0]?.[0]).toEqual(new Dice(1, 20, { modifier: -3 }));
    });

    test("no count defaults to 1", () => {
      const roll = mustParseRoll("d20+5");
      expect(roll.groups[0]?.[0]).toEqual(new Dice(1, 20, { modifier: 5 }));
      expect(roll.toString()).toBe("1d20+5");
    });

    test("round-trip single", () => {
      expect(mustParseRoll("2d6+3").toString()).toBe("2d6+3");
    });

    test("round-trip multi", () => {
      expect(mustParseRoll("2d6+3+1d8+2").toString()).toBe("2d6+3+1d8+2");
    });

    test("round-trip no modifier", () => {
      expect(mustParseRoll("4d6").toString()).toBe("4d6");
    });

    test("invalid string returns null", () => {
      expect(parseRoll("hello")).toBeNull();
    });
  });

  describe("immutable transforms", () => {
    test("double", () => {
      const roll = mustParseRoll("2d6+3");
      const doubled = roll.double();
      expect(doubled.toString()).toBe("4d6+3");
      expect(roll.toString()).toBe("2d6+3"); // original unchanged
    });

    test("double multi-dice", () => {
      const roll = new Roll({
        dice: [
          new Dice(2, 6, { modifier: 3 }),
          new Dice(1, 8, { modifier: 2 }),
        ],
      });
      expect(roll.double().toString()).toBe("4d6+3+2d8+2");
    });

    test("scale", () => {
      const roll = mustParseRoll("1d4+1");
      const scaled = roll.scale(3);
      expect(scaled.toString()).toBe("3d4+3");
      expect(roll.toString()).toBe("1d4+1"); // original unchanged
    });

    test("addDice", () => {
      const roll = mustParseRoll("2d8");
      const added = roll.addDice(new Dice(1, 6));
      expect(added.toString()).toBe("2d8+1d6");
      expect(roll.toString()).toBe("2d8"); // original unchanged
    });

    test("repeat returns Roll with n groups", () => {
      const roll = mustParseRoll("2d6+3");
      const repeated = roll.repeat(3);
      expect(repeated.groups).toHaveLength(3);
      expect(repeated.toString()).toBe("2d6+3/2d6+3/2d6+3");
    });

    test("double then repeat composes correctly", () => {
      const roll = mustParseRoll("2d6+3");
      const result = roll.double().repeat(2);
      expect(result.groups).toHaveLength(2);
      expect(result.toString()).toBe("4d6+3/4d6+3");
    });
  });
});
