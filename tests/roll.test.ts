import { describe, expect, test } from "bun:test";

import { Dice } from "~/dice";
import { parseRoll, Roll, rollFromMatch } from "~/roll";

const mustParseRoll = (str: string): Roll => {
  const roll = parseRoll(str);
  expect(roll).not.toBeNull();
  return roll as Roll;
};

describe("Roll", () => {
  describe("constructor", () => {
    test("single dice", () => {
      const roll = new Roll({ dice: [new Dice(1, 20, { modifier: 5 })] });
      expect(roll.dice).toHaveLength(1);
    });

    test("accepts single Dice (not array)", () => {
      const roll = new Roll({ dice: new Dice(1, 20) });
      expect(roll.dice).toHaveLength(1);
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
      expect(roll.dice).toHaveLength(1);
      expect(roll.toString()).toBe("2d6+3");
    });

    test("single dice no modifier", () => {
      const roll = mustParseRoll("2d6");
      expect(roll.dice).toHaveLength(1);
      expect(roll.toString()).toBe("2d6");
    });

    test("multi-dice with modifiers", () => {
      const roll = mustParseRoll("2d6+3+1d8+2");
      const [first, second] = roll.dice;
      expect(roll.dice).toHaveLength(2);
      expect(first).toEqual(new Dice(2, 6, { modifier: 3 }));
      expect(second).toEqual(new Dice(1, 8, { modifier: 2 }));
      expect(roll.toString()).toBe("2d6+3+1d8+2");
    });

    test("multi-dice no modifiers", () => {
      const roll = mustParseRoll("2d8+1d6");
      const [first, second] = roll.dice;
      expect(roll.dice).toHaveLength(2);
      expect(first).toEqual(new Dice(2, 8));
      expect(second).toEqual(new Dice(1, 6));
      expect(roll.toString()).toBe("2d8+1d6");
    });

    test("negative modifier", () => {
      const roll = mustParseRoll("1d20-3");
      const [first] = roll.dice;
      expect(first).toEqual(new Dice(1, 20, { modifier: -3 }));
      expect(roll.toString()).toBe("1d20-3");
    });

    test("unicode minus", () => {
      const roll = mustParseRoll("1d20–3");
      const [first] = roll.dice;
      expect(first).toEqual(new Dice(1, 20, { modifier: -3 }));
    });

    test("no count defaults to 1", () => {
      const roll = mustParseRoll("d20+5");
      const [first] = roll.dice;
      expect(first).toEqual(new Dice(1, 20, { modifier: 5 }));
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

  describe("fromMatch", () => {
    test("full dice match", () => {
      const roll = rollFromMatch({
        numDice: "2",
        dice: "6",
        sign: "+",
        modifier: "3",
      });
      expect(roll.toString()).toBe("2d6+3");
    });

    test("no numDice defaults to 1", () => {
      const roll = rollFromMatch({ dice: "20" });
      expect(roll.toString()).toBe("1d20");
    });

    test("negative sign", () => {
      const roll = rollFromMatch({
        numDice: "1",
        dice: "20",
        sign: "-",
        modifier: "1",
      });
      expect(roll.toString()).toBe("1d20-1");
    });

    test("unicode minus sign", () => {
      const roll = rollFromMatch({
        numDice: "1",
        dice: "20",
        sign: "–",
        modifier: "3",
      });
      expect(roll.toString()).toBe("1d20-3");
    });

    test("en dash sign", () => {
      const roll = rollFromMatch({
        numDice: "1",
        dice: "20",
        sign: "−",
        modifier: "3",
      });
      expect(roll.toString()).toBe("1d20-3");
    });

    test("soloModifier positive", () => {
      const roll = rollFromMatch({ soloModifier: "+5" });
      expect(roll.toString()).toBe("1d20+5");
    });

    test("soloModifier negative", () => {
      const roll = rollFromMatch({ soloModifier: "-2" });
      expect(roll.toString()).toBe("1d20-2");
    });

    test("soloModifier with unicode minus", () => {
      const roll = rollFromMatch({ soloModifier: "–3" });
      expect(roll.toString()).toBe("1d20-3");
    });

    test("soloModifier with en dash", () => {
      const roll = rollFromMatch({ soloModifier: "−3" });
      expect(roll.toString()).toBe("1d20-3");
    });

    test("no modifier", () => {
      const roll = rollFromMatch({ numDice: "2", dice: "8" });
      expect(roll.toString()).toBe("2d8");
    });

    test("negative modifier value (already negative)", () => {
      const roll = rollFromMatch({
        numDice: "1",
        dice: "20",
        modifier: "-4",
      });
      expect(roll.toString()).toBe("1d20-4");
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

    test("duplicate returns array of two identical Rolls", () => {
      const roll = mustParseRoll("2d6+3");
      const duped = roll.duplicate();
      expect(duped).toHaveLength(2);
      expect(duped[0]).toBe(roll);
      expect(duped[1]).toBe(roll);
    });

    test("double then duplicate composes correctly", () => {
      const roll = mustParseRoll("2d6+3");
      const result = roll.double().duplicate();
      expect(result).toHaveLength(2);
      expect(result[0].toString()).toBe("4d6+3");
      expect(result[1].toString()).toBe("4d6+3");
    });
  });
});
