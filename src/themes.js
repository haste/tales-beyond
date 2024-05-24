export const getOrInjectStyleSheet = (name) => {
  const id = `tales-beyond-extension-style-${name}`;
  let style = document.getElementById(id);
  if (style) {
    return style;
  }

  style = document.createElement("style");
  style.id = id;
  document.head.append(style);
  return style;
};

const themes = {
  "DDB Red": `
:root {
    --tales-beyond-border: #c53131;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #c53131;
    --tales-beyond-hover-background: #fdefe7;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #c53131;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #c53131;
    --tales-beyond-hover-background: #4a1313;
    --tales-beyond-hover-text: inherit;
}
  `,
  "Barbarian Fire": `
:root {
    --tales-beyond-border: #e5623e;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #e5623e;
    --tales-beyond-hover-background: #fdf4f2;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #e5623e;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #e5623e;
    --tales-beyond-hover-background: #7a2710;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Bard Rogue": `
:root {
    --tales-beyond-border: #aa6dab;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #aa6dab;
    --tales-beyond-hover-background: #f5eef6;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #aa6dab;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #aa6dab;
    --tales-beyond-hover-background: #502e51;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Cleric Silver": `
:root {
    --tales-beyond-border: #92a2b3;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #92a2b3;
    --tales-beyond-hover-background: #eceff2;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #92a2b3;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #92a2b3;
    --tales-beyond-hover-background: #475665;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Druid Moss": `
:root {
    --tales-beyond-border: #79853c;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #79853c;
    --tales-beyond-hover-background: #e8ecd4;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #79853c;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #79853c;
    --tales-beyond-hover-background: #515928;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Figther Rust": `
:root {
    --tales-beyond-border: #7e4f3d;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #7e4f3d;
    --tales-beyond-hover-background: #e9d8d1;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #7e4f3d;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #7e4f3d;
    --tales-beyond-hover-background: #533428;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Monk Sky": `
:root {
    --tales-beyond-border: #53a5c5;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #53a5c5;
    --tales-beyond-hover-background: #e2f0f5;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #53a5c5;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #53a5c5;
    --tales-beyond-hover-background: #265d72;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Paladin Gold": `
:root {
    --tales-beyond-border: #b59e54;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #b59e54;
    --tales-beyond-hover-background: #efead9;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #b59e54;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #b59e54;
    --tales-beyond-hover-background: #332d16;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Range Emerald": `
:root {
    --tales-beyond-border: #4f7e61;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #4f7e61;
    --tales-beyond-hover-background: #e0ece5;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #4f7e61;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #4f7e61;
    --tales-beyond-hover-background: #1e3025;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Rogue Ash": `
:root {
    --tales-beyond-border: #555752;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #555752;
    --tales-beyond-hover-background: #f0f0f0;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #555752;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #555752;
    --tales-beyond-hover-background: #151514;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Sorcerer Blood": `
:root {
    --tales-beyond-border: #972e2e;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #972e2e;
    --tales-beyond-hover-background: #f1d3d3;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #972e2e;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #972e2e;
    --tales-beyond-hover-background: #661f1f;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Warlock Iris": `
:root {
    --tales-beyond-border: #8137af;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #8137af;
    --tales-beyond-hover-background: #f4ecf9;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #8137af;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #8137af;
    --tales-beyond-hover-background: #39194e;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Wizard Cobalt": `
:root {
    --tales-beyond-border: #0045b7;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #0045b7;
    --tales-beyond-hover-background: #eaf2ff;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #0045b7;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #0045b7;
    --tales-beyond-hover-background: #001538;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Artificer Copper": `
:root {
    --tales-beyond-border: #d59139;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #d59139;
    --tales-beyond-hover-background: #f9efe1;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #d59139;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #d59139;
    --tales-beyond-hover-background: #613f14;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Gold Dragon": `
:root {
    --tales-beyond-border: #cf9f25;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #cf9f25;
    --tales-beyond-hover-background: #f6e9ca;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #cf9f25;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #cf9f25;
    --tales-beyond-hover-background: #4d3b0e;
    --tales-beyond-hover-text: inherit;
}
  `,

  "Eye of Xanathar": `
:root {
    --tales-beyond-border: #eb5118;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #eb5118;
    --tales-beyond-hover-background: #fbded4;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #eb5118;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #eb5118;
    --tales-beyond-hover-background: #622108;
    --tales-beyond-hover-text: inherit;
}
  `,

  "I Love Flumphs": `
:root {
    --tales-beyond-border: #99c476;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #99c476;
    --tales-beyond-hover-background: #e9f2e1;
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode {
    --tales-beyond-border: #99c476;
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: #99c476;
    --tales-beyond-hover-background: #4d7130;
    --tales-beyond-hover-text: inherit;
}
  `,
};

export const injectThemeStyle = () => {
  const theme = getOrInjectStyleSheet("theme");
  const mainColor = getComputedStyle(document.body).getPropertyValue(
    "--theme-color",
  );

  if (theme.dataset.mainColor === mainColor) {
    return;
  }

  let styles;
  switch (mainColor.toLowerCase()) {
    case "#e5623e":
      styles = themes["Barbarian Fire"];
      break;

    case "#aa6dab":
      styles = themes["Bard Rogue"];
      break;

    case "#92a2b3":
      styles = themes["Cleric Silver"];
      break;

    case "#79853c":
      styles = themes["Druid Moss"];
      break;

    case "#7e4f3d":
      styles = themes["Figther Rust"];
      break;

    case "#53a5c5":
      styles = themes["Monk Sky"];
      break;

    case "#b59e54":
      styles = themes["Paladin Gold"];
      break;

    case "#4f7e61":
      styles = themes["Range Emerald"];
      break;

    case "#555752":
      styles = themes["Rogue Ash"];
      break;

    case "#972e2e":
      styles = themes["Sorcerer Blood"];
      break;

    case "#8137af":
      styles = themes["Warlock Iris"];
      break;

    case "#0045b7":
      styles = themes["Wizard Cobalt"];
      break;

    case "#d59139":
      styles = themes["Artificer Copper"];
      break;

    case "#cf9f25":
      styles = themes["Gold Dragon"];
      break;

    case "#eb5118":
      styles = themes["Eye of Xanathar"];
      break;

    case "#99c476":
      styles = themes["I Love Flumphs"];
      break;

    default:
      styles = themes["DDB Red"];
      break;
  }

  theme.dataset.mainColor = mainColor;
  theme.textContent = styles;
};

export const injectCharacterStyle = () => {
  const styles = getOrInjectStyleSheet("character");
  styles.textContent = `
button.integrated-dice__container.tales-beyond-extension {
  border: 1px solid var(--tales-beyond-border);
  border-radius: 4px;
  background: var(--tales-beyond-background);
  color: var(--tales-beyond-text);
  cursor: pointer;
}

button.integrated-dice__container.tales-beyond-extension:hover {
  border: 1px solid var(--tales-beyond-hover-border);
  background: var(--tales-beyond-hover-background);
}

button.integrated-dice__container.tales-beyond-extension:hover ~ .ddbc-saving-throw-selection-box-svg,
button.integrated-dice__container.tales-beyond-extension:hover ~ .ddbc-saving-throw-selection-small-box-svg {
  fill: var(--tales-beyond-hover-background);
}

.ddbc-saving-throws-summary__ability-modifier > button.integrated-dice__container.tales-beyond-extension{
  border: 0;
}

.ddbc-saving-throws-summary__ability-modifier > button.integrated-dice__container.tales-beyond-extension:hover {
  background: transparent;
}
  `;
};
