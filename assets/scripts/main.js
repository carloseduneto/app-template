import { hierarchy } from "./config.js";
import { fillData } from "./data.js";
import {
  updateHeader,
  applyAnimationClasses,
  cleanAnimationClasses,
  cleanTargetAnimationClasses,
} from "./ui.js";

// --- FUNÇÕES DE NAVEGAÇÃO ---

/**
 * Navega para uma tela específica.
 * @param {string} pageId
 * @param {object} params
 * @param {string} animType
 */
function goTo(pageId, params = {}, animType = "progressive") {
  const urlParams = new URLSearchParams(window.location.search);

  // Limpar params se voltarmos para o início
  if (pageId === "home" || pageId === "inicio-alt") {
    for (const key of urlParams.keys()) {
      urlParams.delete(key);
    }
  }

  // Adicionar novos parâmetros
  for (const [key, value] of Object.entries(params)) {
    urlParams.set(key, value);
  }

  urlParams.set("page", pageId);

  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;

  window.history.pushState({ page: pageId, anim: animType }, "", newUrl);

  render(pageId, animType);
}

/**
 * Função de voltar acionada pelo Header
 */
function goBack() {
  window.history.back();
}

/**
 * Atualiza o DOM (telas, header, animações).
 */
function render(targetPageId, animType = "none") {
  const activePage = document.querySelector(".page.active");
  const targetPage = document.getElementById(targetPageId);

  updateHeader(targetPageId);

  if (activePage === targetPage) return;

  // Se não houver página ativa (primeira carga)
  if (!activePage) {
    targetPage.classList.add("active");
    fillData(targetPageId);
    return;
  }

  fillData(targetPageId);

  // Se type for none (fallback)
  if (animType === "none") {
    activePage.classList.remove("active", "animating");
    targetPage.classList.add("active");
    targetPage.classList.remove("animating");
    return;
  }

  // Executa lógica de animação (UI)
  applyAnimationClasses(activePage, targetPage, animType);

  // Limpeza após o fim da animação
  targetPage.addEventListener(
    "animationend",
    () => {
      cleanAnimationClasses(activePage);
      cleanTargetAnimationClasses(targetPage);
    },
    { once: true }
  );
}

// --- EVENTOS DO NAVEGADOR ---

window.addEventListener("popstate", (event) => {
  const params = new URLSearchParams(window.location.search);
  const targetPage = params.get("page") || "home";

  const currentPageEl = document.querySelector(".page.active");
  const currentId = currentPageEl ? currentPageEl.id : "home";

  const currentLevel =
    hierarchy[currentId] !== undefined ? hierarchy[currentId] : 0;
  const targetLevel =
    hierarchy[targetPage] !== undefined ? hierarchy[targetPage] : 0;

  let anim = "regressive"; // Padrão

  if (currentLevel === 0 && targetLevel === 0 && currentId !== targetPage) {
    anim = "dissolve";
  } else if (targetLevel > currentLevel) {
    anim = "progressive";
  }

  render(targetPage, anim);
});

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const startPage = params.get("page") || "home";

  // Limpa qualquer estado quebrado antes de iniciar
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active", "animating");
  });

  const pageEl = document.getElementById(startPage);

  if (pageEl) {
    // Preenche dados antes de ativar
    fillData(startPage);

    pageEl.classList.add("active");
    updateHeader(startPage);
  } else {
    // Fallback se a página na URL não existir
    fillData("home");
    document.getElementById("home").classList.add("active");
    updateHeader("home");
  }
});


// --- EXPOR PARA O HTML ---
// Como estamos num módulo, goTo e goBack não são globais por padrão.
// Precisamos anexá-las explicitamente ao window.
window.goTo = goTo;
window.goBack = goBack;
