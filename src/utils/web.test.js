import { describe, expect, test } from "bun:test";

import { diceRegex } from "~/utils/web";

describe("diceRegex", () => {
  const regexGroups = (str) =>
    [...str.matchAll(diceRegex)].map((m) => m.groups);

  const fillWithUndefined = (expected) =>
    expected.map((e) => ({
      dice: undefined,
      modifier: undefined,
      modifierType: undefined,
      numDice: undefined,
      sign: undefined,
      soloModifier: undefined,
      soloModifierType: undefined,
      ...e,
    }));

  for (const setup of [
    {
      input: "takes d20 damage",
      expected: [
        {
          dice: "20",
        },
      ],
    },
    {
      input: "takes d12 + 4 damage",
      expected: [
        {
          dice: "12",
          sign: "+",
          modifier: "4",
        },
      ],
    },
    {
      input: "takes d12+4 damage",
      expected: [
        {
          dice: "12",
          sign: "+",
          modifier: "4",
        },
      ],
    },
    {
      input: "takes d12 - 4 damage",
      expected: [
        {
          dice: "12",
          sign: "-",
          modifier: "4",
        },
      ],
    },
    {
      input: "takes 2d8 + 1d6 damage. Roll d20",
      expected: [
        {
          numDice: "2",
          dice: "8",
        },
        {
          numDice: "1",
          dice: "6",
        },
        {
          dice: "20",
        },
      ],
    },
    {
      input: "takes 1d8 + 99d6 + 1d10 damage",
      expected: [
        {
          numDice: "1",
          dice: "8",
        },
        {
          numDice: "99",
          dice: "6",
        },
        {
          numDice: "1",
          dice: "10",
        },
      ],
    },
    {
      input: "+2 bonus",
      expected: [
        {
          soloModifier: "+2",
        },
      ],
    },
    {
      input: "-2 bonus",
      expected: [
        {
          soloModifier: "-2",
        },
      ],
    },
    {
      input: "reduce the damage by 1d10 + your Dexterity modifier, provided",
      expected: [
        {
          dice: "10",
          modifierType: "Dexterity",
          numDice: "1",
          sign: "+",
        },
      ],
    },
    {
      input: "Saving Throws CON +6, INT +8, WIS +3",
      expected: [
        {
          soloModifier: "+6",
          soloModifierType: "CON",
        },
        {
          soloModifier: "+8",
          soloModifierType: "INT",
        },
        {
          soloModifier: "+3",
          soloModifierType: "WIS",
        },
      ],
    },
    {
      input: "Hit Points 135 (18d10 + 36)",
      expected: [
        {
          dice: "10",
          modifier: "36",
          numDice: "18",
          sign: "+",
        },
      ],
    },
    {
      input: "some +2 Attack!",
      expected: [
        {
          soloModifier: "+2",
        },
      ],
    },
    {
      input: "Some +2 Attack!",
      expected: [
        {
          soloModifier: "+2",
          soloModifierType: "Some",
        },
      ],
    },
    {
      input:
        "damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
      expected: [
        {
          dice: "8",
          numDice: "1",
        },
        {
          dice: "8",
          numDice: "2",
        },
        {
          dice: "8",
          numDice: "3",
        },
        {
          dice: "8",
          numDice: "4",
        },
      ],
    },
    {
      input: "1A +10m",
      expected: [],
    },
    {
      input: "1A +10",
      expected: [
        {
          soloModifier: "+10",
        },
      ],
    },
  ]) {
    test(setup.input, () => {
      expect(regexGroups(setup.input)).toEqual(
        fillWithUndefined(setup.expected),
      );
    });
  }
});
