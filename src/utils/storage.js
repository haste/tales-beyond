const VERSION = 3;
const defaultOptions = {
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
  modTollTheDead: true,
  modTwoWeaponLightOffhand: true,
  prefixWithCharacterName: "none",
};

let settings = {};
let localStorageGet;
let getOptions;
let saveOption;
let saveOptions;

const migrateUserOptions = async (userOptions) => {
  switch (userOptions?.version) {
    case 1:
      return migrateUserOptions({
        ...userOptions,
        version: 2,
        previousCharacterName: "initials",
      });

    case 2:
      return migrateUserOptions({
        ...userOptions,
        version: 3,
        deactivatedCharacters: [],
      });

    default:
      await saveOptions(userOptions);
      return userOptions;
  }
};

if (typeof chrome !== "undefined" && chrome.storage) {
  // TODO: Check if this is required when Firefox is moved to Manifest V3
  // We wrap this in a Promise so we get the same behavior in Firefox and Chrome
  localStorageGet = (keys) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        resolve(result);
      });
    });
  };

  getOptions = async (keys) => {
    const userOptions = await localStorageGet(keys);
    settings = {
      ...defaultOptions,
      ...(await migrateUserOptions(userOptions)),
    };
    return settings;
  };

  saveOption = async (key, value) => {
    await chrome.storage.local.set({ [key]: value });
  };

  saveOptions = async (value) => {
    await chrome.storage.local.set(value);
  };

  const init = async () => {
    await getOptions();
    chrome.storage.local.onChanged.addListener((changes) => {
      for (const key of Object.keys(changes)) {
        settings[key] = changes[key].newValue;
      }
    });
  };

  init();
} else if (typeof TS !== "undefined" && TS.localStorage) {
  saveOption = async (key, value) => {
    settings[key] = value;
    await TS.localStorage.global.setBlob(JSON.stringify(settings));
  };

  saveOptions = async (value) => {
    settings = value;
    await TS.localStorage.global.setBlob(JSON.stringify(settings));
  };

  // TODO: Implement `keys` argument
  getOptions = async (_keys) => {
    const userOptions = JSON.parse(
      (await TS.localStorage.global.getBlob()) || "{}",
    );

    settings = {
      ...defaultOptions,
      ...(await migrateUserOptions(userOptions)),
    };
    return settings;
  };
}

export { getOptions, saveOption, saveOptions, settings };
