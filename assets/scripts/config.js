/**
 * Lista de rotas disponíveis (IDs das divs)
 */
export const routes = ["home", "resultado", "subresultado", "inicio-alt"];

export const mainColor = "#007bff";


/**
 * Hierarquia das páginas para determinar a direção da animação no botão voltar do navegador.
 * Nível menor -> Nível maior = Progressivo
 * Nível maior -> Nível menor = Regressivo
 */
export const hierarchy = {
  home: 0,
  "inicio-alt": 0,
  resultado: 1,
  subresultado: 2,
};
