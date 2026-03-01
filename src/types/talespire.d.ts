interface RollDescriptor {
  name: string;
  roll: string;
}

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
