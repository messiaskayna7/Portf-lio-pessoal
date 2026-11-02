(function () {
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const TEXTOS = window.TEXTOS;
  const PROJETOS = window.PROJETOS;
  let idioma = "pt";
  try { if (localStorage.getItem("idioma") === "en") idioma = "en"; } catch (e) {  }

  const t = (chave) => (TEXTOS[idioma] && TEXTOS[idioma][chave]) || TEXTOS.pt[chave] || "";

  function aplicarIdioma() {
    document.documentElement.lang = idioma === "en" ? "en" : "pt-BR";
    document.title = t("meta.titulo");
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((par) => {
        const [attr, chave] = par.split(":");
        el.setAttribute(attr, t(chave));
      });
    });
    document.querySelectorAll(".idioma [data-lang]").forEach((s) => s.classList.toggle("ativo", s.dataset.lang === idioma));
    if (projetoAberto) preencherProjeto(projetoAberto);
  }

  document.getElementById("idioma").addEventListener("click", () => {
    idioma = idioma === "pt" ? "en" : "pt";
    try { localStorage.setItem("idioma", idioma); } catch (e) {  }
    aplicarIdioma();
  });

  const trilha = document.getElementById("ferramentasTrilha");
  Array.from(trilha.children).forEach((item) => {
    const copia = item.cloneNode(true);
    copia.setAttribute("aria-hidden", "true");
    trilha.appendChild(copia);
  });

  const main = document.getElementById("paginas");
  const paginas = Array.from(main.querySelectorAll(".pagina"));
  const topo = document.getElementById("topo");
  const contador = document.getElementById("contador");
  const contadorAtual = document.getElementById("contadorAtual");
  const contadorBarra = document.getElementById("contadorBarra");
  const linksMenu = Array.from(document.querySelectorAll(".menu a"));
  const total = paginas.length;

  const copia = paginas[0].cloneNode(true);
  copia.removeAttribute("id");
  copia.classList.add("copia-inicio");
  copia.setAttribute("aria-hidden", "true");
  copia.inert = true;
  main.appendChild(copia);
  const todas = paginas.concat(copia);
  let pulando = false;

  function temaEm(posicao) {
    let tema = "claro";
    todas.forEach((p) => { if (p.offsetTop <= posicao) tema = p.dataset.tema; });
    return tema;
  }

  function atualizar() {
    const y = window.scrollY;
    const alturaTela = window.innerHeight;
    const inicioCopia = copia.offsetTop;

    if (!pulando && y >= inicioCopia - 1) {
      pulando = true;
      window.scrollTo({ top: Math.max(0, y - inicioCopia), behavior: "instant" });
      requestAnimationFrame(() => { pulando = false; atualizar(); });
      return;
    }

    const meio = y + alturaTela / 2;
    let indice = 0;
    todas.forEach((p, i) => { if (p.offsetTop <= meio) indice = i; });
    if (indice >= total) indice = 0;

    const topoContatos = paginas[total - 1].offsetTop;
    let fracao;
    if (y <= topoContatos) {
      fracao = 0.25 + 0.75 * (topoContatos ? y / topoContatos : 0);
    } else {
      fracao = 1 - 0.75 * Math.min(1, (y - topoContatos) / Math.max(1, inicioCopia - topoContatos));
    }
    contadorBarra.style.transform = `scaleX(${fracao.toFixed(4)})`;
    contadorAtual.textContent = String(indice + 1).padStart(2, "0");
    linksMenu.forEach((link, i) => link.classList.toggle("ativo", i === indice));

    topo.classList.toggle("escuro", temaEm(y + 60) === "escuro");
    contador.classList.toggle("escuro", temaEm(y + alturaTela - 50) === "escuro");
  }

  let agendado = false;
  function aoRolar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => { agendado = false; atualizar(); });
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRolar);

  const lista = document.getElementById("listaProjetos");
  const cards = Array.from(lista.querySelectorAll(".projeto"));
  const posicao = document.getElementById("projetosPos");

  function passo() {
    const gap = parseFloat(getComputedStyle(lista).columnGap) || 0;
    return cards[0].offsetWidth + gap;
  }
  function atualizarPosicao() {
    const atual = Math.round(lista.scrollLeft / passo()) + 1;
    posicao.textContent = `${Math.min(atual, cards.length)} / ${cards.length}`;
  }
  function moverProjetos(direcao) {
    const fim = lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 4;
    if (direcao > 0 && fim) lista.scrollTo({ left: 0, behavior: "smooth" });
    else if (direcao < 0 && lista.scrollLeft <= 4) lista.scrollTo({ left: lista.scrollWidth, behavior: "smooth" });
    else lista.scrollBy({ left: direcao * passo(), behavior: "smooth" });
  }
  document.getElementById("projetosAnterior").addEventListener("click", () => moverProjetos(-1));
  document.getElementById("projetosProximo").addEventListener("click", () => moverProjetos(1));
  lista.addEventListener("scroll", () => requestAnimationFrame(atualizarPosicao), { passive: true });
  window.addEventListener("resize", atualizarPosicao);

  let projetoAberto = null;
  let ultimoFoco = null;

  function abrirModal(modal) {
    ultimoFoco = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add("modal-aberto");
    requestAnimationFrame(() => modal.classList.add("visivel"));
    modal.querySelector(".modal-fechar").focus();
  }
  function fecharModal(modal) {
    modal.classList.remove("visivel");
    document.documentElement.classList.remove("modal-aberto");
    setTimeout(() => { modal.hidden = true; }, reduzirMovimento ? 0 : 300);
    if (modal.id === "modalProjeto") projetoAberto = null;
    if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
  }
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => { if (e.target.closest("[data-fechar]")) fecharModal(modal); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const aberto = document.querySelector(".modal:not([hidden])");
    if (aberto) fecharModal(aberto);
  });

  const modalProjeto = document.getElementById("modalProjeto");
  function preencherProjeto(chave) {
    const p = PROJETOS[chave];
    const txt = p[idioma] || p.pt;
    document.getElementById("mpTipo").textContent = txt.tipo;
    document.getElementById("mpTitulo").textContent = txt.titulo;
    document.getElementById("mpResumo").textContent = txt.resumo;
    document.getElementById("mpLista").innerHTML = txt.fiz.map((f) => `<li>${f}</li>`).join("");
    document.getElementById("mpTags").innerHTML = p.tags.map((tag) => `<li>${tag}</li>`).join("");
    document.getElementById("mpGaleria").innerHTML = p.imagens
      .map((src) => `<img src="${src}" alt="${txt.titulo}" loading="lazy">`).join("");
    document.getElementById("mpGaleria").dataset.qtd = p.imagens.length;
    document.getElementById("mpLinks").innerHTML = p.links.map((l) =>
      `<a class="botao botao-escuro" href="${l.url}" target="_blank" rel="noopener"><span>${l[idioma] || l.pt}</span>
        <svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg></a>`
    ).join("");
  }
  function abrirProjeto(chave) {
    projetoAberto = chave;
    preencherProjeto(chave);
    abrirModal(modalProjeto);
  }
  cards.forEach((card) => {
    card.addEventListener("click", () => abrirProjeto(card.dataset.projeto));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirProjeto(card.dataset.projeto); }
    });
  });

  const modalContato = document.getElementById("modalContato");
  const form = document.getElementById("formContato");
  const status = document.getElementById("formStatus");
  document.querySelectorAll("[data-abrir='contato']").forEach((b) => b.addEventListener("click", () => {
    status.textContent = "";
    status.className = "form-status";
    abrirModal(modalContato);
    setTimeout(() => form.elements.nome.focus(), 50);
  }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = form.elements.nome.value.trim();
    const email = form.elements.email.value.trim();
    const mensagem = form.elements.mensagem.value.trim();
    if (!nome || !mensagem || !form.elements.email.checkValidity() || !email) {
      status.textContent = t("form.faltando");
      status.className = "form-status erro";
      return;
    }
    const botao = form.querySelector("button[type=submit]");
    botao.disabled = true;
    status.textContent = t("form.enviando");
    status.className = "form-status";
    try {
      const resposta = await fetch("https://formsubmit.co/ajax/messiaskayna7@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nome, email, mensagem,
          _replyto: email,
          _subject: `Portfólio: mensagem de ${nome}`,
          _template: "table",
          _honey: form.elements._honey.value
        })
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok || String(dados.success) === "false") throw new Error(dados.message || "falha");
      status.textContent = t("form.ok");
      status.className = "form-status ok";
      form.reset();
    } catch (erro) {
      status.textContent = t("form.erro");
      status.className = "form-status erro";
    } finally {
      botao.disabled = false;
    }
  });

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduzirMovimento) {
    const artes = document.querySelectorAll(".hero-arte, .contato-arte");
    window.addEventListener("mousemove", (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 2;
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      artes.forEach((arte) => {
        arte.style.setProperty("--px", `${(-dx * 14).toFixed(1)}px`);
        arte.style.setProperty("--py", `${(-dy * 10).toFixed(1)}px`);
      });
    }, { passive: true });
  }

  function iniciarRevelar() {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((ent) => ent.target.classList.toggle("visivel", ent.isIntersecting));
    }, { threshold: 0.15 });
    document.querySelectorAll(".revelar").forEach((el) => observador.observe(el));
  }

  const abertura = document.getElementById("abertura");
  let inicio = performance.now();
  let encerrada = false;
  Promise.race([
    document.fonts ? document.fonts.load('1em "Medula One"') : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200))
  ]).then(() => { inicio = performance.now(); abertura.classList.add("pronta"); });

  function encerrarAbertura() {
    if (encerrada) return;
    encerrada = true;
    const espera = reduzirMovimento ? 0 : Math.max(0, 1600 - (performance.now() - inicio));
    setTimeout(() => {
      document.body.classList.remove("carregando");
      abertura.classList.add("saindo");
      iniciarRevelar();
      setTimeout(() => abertura.remove(), 900);
    }, espera);
  }
  window.addEventListener("load", encerrarAbertura);
  setTimeout(encerrarAbertura, 3500);

  aplicarIdioma();
  atualizar();
  atualizarPosicao();
})();
