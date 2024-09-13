const VERSION = 1;
const defaultOptions = {
  version: VERSION,
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

// TODO: Check if this is required when Firefox is moved to Manifest V3
// We wrap this in a Promise so we get the same behavior in Firefox and Chrome
const localStorageGet = (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve(result);
    });
  });
};

export const getOptions = async (keys) => {
  const userOptions = await localStorageGet();
  if (!userOptions?.version) {
    await saveOption("version", VERSION);
  }

  settings = { ...defaultOptions, ...userOptions };
  return settings;
};

export const saveOption = async (key, value) => {
  await chrome.storage.local.set({ [key]: value });
};

export let settings = {};

const init = async () => {
  await getOptions();
  chrome.storage.local.onChanged.addListener((changes) => {
    for (const key of Object.keys(changes)) {
      settings[key] = changes[key].newValue;
    }
  });
};

if (typeof chrome !== "undefined") {
  init();
}
