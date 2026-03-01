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
        deactivatedCharacters: [],
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

    default:
      return userOptions;
  }
};
