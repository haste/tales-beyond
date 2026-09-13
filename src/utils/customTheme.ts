import {
  type SettingCustomTheme,
  type Settings,
  saveOption,
} from "~/storage/settings";

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

type ColorField = Exclude<keyof SettingCustomTheme, "enabled">;

const colorFields: ColorField[] = [
  "primaryColor",
  "lightHoverColor",
  "darkHoverColor",
];

const normalizeHex = (value: string): string | undefined => {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!HEX_PATTERN.test(withHash)) {
    return undefined;
  }
  return withHash.toLowerCase();
};

export const addCustomThemeUI = (settings: Settings, parent: HTMLElement) => {
  const template = document.querySelector<HTMLTemplateElement>(
    "#template-custom-theme",
  );
  if (!template) {
    throw new Error("template-custom-theme is missing");
  }

  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const root = fragment.querySelector<HTMLElement>(".custom-theme");
  const enabledInput = fragment.querySelector<HTMLInputElement>(
    ".custom-theme-enabled",
  );
  if (!(root && enabledInput)) {
    throw new Error("custom-theme template is malformed");
  }

  const current: SettingCustomTheme = { ...settings.customTheme };

  const previewButtons = fragment.querySelectorAll<HTMLElement>(
    ".custom-theme-preview-button",
  );

  const updatePreview = () => {
    for (const button of previewButtons) {
      button.style.setProperty("--preview-border", current.primaryColor);
      button.style.setProperty(
        "--preview-light-hover",
        current.lightHoverColor,
      );
      button.style.setProperty("--preview-dark-hover", current.darkHoverColor);
    }
    root.dataset.enabled = String(current.enabled);
  };

  const persist = () => {
    saveOption("customTheme", { ...current });
  };

  enabledInput.checked = current.enabled;
  enabledInput.ariaChecked = String(current.enabled);
  enabledInput.addEventListener("change", () => {
    current.enabled = enabledInput.checked;
    enabledInput.ariaChecked = String(current.enabled);
    updatePreview();
    persist();
  });

  for (const field of colorFields) {
    const picker = fragment.querySelector<HTMLElement>(
      `.custom-theme-picker[data-field="${field}"]`,
    );
    if (!picker) {
      throw new Error(`custom-theme picker for ${field} is missing`);
    }

    const colorInput = picker.querySelector<HTMLInputElement>(
      ".custom-theme-color",
    );
    const hexInput =
      picker.querySelector<HTMLInputElement>(".custom-theme-hex");
    if (!(colorInput && hexInput)) {
      throw new Error(`custom-theme inputs for ${field} are missing`);
    }

    const initial = current[field];
    colorInput.value = initial;
    hexInput.value = initial;

    const apply = (next: string) => {
      current[field] = next;
      colorInput.value = next;
      hexInput.value = next;
      updatePreview();
      persist();
    };

    colorInput.addEventListener("input", () => {
      apply(colorInput.value.toLowerCase());
    });

    hexInput.addEventListener("change", () => {
      const next = normalizeHex(hexInput.value);
      if (next === undefined) {
        hexInput.value = current[field];
        return;
      }
      apply(next);
    });
  }

  updatePreview();
  parent.appendChild(fragment);
};
