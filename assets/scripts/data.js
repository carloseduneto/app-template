/**
 * Pega dados da URL e preenche na tela.
 * @param {string} pageId - O ID da página sendo carregada.
 */
export function fillData(pageId) {
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

  /**

  if (pageId === "subresultado") {
    const loading = document.getElementById("subresultado-loading");
    const content = document.getElementById("subresultado-content");

    // Mostrar skeleton
    loading.style.display = "block";
    content.style.display = "none";

    // Espera 0.5s e exibe os dados reais
    setTimeout(() => {
      loading.style.display = "none";
      content.style.display = "block";
    }, 300);
  }
  
  if (pageId === "resultado") {
    const loading = document.getElementById("resultado-loading");
    const content = document.getElementById("resultado-content");

    // Mostrar skeleton
    loading.style.display = "block";
    content.style.display = "none";

    // Espera 0.5s e exibe os dados reais
    setTimeout(() => {
      loading.style.display = "none";
      content.style.display = "block";
    }, 300);
  }

     
   */
}
