# Changelog

## 0.22.0 (2025-07-18)

### Bug fixes

 * No longer matches ranges in spells, descriptions, etc.

### Enhancements

 * Character name can now be used as a prefix on dice rolls.

## 0.21.2 (2025-05-20)

### Bug fixes

 * Fixed missing underline styling on context menu items.
 * Fixed context menu not being aligned with the button clicked.
 * Fixed clicking of dice buttons with no labels.

## 0.21.1 (2025-05-19)

### Notes

 * 0.21.0 was tagged, but not fully released.

### Enhancements

 * Added support for Critical Hit damage.
 * The right-click menu is now sensitive to the type of roll.

## 0.20.2 (2025-02-23)

### Bug fixes

 * No longer stops processing monster search page after encountering locked content.
 * Fix dice labels missing on 2014 creatures within sidebar on character sheet after changes made on DNDBeyond.
 * No longer creates dices for movement changes to vehicles.
 * Fix double skill names on 2014 creatures on monsters search and detail page.
 * Improvements to labels on 2024 creatures on monsters search and detail page.

## 0.20.1 (2025-02-15)

### Bug fixes

 * Fix dices buttons no longer working in character pages.

## 0.20.0 (2025-02-15)

### Bug fixes

 * Fixed handling of some negative dice values in 2024 stat block not being converted into dice buttons.

### Enhancements

 * Dice buttons are now added to spell search and detail pages. Monsters within spell descriptions are also supported.

## 0.19.0 (2025-02-05)

### Enhancements

 * Support the new 2024 monster stat block design.

## 0.18.1 (2025-01-27)

### Bug fixes

 * Fix header of actions not being set as dice labels.

## 0.18.0 (2025-01-26)

### Bug fixes

 * Fixed header of features not being set as dice labels after D&D Beyond update.

### Enhancements

 * Enabled right-click menu on monster pages.
 * Healing Hands (2024) (and similar feats) will now correctly include the number of dice.

## 0.17.0 (2024-12-19)

### Bug fixes

 * Dice buttons will no longer be added to item names in the sidebar heading.

### Enhancements

 * It's now possible to right-click dice buttons to roll with Advantage or Disadvantage.

## 0.16.3 (2024-10-25)

### Bug fixes

 * Fix issues with rolling after D&D Beyond updated.

## 0.16.2 (2024-10-19)

### Bug fixes

 * Correctly roll dice without labels when used as a symbiote in TaleSpire.
 * Fix missing label on Initiative rolls on D&D Beyond's mobile layout.

## 0.16.1 (2024-10-11)

### Bug fixes

 * Prevent dice buttons from showing up in item names after D&D Beyond update.

## 0.16.0 (2024-10-06)

### Enhancements

 * Now does a better job of combining dice in text. For example **Hand of Healing** is no longer two separate dice entries.
 * Can now be used as a symbiote in TaleSpire.

## 0.15.0 (2024-09-13)

### Enhancements

 * New spell and action modification:
   - **Infiltrator Armor: Lightning Launcher**: Adds an extra dice button for the once per turn action.
   - **Scorching Ray**: Adds extra dice buttons for multiple rays.

## 0.14.0 (2024-09-07)

### Bug fixes

 * Correctly send d100s to TaleSpire.
 * Dice buttons will no longer be added to item names.

### Enhancements

 * Spell and action modifications have been re-implemented. It does the following:
   - **Chaos Bolt**: Changes the dice to include the missing d6.
   - **Magic Missile**: Adds extra dice buttons for multiple darts.
   - **Melf's Minute Meteors**: Adds an extra dice button for throwing two meteors.
   - **Toll the Dead**: Adds an extra dice button for damaged targets.
   - **Two-Weapon Fighting**: Adds an extra dice button for making bonus attacks with light weapons without positive modifier.
 * The header of features will now be used as dice labels.
 * Second Wind (and similar feats) will now correctly include the modifier.
 * Extension options have now been added for changing modifier key behavior and disabling/enabling spell and action modifications.

## 0.13.2 (2024-07-22)

### Bug fixes

 * Fix Short Rest hit dice button not working.

## 0.13.1 (2024-06-02)

### Bug fixes

 * Fix background color on dice when Underdark Mode is enabled.

## 0.13.0 (2024-06-02)

### Bug fixes

 * Handle *1d10 + your Dexterity modifier* rolls on DNDBeyond's mobile layout.
 * Skills with ADV/DIS now send the correct label instead of Undefined.
 * Stopped sending Undefined instead of empty labels when label wasn't resolved.

### Enhancements

 * Greatly improved labels sent to TaleSpire for EXTRAS.
 * Show a dialog when digital dice aren't enabled.
 * Add ADV/DIS dice when shift is held.
 * Ability dice now work when "Scores Top" setting is used.

## 0.12.0 (2024-05-24)

### Enhancements

 * The appearance of the buttons now follow your DNDBeyond's theme.
 * Refreshing is no longer required when activating digital dice.
 * Dice outside of the description in the sidebar are now clickable.

## 0.11.0 (2024-05-20)

### Bug fixes

 * Fix a problem where the extension would not work in Chrome when themes were used on DNDBeyond.

## 0.10.0 (2024-05-19)

### Bug fixes

 * Hit die under Short Rest now correctly update number of die. Previously it would always stay at one.

## 0.9.0 (2024-05-11)

### Bug fixes

 * Updated extension to work with changes made on DNDBeyond.

### Notes

 * Multi-dart magic missile, off-hand weapon attack and damaged toll of the dead need to be re-implemented.

## 0.8.0 (2024-04-28)

### Enhancements

 * Dice button are now added to the monster search and page.
 * Support +n and similar dice notations in text.
 * Creature name is now included in dice buttons in character sheet sidebar.
 * Add ADV/DIS dice when alt/ctrl is held

## 0.7.0 (2024-04-24)

### Bug fixes

 * Updated extension to work with changes made on DNDBeyond.

## 0.6.0 (2024-04-23)

### Bug fixes

 * Fix multi-dart magic missile not working correctly.

## 0.5.0 (2024-04-21)

### Notes

First public release 🎉.

### Enhancements

 * Add (Saving) to the end of the label for saving throw rolls.
 * Make the appearance of the highlight match native dice when hovering saving throws.
 * Add override for Chaos Bolt to fix missing extra dice on roll.
 * Add dice buttons to sidebar.
 * Add off-hand damage attack for two-handed weapon fighting.
