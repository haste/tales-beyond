import Pickr from "@simonwep/pickr";
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
  let activePicker: Pickr | undefined;

  const updatePreview = () => {
    root.style.setProperty("--preview-border", current.primaryColor);
    root.style.setProperty("--preview-light-hover", current.lightHoverColor);
    root.style.setProperty("--preview-dark-hover", current.darkHoverColor);
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
    if (!current.enabled) {
      activePicker?.hide();
    }
    persist();
  });

  updatePreview();
  parent.appendChild(fragment);

  for (const field of colorFields) {
    const picker = root.querySelector<HTMLElement>(
      `.custom-theme-picker[data-field="${field}"]`,
    );
    if (!picker) {
      throw new Error(`custom-theme picker for ${field} is missing`);
    }

    const colorElement = picker.querySelector<HTMLElement>(
      ".custom-theme-color",
    );
    const hexInput =
      picker.querySelector<HTMLInputElement>(".custom-theme-hex");
    if (!(colorElement && hexInput)) {
      throw new Error(`custom-theme inputs for ${field} are missing`);
    }

    hexInput.value = current[field];

    const apply = (next: string) => {
      hexInput.value = next;
      if (next === current[field]) {
        return;
      }
      current[field] = next;
      updatePreview();
      persist();
    };

    const label = picker.querySelector("label")?.textContent ?? field;
    const colorPicker = Pickr.create({
      el: colorElement,
      container: root,
      theme: "monolith",
      appClass: "custom-theme-color-picker",
      position: "right-middle",
      default: current[field],
      lockOpacity: true,
      comparison: false,
      components: {
        palette: true,
        hue: true,
      },
      i18n: {
        "ui:dialog": `${label} color picker`,
        "btn:toggle": `Choose ${label.toLowerCase()} color`,
      },
    });

    const { app, button } = colorPicker.getRoot() as {
      app: HTMLElement;
      button: HTMLButtonElement;
    };
    app.id = `custom-theme-picker-${field}`;
    app.setAttribute("role", "dialog");
    button.setAttribute("aria-controls", app.id);
    button.setAttribute("aria-haspopup", "dialog");
    button.ariaExpanded = "false";

    colorPicker
      .on("init", () => colorPicker.setColor(current[field]))
      .on("show", () => {
        activePicker?.hide();
        activePicker = colorPicker;
        button.ariaExpanded = "true";
      })
      .on("hide", () => {
        activePicker = undefined;
        button.ariaExpanded = "false";
        if (app.contains(document.activeElement) && current.enabled) {
          button.focus();
        }
      })
      .on("change", (color: Pickr.HSVaColor) => {
        apply(color.toHEXA().toString().toLowerCase());
      });

    hexInput.addEventListener("change", () => {
      const next = normalizeHex(hexInput.value) ?? current[field];
      apply(next);
      colorPicker.setColor(next);
    });
  }
};
