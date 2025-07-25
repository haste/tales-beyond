import { saveOption } from "~/utils/storage";

export const BOOLEAN = Symbol("boolean");
export const DROPDOWN = Symbol("dropdown");

const addDropdown = (settings, parent, entry) => {
  const dropdownTemplate = document.querySelector("#template-dropdown");
  const base = dropdownTemplate.content.cloneNode(true);
  const select = base.querySelector("select");
  select.addEventListener("change", (event) =>
    saveOption(entry.id, event.target.value),
  );
  select.setAttribute("id", entry.id);

  const label = base.querySelector("label");
  console.log(label);
  label.setAttribute("for", entry.id);
  label.textContent = entry.header;

  const currentlySelected = settings[entry.id];
  for (const option of entry.options) {
    console.log(option);
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

const addCheckbox = (settings, parent, entry) => {
  const checkboxTemplate = document.querySelector("#template-checkbox");
  const base = checkboxTemplate.content.cloneNode(true);
  base.querySelector("label").setAttribute("for", entry.id);

  const input = base.querySelector("input");
  input.addEventListener("change", (event) =>
    saveOption(entry.id, event.target.checked),
  );
  input.setAttribute("id", entry.id);
  if (settings[entry.id]) {
    input.setAttribute("checked", "");
  }

  const description = base.querySelector(".description");
  description.firstElementChild.textContent = entry.header;

  const text = document.createTextNode(entry.description);
  description.appendChild(text);

  parent.append(base);
};

export const addUIElement = (settings, parent, entry) => {
  switch (entry.type) {
    case BOOLEAN:
      addCheckbox(settings, parent, entry);
      break;

    case DROPDOWN:
      addDropdown(settings, parent, entry);
      break;

    default:
      break;
  }
};
