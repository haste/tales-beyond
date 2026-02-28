import { describe, expect, test } from "bun:test";

import { Dice } from "~/dice";
import { parseRoll, Roll, rollFromMatch } from "~/roll";

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
      const roll = parseRoll("2d6+3");
      expect(roll.dice).toHaveLength(1);
      expect(roll.toString()).toBe("2d6+3");
    });

    test("single dice no modifier", () => {
      const roll = parseRoll("2d6");
      expect(roll.dice).toHaveLength(1);
      expect(roll.toString()).toBe("2d6");
    });

    test("multi-dice with modifiers", () => {
      const roll = parseRoll("2d6+3+1d8+2");
      expect(roll.dice).toHaveLength(2);
      expect(roll.dice[0].count).toBe(2);
      expect(roll.dice[0].sides).toBe(6);
      expect(roll.dice[0].modifier).toBe(3);
      expect(roll.dice[1].count).toBe(1);
      expect(roll.dice[1].sides).toBe(8);
      expect(roll.dice[1].modifier).toBe(2);
      expect(roll.toString()).toBe("2d6+3+1d8+2");
    });

    test("multi-dice no modifiers", () => {
      const roll = parseRoll("2d8+1d6");
      expect(roll.dice).toHaveLength(2);
      expect(roll.dice[0].count).toBe(2);
      expect(roll.dice[0].sides).toBe(8);
      expect(roll.dice[0].modifier).toBe(0);
      expect(roll.dice[1].count).toBe(1);
      expect(roll.dice[1].sides).toBe(6);
      expect(roll.dice[1].modifier).toBe(0);
      expect(roll.toString()).toBe("2d8+1d6");
    });

    test("negative modifier", () => {
      const roll = parseRoll("1d20-3");
      expect(roll.dice[0].modifier).toBe(-3);
      expect(roll.toString()).toBe("1d20-3");
    });

    test("unicode minus", () => {
      const roll = parseRoll("1d20\u22123");
      expect(roll.dice[0].modifier).toBe(-3);
    });

    test("no count defaults to 1", () => {
      const roll = parseRoll("d20+5");
      expect(roll.dice[0].count).toBe(1);
      expect(roll.toString()).toBe("1d20+5");
    });

    test("round-trip single", () => {
      expect(parseRoll("2d6+3").toString()).toBe("2d6+3");
    });

    test("round-trip multi", () => {
      expect(parseRoll("2d6+3+1d8+2").toString()).toBe("2d6+3+1d8+2");
    });

    test("round-trip no modifier", () => {
      expect(parseRoll("4d6").toString()).toBe("4d6");
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
        sign: "\u2212",
        modifier: "3",
      });
      expect(roll.toString()).toBe("1d20-3");
    });

    test("en dash sign", () => {
      const roll = rollFromMatch({
        numDice: "1",
        dice: "20",
        sign: "\u2013",
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
      const roll = rollFromMatch({ soloModifier: "\u22123" });
      expect(roll.toString()).toBe("1d20-3");
    });

    test("soloModifier with en dash", () => {
      const roll = rollFromMatch({ soloModifier: "\u20133" });
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
      const roll = parseRoll("2d6+3");
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
      const roll = parseRoll("1d4+1");
      const scaled = roll.scale(3);
      expect(scaled.toString()).toBe("3d4+3");
      expect(roll.toString()).toBe("1d4+1"); // original unchanged
    });

    test("addDice", () => {
      const roll = parseRoll("2d8");
      const added = roll.addDice(new Dice(1, 6));
      expect(added.toString()).toBe("2d8+1d6");
      expect(roll.toString()).toBe("2d8"); // original unchanged
    });

    test("duplicate returns array of two identical Rolls", () => {
      const roll = parseRoll("2d6+3");
      const duped = roll.duplicate();
      expect(duped).toHaveLength(2);
      expect(duped[0]).toBe(roll);
      expect(duped[1]).toBe(roll);
    });

    test("double then duplicate composes correctly", () => {
      const roll = parseRoll("2d6+3");
      const result = roll.double().duplicate();
      expect(result).toHaveLength(2);
      expect(result[0].toString()).toBe("4d6+3");
      expect(result[1].toString()).toBe("4d6+3");
    });
  });

  describe("immutability", () => {
    test("properties cannot be reassigned", () => {
      const roll = new Roll({ dice: [new Dice(1, 20)] });
      expect(() => {
        roll.dice = [];
      }).toThrow();
    });

    test("dice array cannot be mutated", () => {
      const roll = new Roll({ dice: [new Dice(1, 20)] });
      expect(() => {
        roll.dice.push(new Dice(1, 6));
      }).toThrow();
      expect(() => {
        roll.dice[0] = new Dice(2, 8);
      }).toThrow();
    });
  });
});
