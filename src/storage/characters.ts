import { getOptions, saveOption } from "~/storage/settings";

export const isCharacterDeactivated = async (characterId: string) => {
  const options = await getOptions();
  return options.deactivatedCharacters.some(({ id }) => id === characterId);
};

export const deactivateCharacter = async (
  characterId: string,
  characterName: string,
) => {
  const options = await getOptions();
  if (options.deactivatedCharacters.some(({ id }) => id === characterId)) {
    return;
  }
  options.deactivatedCharacters.push({ id: characterId, name: characterName });
  await saveOption("deactivatedCharacters", options.deactivatedCharacters);
};

export const reactivateCharacter = async (characterId: string) => {
  const options = await getOptions();
  const deactivatedCharacters = options.deactivatedCharacters.filter(
    ({ id }) => id !== characterId,
  );
  await saveOption("deactivatedCharacters", deactivatedCharacters);
};
