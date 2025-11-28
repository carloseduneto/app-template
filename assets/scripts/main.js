import { hierarchy } from "./config.js";
import { fillData } from "./data.js";
import {
  updateHeader,
  applyAnimationClasses,
  cleanAnimationClasses,
  cleanTargetAnimationClasses,
} from "./ui.js";

// Variável de controle (segurança extra para chamadas via código)
let isAnimating = false;

// --- FUNÇÕES DE NAVEGAÇÃO ---

/**
 * Navega para uma tela específica.
 * @param {string} pageId
 * @param {object} params
 * @param {string} animType
 */
function goTo(pageId, params = {}, animType = "progressive") {
  // 1. Bloqueio Lógico: Se já estiver animando, ignora o comando
  if (isAnimating) return;

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
  // O navegador gerencia o histórico, mas se quisermos evitar spam no botão voltar:
  if (isAnimating) return;
  window.history.back();
}

/**
 * Atualiza o DOM e gerencia o bloqueio de UI
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

  // --- INÍCIO DO BLOQUEIO ---
  isAnimating = true;
  document.body.classList.add("is-navigating"); // Bloqueia cliques via CSS

  fillData(targetPageId);

  // Se não houver animação, removemos o bloqueio imediatamente
  if (animType === "none") {
    activePage.classList.remove("active", "animating");
    targetPage.classList.add("active");
    targetPage.classList.remove("animating");

    // Libera
    isAnimating = false;
    document.body.classList.remove("is-navigating");
    return;
  }

  // Executa lógica de animação (UI)
  applyAnimationClasses(activePage, targetPage, animType);

  // Função única para limpar tudo ao final
  const onAnimationEnd = () => {
    cleanAnimationClasses(activePage);
    cleanTargetAnimationClasses(targetPage);

    // --- FIM DO BLOQUEIO ---
    isAnimating = false;
    document.body.classList.remove("is-navigating"); // Libera cliques
  };

  // Adiciona o listener com { once: true } para garantir que rode só uma vez
  targetPage.addEventListener("animationend", onAnimationEnd, { once: true });

  // SAFETY NET (Rede de Segurança):
  // Às vezes o navegador não dispara 'animationend' (aba inativa, erro de render).
  // Isso força o desbloqueio após o tempo da animação + uma pequena folga (ex: 600ms).
  setTimeout(() => {
    if (isAnimating) {
      console.warn("AnimationEnd falhou, forçando limpeza.");
      onAnimationEnd();
    }
  }, 600); // 500ms da animação + 100ms de folga
}

// --- EVENTOS E INICIALIZAÇÃO (Mantém igual) ---

window.addEventListener("popstate", (event) => {
  // Se estiver animando e o usuário apertar voltar no browser,
  // o URL muda, mas podemos tentar mitigar problemas visuais.
  // Idealmente, o bloqueio 'is-navigating' impede cliques na UI,
  // mas botões do navegador estão fora do nosso controle.

  const params = new URLSearchParams(window.location.search);
  const targetPage = params.get("page") || "home";

  const currentPageEl = document.querySelector(".page.active");
  const currentId = currentPageEl ? currentPageEl.id : "home";

  const currentLevel =
    hierarchy[currentId] !== undefined ? hierarchy[currentId] : 0;
  const targetLevel =
    hierarchy[targetPage] !== undefined ? hierarchy[targetPage] : 0;

  let anim = "regressive";

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
  fillData(startPage);
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
