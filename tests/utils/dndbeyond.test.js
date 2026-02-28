import { describe, expect, test } from "bun:test";

import {
  processBlockAbilities,
  processBlockAttributes,
  processBlockTidbits,
  processBlockTraitsAction,
} from "~/utils/dndbeyond";

describe("processBlockAbilities", () => {
  // from D&D Beyond Character v1.69.76
  describe("Character Sheet", () => {
    test("Creature 2014", () => {
      // Aboleth
      document.body.innerHTML = `<div class="styles_stats__09JG6"><div class="styles_stat__NLMSG"><h2 class="styles_statHeading__CdoVq">STR</h2><p class="styles_statScore__D2e+d">21</p><p class="styles_statModifier__htjdl">(+5)</p></div><div class="styles_stat__NLMSG"><h2 class="styles_statHeading__CdoVq">DEX</h2><p class="styles_statScore__D2e+d">9</p><p class="styles_statModifier__htjdl">(-1)</p></div><div class="styles_stat__NLMSG"><h2 class="styles_statHeading__CdoVq">CON</h2><p class="styles_statScore__D2e+d">15</p><p class="styles_statModifier__htjdl">(+2)</p></div><div class="styles_stat__NLMSG"><h2 class="styles_statHeading__CdoVq">INT</h2><p class="styles_statScore__D2e+d">18</p><p class="styles_statModifier__htjdl">(+4)</p></div><div class="styles_stat__NLMSG"><h2 class="styles_statHeading__CdoVq">WIS</h2><p class="styles_statScore__D2e+d">15</p><p class="styles_statModifier__htjdl">(+2)</p></div><div class="styles_stat__NLMSG"><h2 class="styles_statHeading__CdoVq">CHA</h2><p class="styles_statScore__D2e+d">18</p><p class="styles_statModifier__htjdl">(+4)</p></div></div>`;
      processBlockAbilities(document.body, "Aboleth");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(6);

      const [str, dex, con, int, wis, cha] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(str.dataset.tsLabel).toEqual("Aboleth: Strength");
      expect(str.dataset.tsDice).toEqual("1d20+5");

      expect(dex.dataset.tsLabel).toEqual("Aboleth: Dexterity");
      expect(dex.dataset.tsDice).toEqual("1d20-1");

      expect(con.dataset.tsLabel).toEqual("Aboleth: Constitution");
      expect(con.dataset.tsDice).toEqual("1d20+2");

      expect(int.dataset.tsLabel).toEqual("Aboleth: Intelligence");
      expect(int.dataset.tsDice).toEqual("1d20+4");

      expect(wis.dataset.tsLabel).toEqual("Aboleth: Wisdom");
      expect(wis.dataset.tsDice).toEqual("1d20+2");

      expect(cha.dataset.tsLabel).toEqual("Aboleth: Charisma");
      expect(cha.dataset.tsDice).toEqual("1d20+4");
    });

    test("Creature 2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="styles_stats__09JG6"><table class="styles_statTable__DB9si styles_physical__rxR2j"><thead><tr><th></th><th></th><th>Mod</th><th>Save</th></tr></thead><tbody><tr><th>STR</th><td>19</td><td class="styles_modifier__oTi0D">+4</td><td class="styles_modifier__oTi0D">+4</td></tr><tr><th>DEX</th><td>13</td><td class="styles_modifier__oTi0D">+1</td><td class="styles_modifier__oTi0D">+1</td></tr><tr><th>CON</th><td>17</td><td class="styles_modifier__oTi0D">+3</td><td class="styles_modifier__oTi0D">+3</td></tr></tbody></table><table class="styles_statTable__DB9si styles_mental__hVd+c"><thead><tr><th></th><th></th><th>Mod</th><th>Save</th></tr></thead><tbody><tr><th>INT</th><td>2</td><td class="styles_modifier__oTi0D">-4</td><td class="styles_modifier__oTi0D">-4</td></tr><tr><th>WIS</th><td>12</td><td class="styles_modifier__oTi0D">+1</td><td class="styles_modifier__oTi0D">+1</td></tr><tr><th>CHA</th><td>5</td><td class="styles_modifier__oTi0D">-3</td><td class="styles_modifier__oTi0D">-3</td></tr></tbody></table></div>`;
      processBlockAbilities(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(12);

      const [
        strMod,
        strSaving,
        dexMod,
        dexSaving,
        conMod,
        conSaving,
        intMod,
        intSaving,
        wisMod,
        wisSaving,
        chaMod,
        chaSaving,
      ] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(strMod.dataset.tsLabel).toEqual("Allosaurus: Strength");
      expect(strMod.dataset.tsDice).toEqual("1d20+4");

      expect(strSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Strength (Saving)",
      );
      expect(strSaving.dataset.tsDice).toEqual("1d20+4");

      expect(dexMod.dataset.tsLabel).toEqual("Allosaurus: Dexterity");
      expect(dexMod.dataset.tsDice).toEqual("1d20+1");

      expect(dexSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Dexterity (Saving)",
      );
      expect(dexSaving.dataset.tsDice).toEqual("1d20+1");

      expect(conMod.dataset.tsLabel).toEqual("Allosaurus: Constitution");
      expect(conMod.dataset.tsDice).toEqual("1d20+3");

      expect(conSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Constitution (Saving)",
      );
      expect(conSaving.dataset.tsDice).toEqual("1d20+3");

      expect(intMod.dataset.tsLabel).toEqual("Allosaurus: Intelligence");
      expect(intMod.dataset.tsDice).toEqual("1d20-4");

      expect(intSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Intelligence (Saving)",
      );
      expect(intSaving.dataset.tsDice).toEqual("1d20-4");

      expect(wisMod.dataset.tsLabel).toEqual("Allosaurus: Wisdom");
      expect(wisMod.dataset.tsDice).toEqual("1d20+1");

      expect(wisSaving.dataset.tsLabel).toEqual("Allosaurus: Wisdom (Saving)");
      expect(wisSaving.dataset.tsDice).toEqual("1d20+1");

      expect(chaMod.dataset.tsLabel).toEqual("Allosaurus: Charisma");
      expect(chaMod.dataset.tsDice).toEqual("1d20-3");

      expect(chaSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Charisma (Saving)",
      );
      expect(chaSaving.dataset.tsDice).toEqual("1d20-3");
    });
  });

  describe("Monster Detail Page", () => {
    // [2025-02-23] https://www.dndbeyond.com/monsters/16762-aboleth
    test("2014", () => {
      // Aboleth
      document.body.innerHTML = `<div class="mon-stat-block__stat-block"> <div class="mon-stat-block__separator"> <img class="mon-stat-block__separator-img" alt="" src="https://www.dndbeyond.com/file-attachments/0/579/stat-block-header-bar.svg"> </div> <div class="ability-block"> <div class="ability-block__stat ability-block__stat--str"> <div class="ability-block__heading">STR</div> <div class="ability-block__data"> <span class="ability-block__score">21</span> <span class="ability-block__modifier">(+5)</span> </div> </div> <div class="ability-block__stat ability-block__stat--dex"> <div class="ability-block__heading">DEX</div> <div class="ability-block__data"> <span class="ability-block__score">9</span> <span class="ability-block__modifier">(-1)</span> </div> </div> <div class="ability-block__stat ability-block__stat--con"> <div class="ability-block__heading">CON</div> <div class="ability-block__data"> <span class="ability-block__score">15</span> <span class="ability-block__modifier">(+2)</span> </div> </div> <div class="ability-block__stat ability-block__stat--int"> <div class="ability-block__heading">INT</div> <div class="ability-block__data"> <span class="ability-block__score">18</span> <span class="ability-block__modifier">(+4)</span> </div> </div> <div class="ability-block__stat ability-block__stat--wis"> <div class="ability-block__heading">WIS</div> <div class="ability-block__data"> <span class="ability-block__score">15</span> <span class="ability-block__modifier">(+2)</span> </div> </div> <div class="ability-block__stat ability-block__stat--cha"> <div class="ability-block__heading">CHA</div> <div class="ability-block__data"> <span class="ability-block__score">18</span> <span class="ability-block__modifier">(+4)</span> </div> </div> </div> <div class="mon-stat-block__separator"> <img class="mon-stat-block__separator-img" alt="" src="https://www.dndbeyond.com/file-attachments/0/579/stat-block-header-bar.svg"> </div> </div>`;
      processBlockAbilities(document.body, "Aboleth");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(6);

      const [str, dex, con, int, wis, cha] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(str.dataset.tsLabel).toEqual("Aboleth: Strength");
      expect(str.dataset.tsDice).toEqual("1d20+5");

      expect(dex.dataset.tsLabel).toEqual("Aboleth: Dexterity");
      expect(dex.dataset.tsDice).toEqual("1d20-1");

      expect(con.dataset.tsLabel).toEqual("Aboleth: Constitution");
      expect(con.dataset.tsDice).toEqual("1d20+2");

      expect(int.dataset.tsLabel).toEqual("Aboleth: Intelligence");
      expect(int.dataset.tsDice).toEqual("1d20+4");

      expect(wis.dataset.tsLabel).toEqual("Aboleth: Wisdom");
      expect(wis.dataset.tsDice).toEqual("1d20+2");

      expect(cha.dataset.tsLabel).toEqual("Aboleth: Charisma");
      expect(cha.dataset.tsDice).toEqual("1d20+4");
    });

    // [2025-02-23] https://www.dndbeyond.com/monsters/5194879-allosaurus
    test("2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="mon-stat-block-2024__stats"> <table class="stat-table physical"> <thead> <tr> <th> </th><th> </th><th>Mod</th> <th>Save</th> </tr> </thead> <tbody> <tr> <th>STR</th> <td>19</td> <td class="modifier">+4</td> <td class="modifier">+4</td> </tr> <tr> <th>DEX</th> <td>13</td> <td class="modifier">+1</td> <td class="modifier">+1</td> </tr> <tr> <th>CON</th> <td>17</td> <td class="modifier">+3</td> <td class="modifier">+3</td> </tr> </tbody> </table> <table class="stat-table mental"> <thead> <tr> <th> </th><th> </th><th>Mod</th> <th>Save</th> </tr> </thead> <tbody> <tr> <th>INT</th> <td>2</td> <td class="modifier">-4</td> <td class="modifier">-4</td> </tr> <tr> <th>WIS</th> <td>12</td> <td class="modifier">+1</td> <td class="modifier">+1</td> </tr> <tr> <th>CHA</th> <td>5</td> <td class="modifier">-3</td> <td class="modifier">-3</td> </tr> </tbody> </table> </div>`;
      processBlockAbilities(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(12);

      const [
        strMod,
        strSaving,
        dexMod,
        dexSaving,
        conMod,
        conSaving,
        intMod,
        intSaving,
        wisMod,
        wisSaving,
        chaMod,
        chaSaving,
      ] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(strMod.dataset.tsLabel).toEqual("Allosaurus: Strength");
      expect(strMod.dataset.tsDice).toEqual("1d20+4");

      expect(strSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Strength (Saving)",
      );
      expect(strSaving.dataset.tsDice).toEqual("1d20+4");

      expect(dexMod.dataset.tsLabel).toEqual("Allosaurus: Dexterity");
      expect(dexMod.dataset.tsDice).toEqual("1d20+1");

      expect(dexSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Dexterity (Saving)",
      );
      expect(dexSaving.dataset.tsDice).toEqual("1d20+1");

      expect(conMod.dataset.tsLabel).toEqual("Allosaurus: Constitution");
      expect(conMod.dataset.tsDice).toEqual("1d20+3");

      expect(conSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Constitution (Saving)",
      );
      expect(conSaving.dataset.tsDice).toEqual("1d20+3");

      expect(intMod.dataset.tsLabel).toEqual("Allosaurus: Intelligence");
      expect(intMod.dataset.tsDice).toEqual("1d20-4");

      expect(intSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Intelligence (Saving)",
      );
      expect(intSaving.dataset.tsDice).toEqual("1d20-4");

      expect(wisMod.dataset.tsLabel).toEqual("Allosaurus: Wisdom");
      expect(wisMod.dataset.tsDice).toEqual("1d20+1");

      expect(wisSaving.dataset.tsLabel).toEqual("Allosaurus: Wisdom (Saving)");
      expect(wisSaving.dataset.tsDice).toEqual("1d20+1");

      expect(chaMod.dataset.tsLabel).toEqual("Allosaurus: Charisma");
      expect(chaMod.dataset.tsDice).toEqual("1d20-3");

      expect(chaSaving.dataset.tsLabel).toEqual(
        "Allosaurus: Charisma (Saving)",
      );
      expect(chaSaving.dataset.tsDice).toEqual("1d20-3");
    });
  });
});

describe("processBlockAttributes", () => {
  // from D&D Beyond Character v1.69.76
  describe("Character Sheet", () => {
    test("Creature 2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">AC</h2><p>13</p></div><div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">Initiative</h2><p>+1 (11)</p></div><div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">HP</h2><p>51 (6d10+18)</p></div><div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">Speed</h2><p>60 ft.</p></div>`;
      processBlockAttributes(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(2);

      const [initiative, hp] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(initiative.dataset.tsLabel).toEqual("Allosaurus: Initiative");
      expect(initiative.dataset.tsDice).toEqual("1d20+1");

      expect(hp.dataset.tsLabel).toEqual("Allosaurus: HP");
      expect(hp.dataset.tsDice).toEqual("6d10+18");
    });
  });

  describe("Monster Detail Page", () => {
    // [2025-02-23] https://www.dndbeyond.com/monsters/5194879-allosaurus
    test("2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="mon-stat-block-2024__attributes"> <div class="mon-stat-block-2024__attribute"> <span class="mon-stat-block-2024__attribute-label">AC</span> <span class="mon-stat-block-2024__attribute-value"> <span class="mon-stat-block-2024__attribute-data-value"> 13 </span> </span>&nbsp;&nbsp; <span class="mon-stat-block-2024__attribute-label">Initiative</span> <span class="mon-stat-block-2024__attribute-data"> <span class="mon-stat-block-2024__attribute-data-value"> +1 (11) </span> </span> </div> <div class="mon-stat-block-2024__attribute"> <span class="mon-stat-block-2024__attribute-label">HP</span> <span class="mon-stat-block-2024__attribute-data"> <span class="mon-stat-block-2024__attribute-data-value"> 51 </span> <span class="mon-stat-block-2024__attribute-data-extra"> (6d10 + 18) </span> </span> </div> <div class="mon-stat-block-2024__attribute"> <span class="mon-stat-block-2024__attribute-label">Speed</span> <span class="mon-stat-block-2024__attribute-data"> <span class="mon-stat-block-2024__attribute-data-value"> 60 ft. </span> </span> </div> </div>`;
      processBlockAttributes(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(2);

      const [initiative, hp] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(initiative.dataset.tsLabel).toEqual("Allosaurus: Initiative");
      expect(initiative.dataset.tsDice).toEqual("1d20+1");

      expect(hp.dataset.tsLabel).toEqual("Allosaurus: HP");
      expect(hp.dataset.tsDice).toEqual("6d10+18");
    });
  });
});

describe("processBlockTidbits", () => {
  // from D&D Beyond Character v1.69.76
  describe("Character Sheet", () => {
    test("Creature 2014", () => {
      // Aboleth
      const savingThrows = `<div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">Saving Throws</h2><p>CON +6, INT +8, WIS +6</p></div>`;
      const skills = `<div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">Skills</h2><p>History +12, Perception +10</p></div>`;
      document.body.innerHTML = savingThrows + skills;
      processBlockTidbits(document.body, "Aboleth");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(5);

      const [con, int, wis, history, perception] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(con.dataset.tsLabel).toEqual("Aboleth: Constitution (Saving)");
      expect(con.dataset.tsDice).toEqual("1d20+6");

      expect(int.dataset.tsLabel).toEqual("Aboleth: Intelligence (Saving)");
      expect(int.dataset.tsDice).toEqual("1d20+8");

      expect(wis.dataset.tsLabel).toEqual("Aboleth: Wisdom (Saving)");
      expect(wis.dataset.tsDice).toEqual("1d20+6");

      expect(history.dataset.tsLabel).toEqual("Aboleth: History");
      expect(history.dataset.tsDice).toEqual("1d20+12");

      expect(perception.dataset.tsLabel).toEqual("Aboleth: Perception");
      expect(perception.dataset.tsDice).toEqual("1d20+10");
    });

    test("Creature 2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">Skills</h2><p>Perception +3</p></div><div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">Senses</h2><p>Passive Perception 15</p></div><div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">Languages</h2><p>--</p></div><div class="styles_attribute__gAFt6"><h2 class="styles_attributeLabel__jKRBP">CR</h2><p>2 (XP 450; PB +2)</p></div>`;
      processBlockTidbits(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(1);

      const [perception] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(perception.dataset.tsLabel).toEqual("Allosaurus: Perception");
      expect(perception.dataset.tsDice).toEqual("1d20+3");
    });
  });

  describe("Monster Detail Page", () => {
    // [2025-02-23] https://www.dndbeyond.com/monsters/16762-aboleth
    test("2014", () => {
      // Aboleth
      document.body.innerHTML = `<div class="mon-stat-block__tidbits"> <div class="mon-stat-block__tidbit"> <span class="mon-stat-block__tidbit-label">Saving Throws</span> <span class="mon-stat-block__tidbit-data"> CON +6, INT +8, WIS +6 </span> </div> <div class="mon-stat-block__tidbit"> <span class="mon-stat-block__tidbit-label">Skills</span> <span class="mon-stat-block__tidbit-data"> <a class="tooltip-hover skill-tooltip" href="/sources/dnd/free-rules/playing-the-game#Skills" data-tooltip-href="//www.dndbeyond.com/skills/7-tooltip?disable-webm=1&amp;disable-webm=1">History</a> +12, <a class="tooltip-hover skill-tooltip" href="/sources/dnd/free-rules/playing-the-game#Skills" data-tooltip-href="//www.dndbeyond.com/skills/14-tooltip?disable-webm=1&amp;disable-webm=1">Perception</a> +10 </span> </div> <div class="mon-stat-block__tidbit"> <span class="mon-stat-block__tidbit-label">Senses</span> <span class="mon-stat-block__tidbit-data"> <a class="tooltip-hover sense-tooltip" href="/sources/dnd/free-rules/rules-glossary#Darkvision" data-tooltip-href="//www.dndbeyond.com/senses/2-tooltip?disable-webm=1&amp;disable-webm=1">Darkvision</a> 120 ft.,  Passive Perception 20 </span> </div> <div class="mon-stat-block__tidbit"> <span class="mon-stat-block__tidbit-label">Languages</span> <span class="mon-stat-block__tidbit-data"> Deep Speech, Telepathy 120 ft. </span> </div> <div class="mon-stat-block__tidbit-container"> <div class="mon-stat-block__tidbit"> <span class="mon-stat-block__tidbit-label">Challenge</span> <span class="mon-stat-block__tidbit-data"> 10 (5,900 XP) </span> </div> <div class="mon-stat-block__tidbit-spacer"></div> <div class="mon-stat-block__tidbit"> <span class="mon-stat-block__tidbit-label">Proficiency Bonus</span> <span class="mon-stat-block__tidbit-data"> +4 </span> </div> </div> </div>`;
      processBlockTidbits(document.body, "Aboleth");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(5);

      const [con, int, wis, history, perception] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(con.dataset.tsLabel).toEqual("Aboleth: Constitution (Saving)");
      expect(con.dataset.tsDice).toEqual("1d20+6");

      expect(int.dataset.tsLabel).toEqual("Aboleth: Intelligence (Saving)");
      expect(int.dataset.tsDice).toEqual("1d20+8");

      expect(wis.dataset.tsLabel).toEqual("Aboleth: Wisdom (Saving)");
      expect(wis.dataset.tsDice).toEqual("1d20+6");

      expect(history.dataset.tsLabel).toEqual("Aboleth: History");
      expect(history.dataset.tsDice).toEqual("1d20+12");

      expect(perception.dataset.tsLabel).toEqual("Aboleth: Perception");
      expect(perception.dataset.tsDice).toEqual("1d20+10");
    });

    // [2025-02-23] https://www.dndbeyond.com/monsters/5194879-allosaurus
    test("2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="mon-stat-block-2024__tidbits"> <div class="mon-stat-block-2024__tidbit"> <span class="mon-stat-block-2024__tidbit-label">Skills</span> <span class="mon-stat-block-2024__tidbit-data"> <a class="tooltip-hover skill-tooltip" href="/sources/dnd/free-rules/playing-the-game#Skills" data-tooltip-href="//www.dndbeyond.com/skills/14-tooltip?disable-webm=1&amp;disable-webm=1">Perception</a> +5 </span> </div> <div class="mon-stat-block-2024__tidbit"> <span class="mon-stat-block-2024__tidbit-label">Senses</span> <span class="mon-stat-block-2024__tidbit-data"> Passive Perception 15 </span> </div> <div class="mon-stat-block-2024__tidbit"> <span class="mon-stat-block-2024__tidbit-label">Languages</span> <span class="mon-stat-block-2024__tidbit-data"> -- </span> </div> <div class="mon-stat-block-2024__tidbit-container"> <div class="mon-stat-block-2024__tidbit"> <span class="mon-stat-block-2024__tidbit-label">CR</span> <span class="mon-stat-block-2024__tidbit-data"> 2 (XP 450; PB +2) </span> </div> </div> </div>`;
      processBlockTidbits(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(1);

      const [perception] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(perception.dataset.tsLabel).toEqual("Allosaurus: Perception");
      expect(perception.dataset.tsDice).toEqual("1d20+5");
    });
  });
});

describe("processBlockTraitsAction", () => {
  // from D&D Beyond Character v1.69.76
  describe("Character Sheet", () => {
    test("Creature 2014", () => {
      // Aboleth
      document.body.innerHTML = `<div class="styles_descriptions__CQHlb"><h2 class="styles_descriptionHeading__JI-rw">Traits</h2><div class="styles_description__AqcZW"><div class="ddbc-html-content"><p><em><strong>Amphibious.</strong></em> The aboleth can breathe air and water.</p> <p><em><strong>Mucous Cloud.</strong></em> While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 feet of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater.</p> <p><em><strong>Probing Telepathy.</strong></em> If a creature communicates telepathically with the aboleth, the aboleth learns the creature’s greatest desires if the aboleth can see the creature.</p></div><p><strong><em>Familiar</em></strong>. In combat, a familiar rolls its own initiative and acts on its own turn. A familiar can't attack, but it can take other actions as normal. When a familiar drops to 0 hit points, it disappears, leaving behind no physical form.</p></div><h2 class="styles_descriptionHeading__JI-rw">Actions</h2><div class="styles_description__AqcZW"><div class="ddbc-html-content"><p><strong><em>Attack Restriction.</em></strong> A familiar can't attack, but it can take other actions as normal.</p></div><div class="ddbc-html-content"><p><em><strong>Multiattack.</strong></em> The aboleth makes three tentacle attacks.</p> <p><em><strong>Tentacle.</strong> Melee Weapon Attack:</em> +9 to hit, reach 10 ft., one target. <em>Hit:</em> 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature’s skin becomes translucent and slimy, the creature can’t regain hit points unless it is underwater, and the disease can be removed only by heal or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 (1d12) acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed.</p> <p><em><strong>Tail.</strong> Melee Weapon Attack:</em> +9 to hit, reach 10 ft. one target. <em>Hit:</em> 15 (3d6 + 5) bludgeoning damage.</p> <p><em><strong>Enslave (3/Day).</strong></em> The aboleth targets one creature it can see within 30 feet of it. The target must succeed on a DC 14 Wisdom saving throw or be magically charmed by the aboleth until the aboleth dies or until it is on a different plane of existence from the target. The charmed target is under the aboleth’s control and can’t take reactions, and the aboleth and the target can communicate telepathically with each other over any distance.</p> <p>Whenever the charmed target takes damage, the target can repeat the saving throw. On a success, the effect ends. No more than once every 24 hours, the target can also repeat the saving throw when it is at least 1 mile away from the aboleth.</p></div></div><h2 class="styles_descriptionHeading__JI-rw">Legendary Actions</h2><div class="ddbc-html-content styles_description__AqcZW"><p>The aboleth can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature’s turn. The aboleth regains spent legendary actions at the start of its turn.</p> <p><strong>Detect.</strong> The aboleth makes a Wisdom (Perception) check.</p> <p><strong>Tail Swipe.</strong> The aboleth makes one tail attack.</p> <p><strong>Psychic Drain (Costs 2 Actions).</strong> One creature charmed by the aboleth takes 10 (3d6) psychic damage, and the aboleth regains hit points equal to the damage the creature takes.</p></div></div>`;
      processBlockTraitsAction(document.body, "Aboleth");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(7);

      const [
        mucousCloud,
        tentacleHit,
        tentacleDamage,
        tentacleDamageAcid,
        tailHit,
        tailDamage,
        psychicDrainDamage,
      ] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(mucousCloud.dataset.tsLabel).toEqual("Aboleth: Mucous Cloud");
      expect(mucousCloud.dataset.tsDice).toEqual("1d4");

      expect(tentacleHit.dataset.tsLabel).toEqual("Aboleth: Tentacle");
      expect(tentacleHit.dataset.tsDice).toEqual("1d20+9");

      expect(tentacleDamage.dataset.tsLabel).toEqual("Aboleth: Tentacle");
      expect(tentacleDamage.dataset.tsDice).toEqual("2d6+5");

      expect(tentacleDamageAcid.dataset.tsLabel).toEqual("Aboleth: Tentacle");
      expect(tentacleDamageAcid.dataset.tsDice).toEqual("1d12");

      expect(tailHit.dataset.tsLabel).toEqual("Aboleth: Tail");
      expect(tailHit.dataset.tsDice).toEqual("1d20+9");

      expect(tailDamage.dataset.tsLabel).toEqual("Aboleth: Tail");
      expect(tailDamage.dataset.tsDice).toEqual("3d6+5");

      expect(psychicDrainDamage.dataset.tsLabel).toEqual(
        "Aboleth: Psychic Drain",
      );
      expect(psychicDrainDamage.dataset.tsDice).toEqual("3d6");
    });

    test("Creature 2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="styles_descriptions__CQHlb"><h2 class="styles_descriptionHeading__JI-rw">Actions</h2><div class="styles_description__AqcZW"><div class="ddbc-html-content"><p><em><strong>Bite.</strong> Melee Attack Roll:</em> +6, reach 5 ft. <em>Hit:</em> 15 (2d10 + 4) Piercing damage.</p> <p><em><strong>Claws.</strong> Melee Attack Roll:</em> +6, reach 5 ft. <em>Hit:</em> 8 (1d8 + 4) Slashing damage. If the target is a Large or smaller creature and the allosaurus moved 30+ feet straight toward it immediately before the hit, the target has the Prone condition, and the allosaurus can make one Bite attack against it.</p></div></div></div>`;
      processBlockTraitsAction(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(4);

      const [biteHit, biteDamage, clawsHit, clawsDamage] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(biteHit.dataset.tsLabel).toEqual("Allosaurus: Bite");
      expect(biteHit.dataset.tsDice).toEqual("1d20+6");

      expect(biteDamage.dataset.tsLabel).toEqual("Allosaurus: Bite");
      expect(biteDamage.dataset.tsDice).toEqual("2d10+4");

      expect(clawsHit.dataset.tsLabel).toEqual("Allosaurus: Claws");
      expect(clawsHit.dataset.tsDice).toEqual("1d20+6");

      expect(clawsDamage.dataset.tsLabel).toEqual("Allosaurus: Claws");
      expect(clawsDamage.dataset.tsDice).toEqual("1d8+4");
    });
  });

  describe("Monster Detail Page", () => {
    // [2025-02-23] https://www.dndbeyond.com/monsters/16762-aboleth
    test("2014", () => {
      // Aboleth
      document.body.innerHTML = `<div class="mon-stat-block__description-blocks"> <div class="mon-stat-block__description-block"> <div class="mon-stat-block__description-block-heading">Traits</div> <div class="mon-stat-block__description-block-content"> <p><em><strong>Amphibious.</strong></em> The aboleth can breathe air and water.</p> <p><em><strong>Mucous Cloud.</strong></em> While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 feet of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Aboleth: Mucous Cloud" data-ts-dice="1d4" style="padding-left: 4px; padding-right: 4px;">1d4</button> hours. The diseased creature can breathe only underwater.</p> <p><em><strong>Probing Telepathy.</strong></em> If a creature communicates telepathically with the aboleth, the aboleth learns the creature’s greatest desires if the aboleth can see the creature.</p> </div> </div> <div class="mon-stat-block__description-block"> <div class="mon-stat-block__description-block-heading">Actions</div> <div class="mon-stat-block__description-block-content"> <p><em><strong>Multiattack.</strong></em> The aboleth makes three tentacle attacks.</p> <p><em><strong>Tentacle.</strong> Melee Weapon Attack:</em> <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Aboleth: Tentacle" data-ts-dice="1d20+9" style="padding-left: 4px; padding-right: 4px;">+9</button> to hit, reach 10 ft., one target. <em>Hit:</em> 12 <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Aboleth: Tentacle" data-ts-dice="2d6+5" style="padding-left: 4px; padding-right: 4px;">(2d6 + 5)</button> bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature’s skin becomes translucent and slimy, the creature can’t regain hit points unless it is underwater, and the disease can be removed only by <a class="tooltip-hover spell-tooltip" href="/spells/2139-heal" data-tooltip-href="//www.dndbeyond.com/spells/2139-tooltip?disable-webm=1">heal</a> or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Aboleth: Tentacle" data-ts-dice="1d12" style="padding-left: 4px; padding-right: 4px;">(1d12)</button> acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed.</p> <p><em><strong>Tail.</strong> Melee Weapon Attack:</em> <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Aboleth: Tail" data-ts-dice="1d20+9" style="padding-left: 4px; padding-right: 4px;">+9</button> to hit, reach 10 ft. one target. <em>Hit:</em> 15 <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Aboleth: Tail" data-ts-dice="3d6+5" style="padding-left: 4px; padding-right: 4px;">(3d6 + 5)</button> bludgeoning damage.</p> <p><em><strong>Enslave (3/Day).</strong></em> The aboleth targets one creature it can see within 30 feet of it. The target must succeed on a DC 14 Wisdom saving throw or be magically <a class="tooltip-hover condition-tooltip" href="/sources/dnd/free-rules/rules-glossary#CharmedCondition" data-tooltip-href="//www.dndbeyond.com/conditions/2-tooltip?disable-webm=1">charmed</a> by the aboleth until the aboleth dies or until it is on a different plane of existence from the target. The <a class="tooltip-hover condition-tooltip" href="/sources/dnd/free-rules/rules-glossary#CharmedCondition" data-tooltip-href="//www.dndbeyond.com/conditions/2-tooltip?disable-webm=1">charmed</a> target is under the aboleth’s control and can’t take reactions, and the aboleth and the target can communicate telepathically with each other over any distance.</p> <p>Whenever the <a class="tooltip-hover condition-tooltip" href="/sources/dnd/free-rules/rules-glossary#CharmedCondition" data-tooltip-href="//www.dndbeyond.com/conditions/2-tooltip?disable-webm=1">charmed</a> target takes damage, the target can repeat the saving throw. On a success, the effect ends. No more than once every 24 hours, the target can also repeat the saving throw when it is at least 1 mile away from the aboleth.</p> </div> </div> <div class="mon-stat-block__description-block"> <div class="mon-stat-block__description-block-heading">Legendary Actions</div> <div class="mon-stat-block__description-block-content"> <p>The aboleth can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature’s turn. The aboleth regains spent legendary actions at the start of its turn.</p> <p><strong>Detect.</strong> The aboleth makes a Wisdom (<a class="tooltip-hover skill-tooltip" href="/sources/dnd/free-rules/playing-the-game#Skills" data-tooltip-href="//www.dndbeyond.com/skills/14-tooltip?disable-webm=1">Perception</a>) check.</p> <p><strong>Tail Swipe.</strong> The aboleth makes one tail attack.</p> <p><strong>Psychic Drain (Costs 2 Actions).</strong> One creature <a class="tooltip-hover condition-tooltip" href="/sources/dnd/free-rules/rules-glossary#CharmedCondition" data-tooltip-href="//www.dndbeyond.com/conditions/2-tooltip?disable-webm=1">charmed</a> by the aboleth takes 10 <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Aboleth: Psychic Drain" data-ts-dice="3d6" style="padding-left: 4px; padding-right: 4px;">(3d6)</button> psychic damage, and the aboleth regains hit points equal to the damage the creature takes.</p> </div> </div> </div>`;
      processBlockTraitsAction(document.body, "Aboleth");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(7);

      const [
        mucousCloud,
        tentacleHit,
        tentacleDamage,
        tentacleDamageAcid,
        tailHit,
        tailDamage,
        psychicDrainDamage,
      ] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(mucousCloud.dataset.tsLabel).toEqual("Aboleth: Mucous Cloud");
      expect(mucousCloud.dataset.tsDice).toEqual("1d4");

      expect(tentacleHit.dataset.tsLabel).toEqual("Aboleth: Tentacle");
      expect(tentacleHit.dataset.tsDice).toEqual("1d20+9");

      expect(tentacleDamage.dataset.tsLabel).toEqual("Aboleth: Tentacle");
      expect(tentacleDamage.dataset.tsDice).toEqual("2d6+5");

      expect(tentacleDamageAcid.dataset.tsLabel).toEqual("Aboleth: Tentacle");
      expect(tentacleDamageAcid.dataset.tsDice).toEqual("1d12");

      expect(tailHit.dataset.tsLabel).toEqual("Aboleth: Tail");
      expect(tailHit.dataset.tsDice).toEqual("1d20+9");

      expect(tailDamage.dataset.tsLabel).toEqual("Aboleth: Tail");
      expect(tailDamage.dataset.tsDice).toEqual("3d6+5");

      expect(psychicDrainDamage.dataset.tsLabel).toEqual(
        "Aboleth: Psychic Drain",
      );
      expect(psychicDrainDamage.dataset.tsDice).toEqual("3d6");
    });

    // [2025-02-23] https://www.dndbeyond.com/monsters/5194879-allosaurus
    test("2024", () => {
      // Allosaurus
      document.body.innerHTML = `<div class="mon-stat-block-2024__description-blocks"> <div class="mon-stat-block-2024__description-block"> <div class="mon-stat-block-2024__description-block-heading">Actions</div> <div class="mon-stat-block-2024__description-block-content"> <p><em><strong>Bite.</strong> Melee Attack Roll:</em> <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Allosaurus: Bite" data-ts-dice="1d20+6" style="padding-left: 4px; padding-right: 4px;">+6</button>, reach 5 ft. <em>Hit:</em> 15 <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Allosaurus: Bite" data-ts-dice="2d10+4" style="padding-left: 4px; padding-right: 4px;">(2d10 + 4)</button> Piercing damage.</p> <p><em><strong>Claws.</strong> Melee Attack Roll:</em> <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Allosaurus: Claws" data-ts-dice="1d20+6" style="padding-left: 4px; padding-right: 4px;">+6</button>, reach 5 ft. <em>Hit:</em> 8 <button class="integrated-dice__container tales-beyond-extension" data-ts-label="Allosaurus: Claws" data-ts-dice="1d8+4" style="padding-left: 4px; padding-right: 4px;">(1d8 + 4)</button> Slashing damage. If the target is a Large or smaller creature and the allosaurus moved 30+ feet straight toward it immediately before the hit, the target has the <a class="tooltip-hover condition-tooltip" href="/sources/dnd/free-rules/rules-glossary#ProneCondition" data-tooltip-href="//www.dndbeyond.com/conditions/12-tooltip?disable-webm=1&amp;disable-webm=1">Prone</a> condition, and the allosaurus can make one Bite attack against it.</p> </div> </div> </div>`;
      processBlockTraitsAction(document.body, "Allosaurus");

      const nodes = document.body.querySelectorAll("button");
      expect(nodes).toHaveLength(4);

      const [biteHit, biteDamage, clawsHit, clawsDamage] = nodes;

      for (const node of nodes) {
        expect(node.className).toEqual(
          "integrated-dice__container tales-beyond-extension",
        );
      }

      expect(biteHit.dataset.tsLabel).toEqual("Allosaurus: Bite");
      expect(biteHit.dataset.tsDice).toEqual("1d20+6");

      expect(biteDamage.dataset.tsLabel).toEqual("Allosaurus: Bite");
      expect(biteDamage.dataset.tsDice).toEqual("2d10+4");

      expect(clawsHit.dataset.tsLabel).toEqual("Allosaurus: Claws");
      expect(clawsHit.dataset.tsDice).toEqual("1d20+6");

      expect(clawsDamage.dataset.tsLabel).toEqual("Allosaurus: Claws");
      expect(clawsDamage.dataset.tsDice).toEqual("1d8+4");
    });
  });
});
