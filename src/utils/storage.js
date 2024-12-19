const VERSION = 1;
const defaultOptions = {
  version: VERSION,
  contextMenuEnabled: true,
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
};

let settings = {};
let localStorageGet;
let getOptions;
let saveOption;

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
    settings = { ...defaultOptions, ...userOptions };
    return settings;
  };

  saveOption = async (key, value) => {
    await chrome.storage.local.set({ [key]: value });
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

  // TODO: Implement `keys` argument
  getOptions = async (keys) => {
    const userOptions = JSON.parse(
      (await TS.localStorage.global.getBlob()) || "{}",
    );

    settings = { ...defaultOptions, ...userOptions };
    return settings;
  };
}

export { getOptions, saveOption, settings };
