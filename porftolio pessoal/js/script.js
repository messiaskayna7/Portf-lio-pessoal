async function carregarSecao(id, arquivo) {
  const resposta = await fetch(arquivo);
  const html = await resposta.text();
  document.getElementById(id).innerHTML = html;
}

carregarSecao("inicio", "inicio.html");
carregarSecao("sobre", "sobre.html");
carregarSecao("projetos", "projetos.html");
carregarSecao("contato", "contatos.html");
