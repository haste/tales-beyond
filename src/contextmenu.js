import svgLogo from "~/icons/icon.svg";
import { getOptions } from "~/utils/storage";
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

const detectLightDismiss = (event) => {
  const activeMenu = Array.from(
    document.querySelectorAll(".tales-beyond-extension-contextmenu"),
  );

  const clickedMenu = activeMenu.some((elem) => elem.contains(event.target));
  if (!clickedMenu) {
    removeAllMenus();
  }
};

const setupListeners = (button, contextmenu) => {
  const label = button.dataset.tsLabel;
  const dice = button.dataset.tsDice;

  const action = (labelSuffix) => () => {
    if (labelSuffix) {
      const name = label ? `${label} (${labelSuffix})` : labelSuffix;
      triggerTalespire(name, dice, true);
    } else {
      triggerTalespire(label, dice);
    }

    removeAllMenus();
  };

  const [adv, flat, dis] = contextmenu.querySelectorAll(".item");
  adv.addEventListener("click", action("ADV"));
  flat.addEventListener("click", action());
  dis.addEventListener("click", action("DIS"));

  window.addEventListener("click", detectLightDismiss, {
    capture: true,
    passive: true,
  });

  window.addEventListener("scroll", removeAllMenus, {
    capture: true,
    passive: true,
  });
};

const positionMenu = (button, contextmenu) => {
  const menu = contextmenu.querySelector(".menu");
  const arrow = contextmenu.querySelector(" .arrow");

  const buttonRect = button.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  const top =
    (buttonRect.top + buttonRect.bottom) / 2 -
    menuRect.height / 2 +
    window.scrollY;

  menu.style.top = `${top}px`;

  // Avoid end of screen
  if (window.innerWidth < buttonRect.right + menuRect.width + 10) {
    arrow.classList.add("right");
    menu.style.left = `${buttonRect.left - menuRect.right - 10}px`;
  } else {
    arrow.classList.add("left");
    menu.style.left = `${buttonRect.right - menuRect.left + 10}px`;
  }
};

const contextMenu = (event) => {
  const diceButton = event.target.closest(".integrated-dice__container");
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
</div>
  `;
  const img = contextmenu.querySelector("img");
  img.src = svgLogo;

  document.body.appendChild(contextmenu);
  positionMenu(diceButton, contextmenu);
  setupListeners(diceButton, contextmenu);
};

export const injectContextMenu = async () => {
  const settings = await getOptions();
  if (settings.contextMenuEnabled) {
    window.addEventListener("contextmenu", contextMenu);
  } else {
    window.removeEventListener("contextmenu", contextMenu);
  }
};
