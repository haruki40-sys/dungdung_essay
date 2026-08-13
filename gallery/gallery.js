const works = [...document.querySelectorAll('.artwork')].map((work) => ({
  src: work.querySelector('img').src,
  alt: work.querySelector('img').alt,
  title: work.querySelector('figcaption').textContent
}));

const lightbox = document.querySelector('.lightbox');
const image = lightbox.querySelector('img');
const caption = lightbox.querySelector('figcaption');
let current = 0;
let opener = null;

function show(index) {
  current = (index + works.length) % works.length;
  image.src = works[current].src;
  image.alt = works[current].alt;
  caption.textContent = works[current].title;
}

function openLightbox(index, button) {
  opener = button;
  show(index);
  lightbox.hidden = false;
  document.body.classList.add('has-lightbox');
  lightbox.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove('has-lightbox');
  opener?.focus();
}

document.querySelectorAll('.artwork button').forEach((button) => {
  button.addEventListener('click', () => openLightbox(Number(button.dataset.index), button));
});
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') show(current - 1);
  if (event.key === 'ArrowRight') show(current + 1);
});
