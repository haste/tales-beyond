const observers = new Map();

export const namedObserver = (name, callback) => {
  if (observers.has(name)) {
    const existing = observers.get(name);
    existing.disconnect();

    return existing;
  }

  const observer = new MutationObserver(callback);
  observer.name = name;
  observers.set(name, observer);

  return observer;
};
