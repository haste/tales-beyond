import { describe, expect, test } from "bun:test";
import { migrateUserOptions } from "~/storage/migrate";
import type { Settings } from "~/storage/settings";

describe("migrateUserOptions", () => {
  describe("individual steps", () => {
    test("v1 → v2: adds prefixWithCharacterName", () => {
      const result = migrateUserOptions({ version: 1 });
      expect(result.version).toBe(5);
      expect(result.prefixWithCharacterName).toBe("initials");
    });

    test("v2 → v3: adds deactivatedCharacters", () => {
      const input = {
        version: 2,
        prefixWithCharacterName: "full",
      } satisfies Partial<Settings>;
      const result = migrateUserOptions(input);
      expect(result.version).toBe(5);
      expect(result.deactivatedCharacters).toEqual([]);
    });

    test("v3 → v4: adds modSpellfireFlare", () => {
      const input = {
        version: 3,
        prefixWithCharacterName: "initials",
        deactivatedCharacters: [],
      } satisfies Partial<Settings>;
      const result = migrateUserOptions(input);
      expect(result.version).toBe(5);
      expect(result.modSpellfireFlare).toBe(true);
    });

    test("v4 → v5: defaults prefixWithCharacterName to initials if absent", () => {
      const input = {
        version: 4,
        deactivatedCharacters: [],
        modSpellfireFlare: true,
      };
      const result = migrateUserOptions(input);
      expect(result.version).toBe(5);
      expect(result.prefixWithCharacterName).toBe("initials");
    });

    test("v4 → v5: preserves existing prefixWithCharacterName", () => {
      const input = {
        version: 4,
        prefixWithCharacterName: "full",
        deactivatedCharacters: [],
        modSpellfireFlare: true,
      } satisfies Partial<Settings>;
      const result = migrateUserOptions(input);
      expect(result.version).toBe(5);
      expect(result.prefixWithCharacterName).toBe("full");
    });
  });

  describe("full chain", () => {
    test("v1 → v5: applies all migrations", () => {
      const result = migrateUserOptions({ version: 1 });
      expect(result).toEqual({
        version: 5,
        prefixWithCharacterName: "initials",
        deactivatedCharacters: [],
        modSpellfireFlare: true,
      });
    });
  });

  describe("edge cases", () => {
    test("current version: passes through unchanged", () => {
      const input = { version: 5, contextMenuEnabled: false };
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
