import type { CharacterRecord } from "~/storage/settings";
import { getOptions, saveOption } from "~/storage/settings";

const emptyRecord: CharacterRecord = {
  name: "",
  deactivated: false,
  feats: [],
  skills: [],
};

export const getCharacterRecord = async (
  id: string,
): Promise<CharacterRecord | undefined> => {
  const options = await getOptions();
  return options.characters[id];
};

export const updateCharacterRecord = async (
  id: string,
  patch: Partial<CharacterRecord>,
) => {
  const options = await getOptions();
  const existing = options.characters[id] ?? emptyRecord;
  options.characters = {
    ...options.characters,
    [id]: { ...existing, ...patch },
  };
  await saveOption("characters", options.characters);
};

export const isCharacterDeactivated = async (id: string) => {
  const record = await getCharacterRecord(id);
  return record?.deactivated ?? false;
};

export const setCharacterDeactivated = async (
  id: string,
  name: string,
  deactivated: boolean,
) => {
  await updateCharacterRecord(id, { name, deactivated });
};

export const reactivateCharacter = async (id: string) => {
  await updateCharacterRecord(id, { deactivated: false });
};

export const setCharacterFeats = async (id: string, feats: string[]) => {
  await updateCharacterRecord(id, { feats });
};

export const setCharacterSkills = async (id: string, skills: string[]) => {
  await updateCharacterRecord(id, { skills });
};
