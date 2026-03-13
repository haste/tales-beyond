import { describe, expect, test } from "bun:test";

import { Dice, diceFromMatch } from "~/dice";

describe("Dice", () => {
  describe("constructor", () => {
    test("defaults", () => {
      const d = new Dice(1, 20);
      expect(d.count).toBe(1);
      expect(d.sides).toBe(20);
      expect(d.modifier).toBe(0);
      expect(d.damageType).toBeNull();
    });

    test("with options", () => {
      const d = new Dice(2, 6, { modifier: 3, damageType: "fire" });
      expect(d.count).toBe(2);
      expect(d.sides).toBe(6);
      expect(d.modifier).toBe(3);
      expect(d.damageType).toBe("fire");
    });
  });

  describe("toString", () => {
    test("no modifier", () => {
      expect(new Dice(2, 6).toString()).toBe("2d6");
    });

    test("positive modifier", () => {
      expect(new Dice(1, 20, { modifier: 5 }).toString()).toBe("1d20+5");
    });

    test("negative modifier", () => {
      expect(new Dice(1, 20, { modifier: -1 }).toString()).toBe("1d20-1");
    });

    test("explicit count of 1", () => {
      expect(new Dice(1, 8).toString()).toBe("1d8");
    });
  });

  describe("immutable transforms", () => {
    test("double", () => {
      const d = new Dice(2, 6, { modifier: 3 });
      const doubled = d.double();
      expect(doubled.toString()).toBe("4d6+3");
      expect(d.toString()).toBe("2d6+3"); // original unchanged
    });

    test("scale", () => {
      const d = new Dice(1, 4, { modifier: 1 });
      const scaled = d.scale(3);
      expect(scaled.toString()).toBe("3d4+3");
      expect(d.toString()).toBe("1d4+1"); // original unchanged
    });

    test("double preserves damageType", () => {
      const d = new Dice(2, 6, { modifier: 3, damageType: "fire" });
      expect(d.double().damageType).toBe("fire");
    });

    test("scale preserves damageType", () => {
      const d = new Dice(1, 4, { modifier: 1, damageType: "force" });
      expect(d.scale(3).damageType).toBe("force");
    });
  });

  describe("diceFromMatch", () => {
    test("full dice match", () => {
      const d = diceFromMatch({
        numDice: "2",
        dice: "6",
        sign: "+",
        modifier: "3",
      });
      expect(d).toEqual(new Dice(2, 6, { modifier: 3 }));
    });

    test("no numDice defaults to 1", () => {
      const d = diceFromMatch({ dice: "20" });
      expect(d).toEqual(new Dice(1, 20));
    });

    test("negative sign", () => {
      const d = diceFromMatch({
        numDice: "1",
        dice: "20",
        sign: "-",
        modifier: "1",
      });
      expect(d).toEqual(new Dice(1, 20, { modifier: -1 }));
    });

    test("unicode minus sign", () => {
      const d = diceFromMatch({
        numDice: "1",
        dice: "20",
        sign: "–",
        modifier: "3",
      });
      expect(d).toEqual(new Dice(1, 20, { modifier: -3 }));
    });

    test("en dash sign", () => {
      const d = diceFromMatch({
        numDice: "1",
        dice: "20",
        sign: "−",
        modifier: "3",
      });
      expect(d).toEqual(new Dice(1, 20, { modifier: -3 }));
    });

    test("soloModifier positive", () => {
      const d = diceFromMatch({ soloModifier: "+5" });
      expect(d).toEqual(new Dice(1, 20, { modifier: 5 }));
    });

    test("soloModifier negative", () => {
      const d = diceFromMatch({ soloModifier: "-2" });
      expect(d).toEqual(new Dice(1, 20, { modifier: -2 }));
    });

    test("soloModifier with unicode minus", () => {
      const d = diceFromMatch({ soloModifier: "–3" });
      expect(d).toEqual(new Dice(1, 20, { modifier: -3 }));
    });

    test("soloModifier with en dash", () => {
      const d = diceFromMatch({ soloModifier: "−3" });
      expect(d).toEqual(new Dice(1, 20, { modifier: -3 }));
    });

    test("no modifier", () => {
      const d = diceFromMatch({ numDice: "2", dice: "8" });
      expect(d).toEqual(new Dice(2, 8));
    });

    test("negative modifier value (already negative)", () => {
      const d = diceFromMatch({
        numDice: "1",
        dice: "20",
        modifier: "-4",
      });
      expect(d).toEqual(new Dice(1, 20, { modifier: -4 }));
    });
  });
});
