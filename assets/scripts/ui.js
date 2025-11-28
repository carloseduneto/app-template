// --- ESTADO & CONFIGURAÇÃO ---
const routes = ["home", "resultado", "subresultado", "inicio-alt"];

// --- FUNÇÕES DE NAVEGAÇÃO ---

/**
 * Navega para uma tela específica.
 * @param {string} pageId - ID da div da página (ex: 'resultado').
 * @param {object} params - Objeto com dados para passar na URL (ex: { sel1: 'A' }).
 * @param {string} animType - 'progressive' (padrão), 'regressive', ou 'dissolve'.
 */
function goTo(pageId, params = {}, animType = "progressive") {
  const currentParams = new URLSearchParams(window.location.search);
  const currentPageId = currentParams.get("page") || "home";

  // Mesclar parâmetros novos com os antigos se necessário (opcional, aqui estamos substituindo ou adicionando)
  // Para este template, vamos construir a nova URL baseada no que recebemos + acumular dados anteriores se for fluxo linear
  const urlParams = new URLSearchParams(window.location.search);

  // Limpar params se voltarmos para home
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

  // Salvar no histórico
  window.history.pushState({ page: pageId, anim: animType }, "", newUrl);

  // Executar transição
  render(pageId, animType);
}

/**
 * Função de voltar acionada pelo botão do Header.
 */
function goBack() {
  // Ao usar history.back(), o evento 'popstate' será disparado
  // Precisamos garantir que a animação seja 'regressive' no popstate
  window.history.back();
}

/**
 * Atualiza o DOM (telas, header, animações).
 */
function render(targetPageId, animType = "none") {
  const pages = document.querySelectorAll(".page");
  let activePage = document.querySelector(".page.active");
  const targetPage = document.getElementById(targetPageId);

  // Atualizar Header
  updateHeader(targetPageId);

  // Se for a mesma página, não faz nada
  if (activePage === targetPage) return;

  // Se não houver página ativa (primeira carga), só mostra a nova
  if (!activePage) {
    targetPage.classList.add("active");
    fillData(targetPageId);
    return;
  }

  // Preencher dados na tela de destino antes de ela aparecer
  fillData(targetPageId);

  // Configurar Animações
  activePage.className = "page active animating"; // Reseta classes
  targetPage.className = "page active animating"; // Prepara a nova, mas ainda sobreposta

  // Lógica de Classes de Animação
  if (animType === "progressive") {
    // Deslize da Esquerda para Direita (Conforme pedido)
    targetPage.classList.add("anim-progress-enter");
    activePage.classList.add("anim-progress-exit");
  } else if (animType === "regressive") {
    // Deslize da Direita para Esquerda
    targetPage.classList.add("anim-regress-enter");
    activePage.classList.add("anim-regress-exit");
  } else if (animType === "dissolve") {
    targetPage.classList.add("anim-dissolve-enter");
    activePage.classList.add("anim-dissolve-exit");
  } else {
    // Sem animação (fallback)
    activePage.classList.remove("active", "animating");
    targetPage.classList.add("active");
    targetPage.classList.remove("animating");
    return;
  }

  // Limpeza após o fim da animação
  // Usamos {once: true} para garantir que o listener roda apenas uma vez
  targetPage.addEventListener(
    "animationend",
    () => {
      activePage.classList.remove(
        "active",
        "animating",
        "anim-progress-exit",
        "anim-regress-exit",
        "anim-dissolve-exit"
      );
      targetPage.classList.remove(
        "animating",
        "anim-progress-enter",
        "anim-regress-enter",
        "anim-dissolve-enter"
      );
    },
    { once: true }
  );
}

/**
 * Atualiza o texto do Header e visibilidade do botão voltar.
 */
function updateHeader(pageId) {
  const titleEl = document.getElementById("header-title");
  const backBtn = document.getElementById("back-btn");
  const header = document.getElementById("main-header");

  // Resetar cor do header
  header.style.backgroundColor = "#007bff";

  if (pageId === "home") {
    titleEl.textContent = "Início";
    backBtn.style.display = "none";
  } else if (pageId === "inicio-alt") {
    titleEl.textContent = "Início Alternativo 1";
    header.style.backgroundColor = "#28a745"; // Cor diferente para o alternativo
    backBtn.style.display = "none"; // Inícios geralmente não têm voltar para "nada"
  } else if (pageId === "resultado") {
    titleEl.textContent = "Resultado";
    backBtn.style.display = "block";
  } else if (pageId === "subresultado") {
    titleEl.textContent = "Subresultado";
    backBtn.style.display = "block";
  }
}

/**
 * Pega dados da URL e preenche na tela.
 */
function fillData(pageId) {
  const params = new URLSearchParams(window.location.search);

  if (pageId === "resultado") {
    const sel1 = params.get("sel1") || "-";
    document.getElementById("res-display").textContent = sel1;
  } else if (pageId === "subresultado") {
    const sel1 = params.get("sel1") || "-";
    const sel2 = params.get("sel2") || "-";
    document.getElementById("final-display-1").textContent = sel1;
    document.getElementById("final-display-2").textContent = sel2;
  }
}

// --- EVENTO DE VOLTAR DO NAVEGADOR (POPSTATE) ---
window.addEventListener("popstate", (event) => {
  const params = new URLSearchParams(window.location.search);
  const targetPage = params.get("page") || "home";

  // Tentar adivinhar a direção baseada na hierarquia simples
  // Home (0) -> Resultado (1) -> Subresultado (2)
  // Se formos para um nível menor, é regressivo.

  const hierarchy = { home: 0, "inicio-alt": 0, resultado: 1, subresultado: 2 };
  const currentPageEl = document.querySelector(".page.active");
  const currentId = currentPageEl ? currentPageEl.id : "home";

  const currentLevel =
    hierarchy[currentId] !== undefined ? hierarchy[currentId] : 0;
  const targetLevel =
    hierarchy[targetPage] !== undefined ? hierarchy[targetPage] : 0;

  let anim = "regressive"; // Padrão do botão voltar do browser

  // Se for troca de inícios
  if (currentLevel === 0 && targetLevel === 0 && currentId !== targetPage) {
    anim = "dissolve";
  }
  // Se por algum motivo o usuário avançar pelo histórico do navegador (botão forward)
  else if (targetLevel > currentLevel) {
    anim = "progressive";
  }

  render(targetPage, anim);
});

// --- INICIALIZAÇÃO ---
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const startPage = params.get("page") || "home";

  // Se a URL já tiver parâmetros (ex: link compartilhado), preenchemos
  fillData(startPage);

  // Renderiza inicial sem animação
  document.getElementById(startPage).classList.add("active");
  updateHeader(startPage);
});
