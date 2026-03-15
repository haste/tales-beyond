export type StorageAdapter = {
  load(): Promise<Record<string, unknown>>;
  save(state: object): Promise<void>;
  listen?(callback: (key: string, value: unknown) => void): void;
};

let adapter: StorageAdapter | undefined;

if (typeof chrome !== "undefined" && chrome.storage) {
  adapter = {
    load() {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (result) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve(result);
        });
      });
    },

    save(state) {
      return chrome.storage.local.set(state);
    },

    listen(callback) {
      chrome.storage.local.onChanged.addListener((changes) => {
        for (const [key, change] of Object.entries(changes)) {
          callback(key, change.newValue);
        }
      });
    },
  };
} else if (typeof TS !== "undefined" && TS.localStorage) {
  let cache: Record<string, unknown> | undefined;
  adapter = {
    async load() {
      cache = JSON.parse((await TS.localStorage.global.getBlob()) || "{}");
      return { ...cache };
    },

    async save(state) {
      const current =
        cache ?? JSON.parse((await TS.localStorage.global.getBlob()) || "{}");
      Object.assign(current, state);
      cache = current;
      await TS.localStorage.global.setBlob(JSON.stringify(current));
    },
  };
}

export { adapter };
