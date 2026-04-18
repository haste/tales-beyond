type RollDescriptor = {
  name: string;
  roll: string;
};

type SymbioteStateChangeEvent = {
  kind:
    | "hasInitialized"
    | "willEnterBackground"
    | "hasEnteredForeground"
    | "willShutdown";
};

declare const TS: {
  localStorage: {
    global: {
      getBlob(): Promise<string>;
      setBlob(value: string): Promise<void>;
      deleteBlob(): Promise<void>;
    };
  };
  dice: {
    putDiceInTray(
      rollDescriptors: RollDescriptor[],
      quietResults?: boolean,
    ): string;
  };
};
