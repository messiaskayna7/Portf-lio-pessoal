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


const menuToggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');

if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuToggle.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Fecha o menu ao clicar em um link (mobile)
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Marca o link ativo do menu conforme a seção visível
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.menu a');

const setActiveLink = () => {
  let currentId = sections[0]?.id;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) {
      currentId = section.id;
    }
  });

  links.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
};

window.addEventListener('scroll', setActiveLink);
window.addEventListener('load', setActiveLink);
