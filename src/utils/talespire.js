export const talespireLink = (elem, label, dice, diceLabel) => {
  label = label?.trim();

  const link = document.createElement("button");
  link.classList.add("integrated-dice__container");
  link.classList.add("tales-beyond-extension");
  link.dataset.tsLabel = label;
  link.dataset.tsDice = dice;
  link.onclick = (event) => {
    event.stopPropagation();

    dice = dice.replace(/d100/g, "d100+d10");

    let name = label;
    let extraDice = "";
    if (event.altKey || event.ctrlKey || event.shiftKey) {
      name += " (ADV/DIS)";
      extraDice = `/${dice}`;
    }

    let uri;
    if (typeof name === "string") {
      uri = `talespire://dice/${encodeURIComponent(name)}:${dice}${extraDice}`;
    } else {
      uri = `talespire://dice/${dice}${extraDice}`;
    }

    if (TB_DRY_RUN_TALESPIRE_LINKS === "true") {
      // biome-ignore lint/suspicious/noConsoleLog: Used during dev only
      console.log("TaleSpire Link", { name, dice, extraDice, uri });
    } else {
      window.open(uri, "_self");
    }
  };

  if (diceLabel) {
    link.innerText = diceLabel;
  } else if (elem) {
    link.innerHTML = elem.innerHTML;
  } else {
    link.innerText = dice;
  }

  return link;
};
