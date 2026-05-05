import {
  getCharacterRecord,
  isCharacterDeactivated,
  reactivateCharacter,
  setCharacterDeactivated,
  setCharacterFeats,
  setCharacterSkills,
} from "~/storage/characters";

// Default skills to handle extras on mobile without opening the skills tab
const DEFAULT_SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

// Feats consumed by mods
export const trackedFeats = new Set<string>([]);

const readId = (): string | undefined => {
  const match = window.location.pathname.match(
    /^\/characters\/(?<characterId>\d+)\/?$/,
  );
  return match?.groups?.characterId;
};

const readName = (): string | undefined => {
  const heading = document.querySelector(".ddbc-character-tidbits__heading h1");
  const name = heading?.textContent?.trim();
  return name ? name : undefined;
};

const readAbilities = (): Record<string, string> =>
  Array.from(document.querySelectorAll(".ddbc-ability-summary")).reduce<
    Record<string, string>
  >((acc, node) => {
    const stat = node.querySelector(
      ".ddbc-ability-summary__label",
    )?.textContent;
    if (!stat) {
      return acc;
    }

    let modifier = node.querySelector(
      '[class^="styles_numberDisplay"',
    )?.textContent;
    if (!modifier) {
      return acc;
    }

    if (+modifier > 0) {
      modifier = modifier.slice(1);
    }

    acc[stat] = modifier;
    return acc;
  }, {});

const readActionsInCombat = (): string[] =>
  Array.from(document.querySelectorAll(".ct-basic-actions__action"))
    .map((node) => node.textContent)
    .filter((text): text is string => text !== null);

const readSkills = (): string[] =>
  Array.from(
    document.querySelectorAll(".ct-skills__item .ct-skills__col--skill"),
  )
    .map((node) => node.textContent)
    .filter((text): text is string => text !== null);

const readFeats = (): string[] =>
  Array.from(
    document.querySelectorAll(
      '.ct-feature-snippet--feat [class^="styles_heading"]',
    ),
  )
    .map((node) => node.firstChild?.textContent)
    .filter((text): text is string => text !== null);

class Character {
  #name: string | undefined;
  #abilities: Record<string, string> = {};
  #actionsInCombat: string[] = [];
  #skills: string[] = [...DEFAULT_SKILLS];
  #feats: string[] = [];
  #ready: Promise<void>;

  constructor() {
    this.#ready = this.#hydrate();
  }

  async #hydrate() {
    const id = this.getId();
    if (!id) {
      return;
    }

    const record = await getCharacterRecord(id);
    if (!record) {
      return;
    }

    if (record.name && !this.#name) {
      this.#name = record.name;
    }
    if (record.skills.length) {
      this.#skills = record.skills;
    }
    if (record.feats.length) {
      this.#feats = record.feats;
    }
  }

  ready() {
    return this.#ready;
  }

  getId() {
    return readId();
  }

  getName() {
    const fresh = readName();
    if (fresh) {
      this.#name = fresh;
    }
    return this.#name;
  }

  getAbilities() {
    const fresh = readAbilities();
    if (Object.keys(fresh).length) {
      this.#abilities = fresh;
    }
    return this.#abilities;
  }

  getActionsInCombat() {
    const fresh = readActionsInCombat();
    if (fresh.length) {
      this.#actionsInCombat = fresh;
    }
    return this.#actionsInCombat;
  }

  getSkills() {
    const fresh = readSkills();
    if (fresh.length) {
      this.#skills = fresh;
    }
    return this.#skills;
  }

  async refreshSkills() {
    const fresh = readSkills();
    if (!fresh.length) {
      return this.#skills;
    }

    this.#skills = fresh;
    const id = this.getId();
    if (id) {
      await setCharacterSkills(id, fresh);
    }
    return fresh;
  }

  getAbility(name: string) {
    return this.getAbilities()[name];
  }

  hasAction(name: string) {
    return this.getActionsInCombat().includes(name);
  }

  getFeats() {
    return this.#feats;
  }

  hasFeat(name: string) {
    return this.#feats.includes(name);
  }

  async refreshFeats() {
    const fresh = readFeats();
    if (!fresh.length) {
      return this.#feats;
    }

    const filtered = fresh.filter((feat) => trackedFeats.has(feat));
    this.#feats = filtered;
    const id = this.getId();
    if (id) {
      await setCharacterFeats(id, filtered);
    }
    return filtered;
  }

  isDeactivated() {
    const id = this.getId();
    if (!id) {
      return Promise.resolve(false);
    }
    return isCharacterDeactivated(id);
  }

  async deactivate() {
    const id = this.getId();
    const name = this.getName();
    if (!(id && name)) {
      return false;
    }
    await setCharacterDeactivated(id, name, true);
    return true;
  }

  async reactivate() {
    const id = this.getId();
    if (!id) {
      return false;
    }
    await reactivateCharacter(id);
    return true;
  }
}

export const character = new Character();
