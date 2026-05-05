import type { Settings } from "~/storage/settings";

export const migrateUserOptions = (
  userOptions: Partial<Settings>,
): Partial<Settings> => {
  switch (userOptions?.version) {
    case 1:
      return migrateUserOptions({
        ...userOptions,
        version: 2,
        prefixWithCharacterName: "initials",
      });

    case 2:
      return migrateUserOptions({
        ...userOptions,
        version: 3,
      });

    case 3:
      return migrateUserOptions({
        ...userOptions,
        version: 4,
        modSpellfireFlare: true,
      });

    case 4:
      return migrateUserOptions({
        ...userOptions,
        version: 5,
        prefixWithCharacterName:
          userOptions.prefixWithCharacterName ?? "initials",
      });

    case 5: {
      const legacy = userOptions as Partial<Settings> & {
        deactivatedCharacters?: { id: string; name: string }[];
      };
      const { deactivatedCharacters, ...rest } = legacy;
      return migrateUserOptions({
        ...rest,
        version: 6,
        characters: Object.fromEntries(
          (deactivatedCharacters ?? []).map(({ id, name }) => [
            id,
            { name, deactivated: true, feats: [], skills: [] },
          ]),
        ),
      });
    }

    default:
      return userOptions;
  }
};
