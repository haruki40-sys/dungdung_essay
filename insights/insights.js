'use strict';
const buttons = document.querySelectorAll('[data-filter]');
const cards = [...document.querySelectorAll('.insights-quote-card')];
buttons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  cards.forEach(card => { card.hidden = selected !== '전체' && card.dataset.category !== selected; if (!card.hidden) count++; });
  document.querySelector('.insights-count').textContent = `${count}개의 한줄평`;
}));
