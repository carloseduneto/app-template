import {mainColor} from "./config.js";

/**
 * Atualiza o texto do Header e visibilidade do botão voltar.
 * @param {string} pageId
 */
export function updateHeader(pageId) {
  const titleEl = document.getElementById("header-title");
  const backBtn = document.getElementById("back-btn");
  const header = document.getElementById("main-header");

  // Resetar cor do header

  // header.style.backgroundColor = "#007bff";
  header.style.backgroundColor = mainColor;

  if (pageId === "home") {
    titleEl.textContent = "Início";
    backBtn.style.display = "none";
  } else if (pageId === "inicio-alt") {
    titleEl.textContent = "Início Alternativo 1";
    header.style.backgroundColor = "#28a745";
    backBtn.style.display = "none";
  } else if (pageId === "resultado") {
    titleEl.textContent = "Resultado";
    backBtn.style.display = "block";
  } else if (pageId === "subresultado") {
    titleEl.textContent = "Subresultado";
    backBtn.style.display = "block";
  }
}

/**
 * Aplica as classes CSS de animação nas páginas
 * @param {HTMLElement} activePage
 * @param {HTMLElement} targetPage
 * @param {string} animType
 */
export function applyAnimationClasses(activePage, targetPage, animType) {
  activePage.className = "page active animating";
  targetPage.className = "page active animating";

  if (animType === "progressive") {
    targetPage.classList.add("anim-progress-enter");
    activePage.classList.add("anim-progress-exit");
  } else if (animType === "regressive") {
    targetPage.classList.add("anim-regress-enter");
    activePage.classList.add("anim-regress-exit");
  } else if (animType === "dissolve") {
    targetPage.classList.add("anim-dissolve-enter");
    activePage.classList.add("anim-dissolve-exit");
  }
}

export function cleanAnimationClasses(page) {
  page.classList.remove(
    "active",
    "animating",
    "anim-progress-exit",
    "anim-regress-exit",
    "anim-dissolve-exit"
  );
}

export function cleanTargetAnimationClasses(page) {
  page.classList.remove(
    "animating",
    "anim-progress-enter",
    "anim-regress-enter",
    "anim-dissolve-enter"
  );
}
