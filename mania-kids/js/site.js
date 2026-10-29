/* =========================================================
   Mania Kids - monta as vitrines a partir de dados/produtos.js

   Cada <div data-lista="meninas-2"> da página recebe os produtos
   cujo campo "pagina" é igual a "meninas-2".
   Os produtos são cadastrados pelo Gerenciador de Produtos:
   não é preciso editar este arquivo nem o HTML.
   ========================================================= */
(function () {
  "use strict";

  var LOJA = window.LOJA || { whatsapp: "", instagram: "" };
  var BASE = document.body.getAttribute("data-base") || "";
  var reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function brl(n) {
    return "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function linkWhats(mensagem) {
    return "https://wa.me/" + LOJA.whatsapp + "?text=" + encodeURIComponent(mensagem);
  }

  /* ---------- Links de contato (um só lugar: dados/loja.js) ---------- */
  function ligarContatos() {
    var zaps = document.querySelectorAll("a[data-whatsapp]");
    for (var i = 0; i < zaps.length; i++) {
      if (LOJA.whatsapp) zaps[i].href = linkWhats(zaps[i].getAttribute("data-whatsapp"));
    }
    var igs = document.querySelectorAll("a[data-instagram]");
    for (var j = 0; j < igs.length; j++) {
      if (LOJA.instagram) igs[j].href = "https://instagram.com/" + LOJA.instagram;
    }
  }

  /* ---------- Galeria com setas ---------- */
  function htmlGaleria(p, emOferta, pct) {
    var fotos = (p.fotos || []).filter(Boolean).slice(0, 3);
    var slides;
    if (fotos.length) {
      slides = fotos
        .map(function (f, i) {
          return (
            '<div class="galeria-slide"><img src="' + BASE + "img/produtos/" + encodeURI(f) + '" alt="' +
            esc(p.nome) + " - foto " + (i + 1) + " de " + fotos.length +
            '" width="640" height="800" loading="lazy" decoding="async"></div>'
          );
        })
        .join("");
    } else {
      slides = '<div class="galeria-slide galeria-emoji" aria-hidden="true">' + esc(p.emoji || "🛍️") + "</div>";
    }
    var controles = "";
    if (fotos.length > 1) {
      var pontos = fotos
        .map(function (_, i) {
          return '<span class="ponto' + (i === 0 ? " on" : "") + '"></span>';
        })
        .join("");
      controles =
        '<button type="button" class="seta seta-ant" aria-label="Foto anterior">&#8249;</button>' +
        '<button type="button" class="seta seta-prox" aria-label="Próxima foto">&#8250;</button>' +
        '<div class="galeria-pontos" aria-hidden="true">' + pontos + "</div>";
    }
    var selo = emOferta ? '<span class="desconto">' + pct + "% OFF</span>" : "";
    return (
      '<div class="galeria" role="group" aria-label="Fotos de ' + esc(p.nome) + '">' +
      selo + '<div class="galeria-faixa">' + slides + "</div>" + controles + "</div>"
    );
  }

  function ligarGaleria(gal) {
    var faixa = gal.querySelector(".galeria-faixa");
    var ant = gal.querySelector(".seta-ant");
    var prox = gal.querySelector(".seta-prox");
    if (!faixa || !ant || !prox) return;
    var pontos = gal.querySelectorAll(".ponto");
    var total = faixa.children.length;
    var comportamento = reduzMovimento ? "auto" : "smooth";

    function indice() {
      return Math.round(faixa.scrollLeft / faixa.clientWidth);
    }
    function ir(i) {
      faixa.scrollTo({ left: i * faixa.clientWidth, behavior: comportamento });
    }
    function atualizar() {
      var i = indice();
      for (var k = 0; k < pontos.length; k++) pontos[k].classList.toggle("on", k === i);
    }

    ant.addEventListener("click", function () {
      var i = indice();
      ir(i <= 0 ? total - 1 : i - 1);
    });
    prox.addEventListener("click", function () {
      var i = indice();
      ir(i >= total - 1 ? 0 : i + 1);
    });

    var pendente = false;
    faixa.addEventListener("scroll", function () {
      if (pendente) return;
      pendente = true;
      window.requestAnimationFrame(function () {
        pendente = false;
        atualizar();
      });
    });
  }

  /* ---------- Card de produto ---------- */
  function htmlCard(p, compacto) {
    var preco = Number(p.preco) || 0;
    var antigo = Number(p.precoAntigo) || 0;
    var emOferta = antigo > preco && preco > 0;
    var pct = emOferta ? Math.round((1 - preco / antigo) * 100) : 0;

    var mensagem = emOferta
      ? "Olá! Quero aproveitar a promoção: " + p.nome + " (cód. " + p.id + ") por " + brl(preco)
      : "Olá! Tenho interesse no produto: " + p.nome + " (cód. " + p.id + ")";
    var rotulo = emOferta ? "Aproveitar" : compacto ? "Consultar" : "Consultar produto";

    return (
      '<article class="produto-card' + (emOferta ? " oferta-card" : "") + '" id="' + esc(p.id) + '">' +
      htmlGaleria(p, emOferta, pct) +
      '<div class="produto-info">' +
      "<h3>" + esc(p.nome) + "</h3>" +
      "<p>" + esc(p.descricao) + "</p>" +
      '<span class="codigo">Cód. ' + esc(p.id) + "</span>" +
      (emOferta ? '<div class="preco-antigo">De ' + brl(antigo) + "</div>" : "") +
      '<span class="preco' + (emOferta ? " preco-promo" : "") + '">' + brl(preco) + "</span>" +
      '<a href="' + linkWhats(mensagem) + '" target="_blank" rel="noopener noreferrer" class="botao" aria-label="' +
      esc(rotulo) + " " + esc(p.nome) + ' pelo WhatsApp">' + rotulo + "</a>" +
      "</div></article>"
    );
  }

  function montarListas() {
    var todos = Array.isArray(window.PRODUTOS) ? window.PRODUTOS : null;
    var listas = document.querySelectorAll("[data-lista]");
    for (var i = 0; i < listas.length; i++) {
      var el = listas[i];
      if (!todos) {
        el.innerHTML = '<p class="vitrine-aviso">Não foi possível carregar os produtos agora. Fale conosco pelo WhatsApp!</p>';
        continue;
      }
      var chave = el.getAttribute("data-lista");
      var compacto = el.classList.contains("grid-mais");
      var itens = todos.filter(function (p) {
        return p.pagina === chave && p.ativo !== false;
      });
      if (!itens.length) {
        el.innerHTML = '<p class="vitrine-aviso">Novos produtos em breve. Acompanhe nossas novidades!</p>';
        continue;
      }
      el.innerHTML = itens.map(function (p) { return htmlCard(p, compacto); }).join("");
      var galerias = el.querySelectorAll(".galeria");
      for (var g = 0; g < galerias.length; g++) ligarGaleria(galerias[g]);
    }
  }

  ligarContatos();
  montarListas();
})();
