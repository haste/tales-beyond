import { mods } from "~/mods";
import { getOptions, saveOption } from "~/utils/storage";

const general = [
  {
    id: "contextMenuEnabled",
    header: "Right-click menu",
    description:
      "Open a menu when right-clicking dice buttons to roll with Advantage, Disadvantage, or as a Critical Hit.",
  },
];

const keys = [
  {
    id: "modifierKeyShift",
    label: "Shift key",
  },
  {
    id: "modifierKeyCtrl",
    label: "Ctrl key",
  },
  {
    id: "modifierKeyAlt",
    label: "Alt key",
  },
];

const restoreOptions = async () => {
  const settings = await getOptions();

  // Remove the modifier keys section as it isn't something we can support in
  // TaleSpire currently.
  if (typeof TS !== "undefined") {
    document.querySelector("#modifiers").remove();
    document.querySelector("footer").dataset.talespire = "";
  } else {
    const keyTemplate = document.querySelector("#option-key");
    const keyList = document.querySelector("#key-list");
    for (const key of keys) {
      const option = keyTemplate.content.cloneNode(true);
      const select = option.querySelector("select");
      select.addEventListener("change", (event) =>
        saveOption(key.id, event.target.value),
      );
      select.setAttribute("id", key.id);

      const label = option.querySelector("label");
      label.setAttribute("for", key.id);
      label.textContent = key.label;

      for (const opt of option.querySelectorAll("option")) {
        if (opt.value === settings[key.id]) {
          opt.setAttribute("selected", "");
        }
      }

      keyList.appendChild(option);
    }
  }

  const modTemplate = document.querySelector("#option-mod");
  const modList = document.querySelector("#mod-list");
  for (const mod of mods) {
    const option = modTemplate.content.cloneNode(true);
    option.querySelector("label").setAttribute("for", mod.id);

    const input = option.querySelector("input");
    input.addEventListener("change", (event) =>
      saveOption(mod.id, event.target.checked),
    );
    input.setAttribute("id", mod.id);
    if (settings[mod.id]) {
      input.setAttribute("checked", "");
    }

    const description = option.querySelector(".description");
    description.firstElementChild.textContent = mod.header;

    const text = document.createTextNode(mod.description);
    description.appendChild(text);

    modList.append(option);
  }

  const generalList = document.querySelector("#general-list");
  for (const opt of general) {
    // Re-use mod template
    const option = modTemplate.content.cloneNode(true);
    option.querySelector("label").setAttribute("for", opt.id);

    const input = option.querySelector("input");
    input.addEventListener("change", (event) =>
      saveOption(opt.id, event.target.checked),
    );
    input.setAttribute("id", opt.id);
    if (settings[opt.id]) {
      input.setAttribute("checked", "");
    }

    const description = option.querySelector(".description");
    description.firstElementChild.textContent = opt.header;

    const text = document.createTextNode(opt.description);
    description.appendChild(text);

    generalList.append(option);
  }
};

document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "complete") {
    restoreOptions();
  }
});
