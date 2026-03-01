type NamedMutationObserver = MutationObserver & { name: string };

const observers = new Map<string, NamedMutationObserver>();

export const namedObserver = (name: string, callback: MutationCallback) => {
  const existing = observers.get(name);
  if (existing) {
    existing.disconnect();
    return existing;
  }

  const observer = new MutationObserver(callback) as NamedMutationObserver;
  observer.name = name;
  observers.set(name, observer);

  return observer;
};
