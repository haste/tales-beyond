import { reactivateCharacter } from "~/storage/characters";
import type { DeactivatedCharacter, Settings } from "~/storage/settings";
import { saveOption } from "~/storage/settings";

export const BOOLEAN = Symbol("boolean");
export const DEACTIVATE_CHARACTER = Symbol("deactivatedCharacter");
export const DROPDOWN = Symbol("dropdown");

type SettingsKeyOfType<T> = {
  [K in keyof Settings]-?: Settings[K] extends T ? K : never;
}[keyof Settings];

interface OptionEntryDropdownOption {
  label: string;
  value: string;
}

export interface OptionEntryBoolean {
  type: typeof BOOLEAN;
  id: SettingsKeyOfType<boolean>;
  header: string;
  description: string;
}

export interface OptionEntryDropdown {
  type: typeof DROPDOWN;
  id: SettingsKeyOfType<string>;
  header: string;
  options: OptionEntryDropdownOption[];
}

export interface OptionEntryDeactivatedCharacter {
  type: typeof DEACTIVATE_CHARACTER;
  id: DeactivatedCharacter["id"];
  header: string;
}

export type OptionEntry =
  | OptionEntryBoolean
  | OptionEntryDropdown
  | OptionEntryDeactivatedCharacter;

const addDropdown = (
  settings: Settings,
  parent: HTMLElement,
  entry: OptionEntryDropdown,
) => {
  const dropdownTemplate = document.querySelector<HTMLTemplateElement>(
    "#template-dropdown",
  ) as HTMLTemplateElement;
  const base = dropdownTemplate.content.cloneNode(true) as DocumentFragment;

  const select = base.querySelector("select") as HTMLSelectElement;
  select.addEventListener("change", () => saveOption(entry.id, select.value));
  select.setAttribute("id", entry.id);

  const label = base.querySelector("label") as HTMLLabelElement;
  label.setAttribute("for", entry.id);
  label.textContent = entry.header;

  const currentlySelected = settings[entry.id];
  for (const option of entry.options) {
    select.add(
      new Option(
        option.label,
        option.value,
        false,
        option.value === currentlySelected,
      ),
    );
  }

  parent.appendChild(base);
};

const addDeactivatedCharacter = (
  parent: HTMLElement,
  entry: OptionEntryDeactivatedCharacter,
) => {
  const template = document.querySelector<HTMLTemplateElement>(
    "#template-deactivated-character",
  ) as HTMLTemplateElement;
  const base = template.content.cloneNode(true) as DocumentFragment;

  const label = base.querySelector("label") as HTMLLabelElement;
  label.textContent = entry.header;

  const button = base.querySelector("button") as HTMLButtonElement;
  button.addEventListener("click", async () => {
    await reactivateCharacter(entry.id);
    button.parentElement?.remove();
  });

  parent.append(base);
};

const addCheckbox = (
  settings: Settings,
  parent: HTMLElement,
  entry: OptionEntryBoolean,
) => {
  const checkboxTemplate = document.querySelector<HTMLTemplateElement>(
    "#template-checkbox",
  ) as HTMLTemplateElement;
  const base = checkboxTemplate.content.cloneNode(true) as DocumentFragment;

  const label = base.querySelector("label") as HTMLLabelElement;
  label.setAttribute("for", entry.id);

  const input = base.querySelector("input") as HTMLInputElement;
  input.addEventListener("change", () => saveOption(entry.id, input.checked));
  input.setAttribute("id", entry.id);
  if (settings[entry.id]) {
    input.checked = true;
  }

  const description = base.querySelector(".description") as Element;
  (description.firstElementChild as Element).textContent = entry.header;

  const text = document.createTextNode(entry.description);
  description.appendChild(text);

  parent.append(base);
};

export const addUIElement = (
  settings: Settings,
  parent: HTMLElement,
  entry: OptionEntry,
) => {
  switch (entry.type) {
    case BOOLEAN:
      addCheckbox(settings, parent, entry);
      break;

    case DEACTIVATE_CHARACTER:
      addDeactivatedCharacter(parent, entry);
      break;

    case DROPDOWN:
      addDropdown(settings, parent, entry);
      break;

    default: {
      const _exhaustive: never = entry;
      break;
    }
  }
};
