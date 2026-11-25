/*
 * redirect.js
 * Ponto unico de redirecionamento da aplicacao.
 *
 * Qualquer elemento que precise levar o visitante para outra URL (checkout,
 * WhatsApp, paginas institucionais, etc.) deve ser marcado com
 * data-redirect="true" e ter href (ou data-dest) apontando para o destino.
 * Este arquivo intercepta o clique nesses elementos e chama
 * redirectWithParams(), que repassa 100% dos parametros atuais da URL
 * (utm_source, utm_campaign, fbclid, gclid, etc.) para o destino.
 *
 * Nao existe nenhum outro ponto do codigo que navegue via
 * location.href / location.assign / location.replace / window.open:
 * toda navegacao externa passa obrigatoriamente por aqui.
 */

function redirectWithParams(destination) {
  const currentParams = window.location.search;
  if (!currentParams) {
    window.location.href = destination;
    return;
  }
  if (destination.includes("?")) {
    window.location.href = destination + "&" + currentParams.substring(1);
  } else {
    window.location.href = destination + currentParams;
  }
}

(function () {
  function resolveDestination(el) {
    // data-dest tem prioridade sobre o href "visivel" (usado para hover,
    // clique com o botao do meio, abrir em nova aba, ou navegador sem JS).
    var dest = el.getAttribute('data-dest') || el.getAttribute('href');
    if (!dest) return dest;
    var qIndex = dest.indexOf('?');
    return qIndex === -1 ? dest : dest.slice(0, qIndex);
  }

  function onClick(e) {
    var el = e.currentTarget;
    var dest = resolveDestination(el);
    if (!dest || dest.charAt(0) === '#') return; // ancora interna, nao e redirecionamento
    e.preventDefault();
    redirectWithParams(dest);
  }

  function wire(root) {
    var links = (root || document).querySelectorAll('[data-redirect="true"]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].__redirectWired) continue;
      links[i].addEventListener('click', onClick);
      links[i].__redirectWired = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { wire(); });
  } else {
    wire();
  }

  // reexpoe wire() para outros scripts da pagina religarem elementos
  // criados/alterados dinamicamente, se precisar.
  window.__wireRedirectLinks = wire;
})();
