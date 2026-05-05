import { describe, expect, test } from "bun:test";
import { migrateUserOptions } from "~/storage/migrate";
import type { Settings } from "~/storage/settings";

describe("migrateUserOptions", () => {
  describe("individual steps", () => {
    test("v1 → v2: adds prefixWithCharacterName", () => {
      const result = migrateUserOptions({ version: 1 });
      expect(result.version).toBe(6);
      expect(result.prefixWithCharacterName).toBe("initials");
    });

    test("v3 → v4: adds modSpellfireFlare", () => {
      const input = {
        version: 3,
        prefixWithCharacterName: "initials",
      } satisfies Partial<Settings>;
      const result = migrateUserOptions(input);
      expect(result.version).toBe(6);
      expect(result.modSpellfireFlare).toBe(true);
    });

    test("v4 → v5: defaults prefixWithCharacterName to initials if absent", () => {
      const input = {
        version: 4,
        modSpellfireFlare: true,
      };
      const result = migrateUserOptions(input);
      expect(result.version).toBe(6);
      expect(result.prefixWithCharacterName).toBe("initials");
    });

    test("v4 → v5: preserves existing prefixWithCharacterName", () => {
      const input = {
        version: 4,
        prefixWithCharacterName: "full",
        modSpellfireFlare: true,
      } satisfies Partial<Settings>;
      const result = migrateUserOptions(input);
      expect(result.version).toBe(6);
      expect(result.prefixWithCharacterName).toBe("full");
    });

    test("v5 → v6: converts deactivatedCharacters to characters record", () => {
      const input = {
        version: 5,
        prefixWithCharacterName: "initials",
        modSpellfireFlare: true,
        deactivatedCharacters: [
          { id: "1", name: "Alice" },
          { id: "2", name: "Bob" },
        ],
      } as Partial<Settings> & {
        deactivatedCharacters: { id: string; name: string }[];
      };
      const result = migrateUserOptions(input);
      expect(result.version).toBe(6);
      expect(result.characters).toEqual({
        "1": { name: "Alice", deactivated: true, feats: [], skills: [] },
        "2": { name: "Bob", deactivated: true, feats: [], skills: [] },
      });
      expect(
        (result as Partial<Settings> & { deactivatedCharacters?: unknown })
          .deactivatedCharacters,
      ).toBeUndefined();
    });

    test("v5 → v6: empty when no deactivatedCharacters present", () => {
      const input = {
        version: 5,
        prefixWithCharacterName: "initials",
        modSpellfireFlare: true,
      } satisfies Partial<Settings>;
      const result = migrateUserOptions(input);
      expect(result.version).toBe(6);
      expect(result.characters).toEqual({});
    });
  });

  describe("full chain", () => {
    test("v1 → v6: applies all migrations", () => {
      const result = migrateUserOptions({ version: 1 });
      expect(result).toEqual({
        version: 6,
        prefixWithCharacterName: "initials",
        modSpellfireFlare: true,
        characters: {},
      });
    });
  });

  describe("edge cases", () => {
    test("current version: passes through unchanged", () => {
      const input = { version: 6, contextMenuEnabled: false };
      const result = migrateUserOptions(input);
      expect(result).toEqual(input);
    });

    test("unknown future version: passes through unchanged", () => {
      const input = { version: 99 };
      const result = migrateUserOptions(input);
      expect(result).toEqual(input);
    });

    test("empty input: returns as-is", () => {
      const result = migrateUserOptions({});
      expect(result).toEqual({});
    });
  });
});
