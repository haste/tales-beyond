import { adapter } from "~/storage/adapter";
import { migrateUserOptions } from "~/storage/migrate";

export interface DeactivatedCharacter {
  id: string;
  name: string;
}

export type SettingModifierAction = "adv" | "adv-dis" | "dis" | "crit" | "none";
export type SettingCharacterNamePrefix =
  | "first"
  | "full"
  | "initials"
  | "last"
  | "none";

export interface Settings {
  version: number;
  contextMenuEnabled: boolean;
  deactivatedCharacters: DeactivatedCharacter[];
  modifierKeyAlt: SettingModifierAction;
  modifierKeyCtrl: SettingModifierAction;
  modifierKeyShift: SettingModifierAction;
  modChaosBolt: boolean;
  modInfiltratorArmorLightningLauncher: boolean;
  modMagicMissile: boolean;
  modMelfsMinuteMeteors: boolean;
  modScorchingRay: boolean;
  modSpellfireFlare: boolean;
  modTollTheDead: boolean;
  modTwoWeaponLightOffhand: boolean;
  prefixWithCharacterName: SettingCharacterNamePrefix;
  symbioteURL?: string;
}

const VERSION = 5;

const defaultOptions: Settings = {
  version: VERSION,
  contextMenuEnabled: true,
  deactivatedCharacters: [],
  modifierKeyAlt: "adv-dis",
  modifierKeyCtrl: "adv-dis",
  modifierKeyShift: "adv-dis",
  modChaosBolt: true,
  modInfiltratorArmorLightningLauncher: true,
  modMagicMissile: true,
  modMelfsMinuteMeteors: true,
  modScorchingRay: true,
  modSpellfireFlare: true,
  modTollTheDead: true,
  modTwoWeaponLightOffhand: true,
  prefixWithCharacterName: "none",
};

let settings: Settings | undefined;
let loading: Promise<Settings> | undefined;

const load = async (): Promise<Settings> => {
  const stored = (await adapter?.load()) ?? { ...defaultOptions };
  const migrated = migrateUserOptions(stored as Partial<Settings>);
  settings = { ...defaultOptions, ...migrated };
  await adapter?.save(settings);

  if (adapter?.listen) {
    adapter.listen((key, value) => {
      Object.assign(settings as Settings, { [key]: value });
    });
  }

  return settings;
};

export const getOptions = (): Promise<Settings> => {
  if (settings) {
    return Promise.resolve(settings);
  }
  if (!loading) {
    loading = load();
  }
  return loading;
};

export const saveOption = async <K extends keyof Settings>(
  key: K,
  value: Settings[K],
) => {
  const s = await getOptions();
  s[key] = value;
  await adapter?.save({ [key]: value });
};

export const saveOptions = async (value: Partial<Settings>) => {
  const s = await getOptions();
  Object.assign(s, value);
  await adapter?.save(value);
};
