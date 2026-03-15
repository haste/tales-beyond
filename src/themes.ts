type Theme = {
  color: string;
  lightHoverBackground: string;
  darkHoverBackground: string;
};

const defaultTheme: Theme = {
  color: "#c53131",
  lightHoverBackground: "#fdefe7",
  darkHoverBackground: "#4a1313",
};

const themes: Record<string, Theme> = {
  "DDB Red": defaultTheme,
  "Barbarian Fire": {
    color: "#e5623e",
    lightHoverBackground: "#fdf4f2",
    darkHoverBackground: "#7a2710",
  },
  "Bard Rogue": {
    color: "#aa6dab",
    lightHoverBackground: "#f5eef6",
    darkHoverBackground: "#502e51",
  },
  "Cleric Silver": {
    color: "#92a2b3",
    lightHoverBackground: "#eceff2",
    darkHoverBackground: "#475665",
  },
  "Druid Moss": {
    color: "#79853c",
    lightHoverBackground: "#e8ecd4",
    darkHoverBackground: "#515928",
  },
  "Fighter Rust": {
    color: "#7e4f3d",
    lightHoverBackground: "#e9d8d1",
    darkHoverBackground: "#533428",
  },
  "Monk Sky": {
    color: "#53a5c5",
    lightHoverBackground: "#e2f0f5",
    darkHoverBackground: "#265d72",
  },
  "Paladin Gold": {
    color: "#b59e54",
    lightHoverBackground: "#efead9",
    darkHoverBackground: "#332d16",
  },
  "Range Emerald": {
    color: "#4f7e61",
    lightHoverBackground: "#e0ece5",
    darkHoverBackground: "#1e3025",
  },
  "Rogue Ash": {
    color: "#555752",
    lightHoverBackground: "#f0f0f0",
    darkHoverBackground: "#151514",
  },
  "Sorcerer Blood": {
    color: "#972e2e",
    lightHoverBackground: "#f1d3d3",
    darkHoverBackground: "#661f1f",
  },
  "Warlock Iris": {
    color: "#8137af",
    lightHoverBackground: "#f4ecf9",
    darkHoverBackground: "#39194e",
  },
  "Wizard Cobalt": {
    color: "#0045b7",
    lightHoverBackground: "#eaf2ff",
    darkHoverBackground: "#001538",
  },
  "Artificer Copper": {
    color: "#d59139",
    lightHoverBackground: "#f9efe1",
    darkHoverBackground: "#613f14",
  },
  "Gold Dragon": {
    color: "#cf9f25",
    lightHoverBackground: "#f6e9ca",
    darkHoverBackground: "#4d3b0e",
  },
  "Eye of Xanathar": {
    color: "#eb5118",
    lightHoverBackground: "#fbded4",
    darkHoverBackground: "#622108",
  },
  "I Love Flumphs": {
    color: "#99c476",
    lightHoverBackground: "#e9f2e1",
    darkHoverBackground: "#4d7130",
  },
};

const themeToCSS = (theme: Theme) => `
:root {
    --tales-beyond-border: ${theme.color};
    --tales-beyond-background: inherit;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: ${theme.color};
    --tales-beyond-hover-background: ${theme.lightHoverBackground};
    --tales-beyond-hover-text: inherit;
}

:root .ct-character-sheet--dark-mode, :root .ct-sidebar--is-dark-mode {
    --tales-beyond-border: ${theme.color};
    --tales-beyond-background: transparent;
    --tales-beyond-text: inherit;

    --tales-beyond-hover-border: ${theme.color};
    --tales-beyond-hover-background: ${theme.darkHoverBackground};
    --tales-beyond-hover-text: inherit;
}
`;

const colorToTheme = new Map(
  Object.values(themes).map((theme) => [theme.color, theme]),
);

const getOrInjectStyleSheet = (name: string) => {
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

export const injectThemeStyle = () => {
  const themeElement = getOrInjectStyleSheet("theme");

  // The trim() is here because the Chromium version TaleSpire uses returns the
  // CSS variable with spaces preserved
  const mainColor = getComputedStyle(document.body)
    .getPropertyValue("--theme-color")
    .toLowerCase()
    .trim();

  if (themeElement.dataset.mainColor === mainColor) {
    return;
  }

  const theme = colorToTheme.get(mainColor) ?? defaultTheme;
  themeElement.dataset.mainColor = mainColor;
  themeElement.textContent = themeToCSS(theme);
};
