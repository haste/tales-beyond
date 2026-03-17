import { arrow, computePosition, flip, offset } from "@floating-ui/dom";

import svgLogo from "~/icons/icon.svg";
import { parseRoll } from "~/roll";
import { getOptions } from "~/storage/settings";
import { triggerTalespire } from "~/utils/talespire";

const removeAllMenus = () => {
  for (const activeMenu of document.querySelectorAll(
    ".tales-beyond-extension-contextmenu",
  )) {
    activeMenu.remove();
  }

  window.removeEventListener("click", detectLightDismiss);
  window.removeEventListener("scroll", removeAllMenus);
};

const detectLightDismiss = (event: MouseEvent) => {
  const activeMenu = Array.from(
    document.querySelectorAll(".tales-beyond-extension-contextmenu"),
  );

  const clickedMenu = activeMenu.some(
    (elem) => event.target instanceof Element && elem.contains(event.target),
  );
  if (!clickedMenu) {
    removeAllMenus();
  }
};

const setupListeners = (button: HTMLElement, contextmenu: HTMLDivElement) => {
  const label = button.dataset.tsLabel;
  const dice = button.dataset.tsDice;
  if (!dice) {
    return;
  }

  const roll = parseRoll(dice);
  if (!roll) {
    return;
  }
  const type = button.dataset.tsType;

  const action = (labelSuffix?: string) => async () => {
    const name = labelSuffix
      ? label
        ? `${label} (${labelSuffix})`
        : labelSuffix
      : label;

    if (labelSuffix === "CRIT") {
      await triggerTalespire(name, roll.double());
    } else if (labelSuffix) {
      await triggerTalespire(name, roll.repeat(2));
    } else {
      await triggerTalespire(name, roll);
    }

    removeAllMenus();
  };

  const [adv, flat, dis, crit] =
    contextmenu.querySelectorAll<HTMLDivElement>(".item");
  if (!(adv && flat && dis && crit)) {
    return;
  }

  adv.addEventListener("click", action("ADV"));
  flat.addEventListener("click", action());
  dis.addEventListener("click", action("DIS"));
  crit.addEventListener("click", action("CRIT"));

  const isHit = type ? type === "hit" : roll.groups[0]?.[0]?.sides === 20;

  adv.style.display = isHit ? "block" : "none";
  dis.style.display = isHit ? "block" : "none";
  crit.style.display = isHit ? "none" : "block";

  window.addEventListener("click", detectLightDismiss, {
    capture: true,
    passive: true,
  });

  window.addEventListener("scroll", removeAllMenus, {
    capture: true,
    passive: true,
  });
};

const contextMenu = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const diceButton = event.target.closest<HTMLElement>(
    ".integrated-dice__container",
  );
  if (!diceButton) {
    return;
  }

  event.preventDefault();

  removeAllMenus();

  const contextmenu = document.createElement("div");
  contextmenu.classList.add("tales-beyond-extension-contextmenu");
  contextmenu.innerHTML = `
<div class="menu">
  <div class="arrow"></div>
  <h2>
    <img>
    Tales Beyond
  </h2>

  <hr />

  <div class="item advantage">Advantage</div>
  <div class="item">Normal</div>
  <div class="item disadvantage">Disadvantage</div>
  <div class="item critical">Critical Hit</div>
</div>
  `;
  const img = contextmenu.querySelector<HTMLImageElement>("img");
  const arrowNode = contextmenu.querySelector<HTMLDivElement>(".arrow");
  if (!(img && arrowNode)) {
    return;
  }

  img.src = svgLogo;

  const arrowLen = arrowNode.offsetWidth;
  const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;

  document.body.appendChild(contextmenu);
  setupListeners(diceButton, contextmenu);

  computePosition(diceButton, contextmenu, {
    middleware: [offset(floatingOffset), flip(), arrow({ element: arrowNode })],
    placement: "right",
  }).then(({ x, y, middlewareData, placement }) => {
    Object.assign(contextmenu.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    const side = placement.split("-")[0] ?? "right";

    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[side];

    if (middlewareData.arrow && staticSide) {
      const { x, y } = middlewareData.arrow;
      Object.assign(arrowNode.style, {
        left: x === null ? "" : `${x}px`,
        top: y === null ? "" : `${y}px`,
        right: "",
        bottom: "",
        [staticSide]: `${-arrowLen / 2}px`,
        transform: "rotate(45deg)",
      });
    }
  });
};

export const injectContextMenu = async () => {
  const settings = await getOptions();
  if (settings.contextMenuEnabled) {
    window.addEventListener("contextmenu", contextMenu);
  } else {
    window.removeEventListener("contextmenu", contextMenu);
  }
};
