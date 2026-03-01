import { describe, expect, mock, test } from "bun:test";
import type { StorageAdapter } from "~/storage/adapter";

function createMockAdapter(
  data: Record<string, unknown> = {},
): StorageAdapter & { data: Record<string, unknown> } {
  const store = { ...data };
  return {
    data: store,
    load() {
      return Promise.resolve({ ...store });
    },
    save(state: object) {
      Object.assign(store, state);
      return Promise.resolve();
    },
  };
}

// Adapter starts with stored data to test merge on first load
const mockAdapter = createMockAdapter({
  version: 5,
  contextMenuEnabled: false,
});

mock.module("~/storage/adapter", () => ({
  adapter: mockAdapter,
}));

const { getOptions, saveOption, saveOptions } = await import(
  "~/storage/settings"
);

describe("getOptions", () => {
  test("merges stored values with defaults on first load", async () => {
    const options = await getOptions();
    expect(options.contextMenuEnabled).toBe(false);
    expect(options.version).toBe(5);
    // Fields not in adapter come from defaults
    expect(options.modMagicMissile).toBe(true);
  });

  test("returns cached settings on subsequent calls", async () => {
    const first = await getOptions();
    // Mutate adapter data behind the scenes
    mockAdapter.data.contextMenuEnabled = true;
    const second = await getOptions();
    // Should return cached value, not re-read from adapter
    expect(second.contextMenuEnabled).toBe(false);
    expect(first).toBe(second);
  });
});

describe("saveOption", () => {
  test("updates storage and cached settings", async () => {
    await saveOption("modChaosBolt", false);
    expect(mockAdapter.data.modChaosBolt).toBe(false);
    const options = await getOptions();
    expect(options.modChaosBolt).toBe(false);
  });
});

describe("saveOptions", () => {
  test("updates multiple keys in storage and cache", async () => {
    await saveOptions({
      modMagicMissile: false,
      modTollTheDead: false,
    });
    expect(mockAdapter.data.modMagicMissile).toBe(false);
    expect(mockAdapter.data.modTollTheDead).toBe(false);
    const options = await getOptions();
    expect(options.modMagicMissile).toBe(false);
    expect(options.modTollTheDead).toBe(false);
  });
});
