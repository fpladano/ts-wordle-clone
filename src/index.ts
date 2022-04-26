import { dictionary } from './utils/dictionary';
import { targetWords } from './utils/targetWords';

const WORD_LENGTH = 5;

const guessGrid = document.querySelector('[data-guess-grid]') as HTMLElement;

startInteraction();

function startInteraction() {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener('click', handleMouseClick);
  document.removeEventListener('keydown', handleKeyPress);
}

function handleMouseClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  if (target.matches('[data-key]') && target.dataset.key) {
    pressKey(target.dataset.key);
    return;
  }

  if (target.matches('[data-enter]')) {
    // submitGuess();
    return;
  }

  if (target.matches('[data-delete]')) {
    // deleteKey();
    return;
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    // submitGuess();
    return;
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    // deleteKey();
    return;
  }

  if (event.key.match(/^[a-z]$/)) {
    pressKey(event.key);
    return;
  }
}

function pressKey(key: string) {
  const activeTiles = getActiveFiles();
  if (activeTiles.length >= WORD_LENGTH) return;

  const nextTitle = guessGrid.querySelector(
    ':not([data-letter])',
  ) as HTMLElement;

  nextTitle.dataset.letter = key.toLowerCase();
  nextTitle.textContent = key;
  nextTitle.dataset.state = 'active';
}

function getActiveFiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}
