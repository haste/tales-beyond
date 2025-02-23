import { describe, expect, test } from "bun:test";

import {
  embedInText,
  getDiceRegex,
  getTextNodes,
  isValidDice,
} from "~/utils/web";

describe("diceRegex", () => {
  const regexGroups = (str) =>
    [...str.matchAll(getDiceRegex())].map((m) => ({
      ...m.groups,
      valid: isValidDice(m),
    }));

  const fillWithUndefined = (expected) =>
    expected.map((e) => ({
      dice: undefined,
      modifier: undefined,
      modifierType: undefined,
      numDice: undefined,
      sign: undefined,
      soloModifier: undefined,
      soloModifierType: undefined,
      valid: true,
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
          valid: false,
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
    {
      input: "PHB-2024",
      expected: [
        {
          soloModifier: "-2024",
          soloModifierType: "PHB",
          valid: false,
        },
      ],
    },
    // Monster Manual 2024
    {
      // U+2212
      input: "−3",
      expected: [
        {
          soloModifier: "−3",
          valid: true,
        },
      ],
    },
    // Monster Manual 2024
    {
      // U+2013
      input: "–3",
      expected: [
        {
          soloModifier: "–3",
          valid: true,
        },
      ],
    },

    // On vehicles
    {
      input: "-10 ft.",
      expected: [],
    },
    // On vehicles
    {
      input: "-5 ft.",
      expected: [],
    },
  ]) {
    test(setup.input, () => {
      expect(regexGroups(setup.input)).toEqual(
        fillWithUndefined(setup.expected),
      );
    });
  }
});

describe("getTextNodes + embedInText", () => {
  // from D&D Beyond Character v1.69.44
  describe("Actions", () => {
    test("dice value outside tooltip and modifier inside", () => {
      // Second Wind PHB
      document.body.innerHTML = `<div class="ct-feature-snippet"><div class="ct-feature-snippet__heading ct-feature-snippet__heading--dark-mode">Second Wind </div><div class="ct-feature-snippet__content"><div class="ddbc-snippet  ddbc-snippet--parsed ddbc-snippet--dark-mode"><div class="jsx-parser ddbc-snippet__content"><p>Once per short rest, you can use a bonus action to regain 1d10 + <span class="ddbc-tooltip  ddbc-tooltip--dark-mode" data-tippy="" data-original-title="classlevel"><span class="ddbc-snippet__tag">3</span></span> HP.</p></div></div></div><div class="ct-feature-snippet__limited-use ct-feature-snippet__limited-use--dark-mode"><div class="ct-feature-snippet__limited-use-usages"><div class="ct-slot-manager ct-slot-manager--size-small"><div role="checkbox" aria-checked="false" aria-label="use" class="ct-slot-manager__slot ct-slot-manager__slot--interactive"></div></div></div><div class="ct-feature-snippet__limited-use-sep">/</div><div class="ct-feature-snippet__limited-use-reset">Short Rest</div></div></div>`;

      const textNodes = getTextNodes(document.body);
      expect(textNodes.length).toEqual(1);

      for (const node of textNodes) {
        embedInText(node);
      }

      const button = document.querySelector("button");
      expect(button.className).toEqual(
        "integrated-dice__container tales-beyond-extension",
      );
      expect(button.dataset.tsLabel).toEqual("Second Wind");
      expect(button.dataset.tsDice).toEqual("1d10+3");
    });
  });

  // from D&D Beyond Character v1.69.44
  describe("Features & Traits", () => {
    test("dice and modifier value inside tooltip", () => {
      // Sneak Attack PHB
      document.body.innerHTML = `<div class="styles_snippet__CzYh+ ct-feature-snippet--class"><div class="styles_heading__yD0Cm styles_headingDarkMode__YO4Ql">Sneak Attack<span><span class="styles_metaItem__wEnyV styles_metaItemDarkMode__oscOW"><span>4d6</span></span><span class="styles_metaItem__wEnyV styles_metaItemDarkMode__oscOW"><p class="styles_reference__4pmEk" data-tooltip-id="0aba286b-18fb-4037-97bd-0412f7b78480" data-tooltip-delay-show="1500"><span class="styles_name__mZMFY">PHB</span><span>, pg. 96</span></p><div class="Tooltip_container__20y9m"></div></span></span></div><div class="styles_content__VHVQW"><div class="ddbc-snippet  ddbc-snippet--parsed ddbc-snippet--dark-mode"><div class="jsx-parser ddbc-snippet__content"><p>Once per turn, you can deal an extra <span class="ddbc-tooltip  ddbc-tooltip--dark-mode" data-tippy="" data-original-title="scalevalue"><span class="ddbc-snippet__tag">4d6</span></span> damage to one creature you hit with an attack with a finesse or ranged weapon if you have advantage on the attack roll. You don’t need advantage on the attack roll if another enemy of the target is within 5 ft. of it, that enemy isn’t incapacitated, and you don’t have disadvantage on the attack roll.</p></div></div></div><div class="styles_extra__BgeMp" style="border-color: rgb(213, 145, 57);"><div class="ct-feature-snippet__actions"><div class="ct-feature-snippet__action"><div class="ct-feature-snippet__action-summary ct-feature-snippet__action-summary--dark-mode">Sneak Attack: (No Action)</div></div></div></div></div>`;

      const textNodes = getTextNodes(document.body);
      expect(textNodes.length).toEqual(2);

      for (const node of textNodes) {
        embedInText(node);
      }

      const button = document.body.querySelector("button");
      expect(button.className).toEqual(
        "integrated-dice__container tales-beyond-extension",
      );
      expect(button.dataset.tsLabel).toEqual("Sneak Attack");
      expect(button.dataset.tsDice).toEqual("4d6");
    });

    test("dice value inside tooltip and modifier outside", () => {
      // Healing Hands PHB-2024
      document.body.innerHTML = `<div><div class="styles_snippet__CzYh+ ct-feature-snippet--racial-trait"><div class="styles_heading__yD0Cm ">Healing Hands<span><span class="styles_metaItem__wEnyV "><p class="styles_reference__4pmEk" data-tooltip-id="4d5e6310-ff91-4f6a-a077-3e93c42e9a21" data-tooltip-delay-show="1500"><span class="styles_name__mZMFY">PHB-2024</span><span>, pg. 186</span></p><div class="Tooltip_container__20y9m"></div></span></span></div><div class="styles_content__VHVQW"><div class="ddbc-snippet  ddbc-snippet--parsed"><div class="jsx-parser ddbc-snippet__content"><p>Once per Long Rest as a Magic action, you touch a creature and they regain <strong><span class="ddbc-tooltip  ddbc-tooltip--dark-mode" data-tippy="" data-original-title="proficiency#unsigned"><span class="ddbc-snippet__tag">2</span></span>d4</strong> HP.</p></div></div></div><div class="styles_extra__BgeMp"><div class="ct-feature-snippet__actions"><div class="ct-feature-snippet__action"><div class="ct-feature-snippet__action-summary ">Healing Hands: 1 Action</div><div class="ct-feature-snippet__action-limited"><div class="ct-feature-snippet__limited-use "><div class="ct-feature-snippet__limited-use-usages"><div class="ct-slot-manager ct-slot-manager--size-small"><div role="checkbox" aria-checked="false" aria-label="use" class="ct-slot-manager__slot ct-slot-manager__slot--interactive"></div></div></div><div class="ct-feature-snippet__limited-use-sep">/</div><div class="ct-feature-snippet__limited-use-reset">Long Rest</div></div></div></div></div></div></div></div>`;

      const textNodes = getTextNodes(document.body);
      expect(textNodes.length).toEqual(2);

      for (const node of textNodes) {
        embedInText(node);
      }

      const button = document.querySelector("button");
      expect(button.className).toEqual(
        "integrated-dice__container tales-beyond-extension",
      );
      expect(button.dataset.tsLabel).toEqual("Healing Hands");
      expect(button.dataset.tsDice).toEqual("2d4");
    });

    test("dice value outside tooltip and modifier inside", () => {
      // Second Wind PHB
      document.body.innerHTML = `<div class="styles_snippet__CzYh+ ct-feature-snippet--class"><div class="styles_heading__yD0Cm styles_headingDarkMode__YO4Ql">Second Wind<span><span class="styles_metaItem__wEnyV styles_metaItemDarkMode__oscOW"><p class="styles_reference__4pmEk" data-tooltip-id="585c543b-4250-4679-b96d-a11df2926a8e" data-tooltip-delay-show="1500"><span class="styles_name__mZMFY">PHB</span><span>, pg. 72</span></p><div class="Tooltip_container__20y9m"></div></span></span></div><div class="styles_content__VHVQW"><div class="ddbc-snippet  ddbc-snippet--parsed ddbc-snippet--dark-mode"><div class="jsx-parser ddbc-snippet__content"><p>Once per short rest, you can use a bonus action to regain 1d10 + <span class="ddbc-tooltip  ddbc-tooltip--dark-mode" data-tippy="" data-original-title="classlevel"><span class="ddbc-snippet__tag">3</span></span> HP.</p></div></div></div><div class="styles_extra__BgeMp" style="border-color: rgb(79, 126, 97);"><div class="ct-feature-snippet__actions"><div class="ct-feature-snippet__action"><div class="ct-feature-snippet__action-summary ct-feature-snippet__action-summary--dark-mode">Second Wind: 1 Bonus Action</div><div class="ct-feature-snippet__action-limited"><div class="ct-feature-snippet__limited-use ct-feature-snippet__limited-use--dark-mode"><div class="ct-feature-snippet__limited-use-usages"><div class="ct-slot-manager ct-slot-manager--size-small"><div role="checkbox" aria-checked="false" aria-label="use" class="ct-slot-manager__slot ct-slot-manager__slot--interactive"></div></div></div><div class="ct-feature-snippet__limited-use-sep">/</div><div class="ct-feature-snippet__limited-use-reset">Short Rest</div></div></div></div></div></div></div>`;

      const textNodes = getTextNodes(document.body);
      expect(textNodes.length).toEqual(1);

      for (const node of textNodes) {
        embedInText(node);
      }

      const button = document.querySelector("button");
      expect(button.className).toEqual(
        "integrated-dice__container tales-beyond-extension",
      );
      expect(button.dataset.tsLabel).toEqual("Second Wind");
      expect(button.dataset.tsDice).toEqual("1d10+3");
    });
  });
});
