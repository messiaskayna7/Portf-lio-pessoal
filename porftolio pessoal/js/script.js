// Destaca o link do menu correspondente à seção visível na tela
const secoes = document.querySelectorAll("section");
const links = document.querySelectorAll(".menu a");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((link) => link.classList.remove("active"));
        const linkAtivo = document.querySelector(
          `.menu a[href="#${entry.target.id}"]`,
        );
        if (linkAtivo) linkAtivo.classList.add("active");
      }
    });
  },
  { threshold: 0.5 },
);

secoes.forEach((secao) => observer.observe(secao));
