async function carregarSecao(id, arquivo) {
  const resposta = await fetch(arquivo);
  const html = await resposta.text();
  document.getElementById(id).innerHTML = html;
}

carregarSecao("inicio", "index/inicio/inicio.html");
carregarSecao("sobre", "index/sobre/sobre.html");
carregarSecao("projetos", "index/projetos/projetos.html");
carregarSecao("contato", "index/contato/contatos.html");